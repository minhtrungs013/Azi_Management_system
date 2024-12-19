'use client';
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

interface RemoteStreams {
    [userId: string]: MediaStream;
}

export default function VideoCall() {
    const [myStream, setMyStream] = useState<MediaStream | null>(null); // Video của mình
    const [remoteStreams, setRemoteStreams] = useState<RemoteStreams>({}); // Video của những người khác
    const roomId = 'test-room'; // Phòng cố định
    const localVideoRef = useRef<HTMLVideoElement | null>(null); // Video của mình
    const remoteVideoRefs = useRef<{ [key: string]: RTCPeerConnection }>({}); // Video của các user khác
    const socket = io("https://azi-api-nestjs.onrender.com/notifications", {
        extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });
    // const { socket } = useSocket();
    useEffect(() => {
        // if (!socket) return
        // Lấy quyền truy cập camera và microphone
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setMyStream(stream); // Lưu stream của mình
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream; // Gán stream cho thẻ video của mình
                }

                socket.emit('join-room', roomId); // Gửi yêu cầu tham gia phòng

                // Khi có người dùng mới tham gia
                socket.on('user-connected', (userId: string) => {
                    const peerConnection = createPeerConnection(userId);
                    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
                });

                // Xử lý khi nhận tín hiệu signaling
                socket.on('signal', async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit | RTCIceCandidate }) => {
                    if (!remoteVideoRefs.current[from]) {
                        const peerConnection = createPeerConnection(from);
                        remoteVideoRefs.current[from] = peerConnection;
                    }
                    const peerConnection = remoteVideoRefs.current[from];
                    if ((signal as RTCSessionDescriptionInit).type === 'offer') {
                        await peerConnection.setRemoteDescription(signal as RTCSessionDescriptionInit);
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        socket.emit('signal', { roomId, signal: answer });
                    } else if ((signal as RTCSessionDescriptionInit).type === 'answer') {
                        await peerConnection.setRemoteDescription(signal as RTCSessionDescriptionInit);
                    } else if ((signal as RTCIceCandidate).candidate) {
                        peerConnection.addIceCandidate(signal as RTCIceCandidate);
                    }
                });

                // Khi có người rời phòng
                socket.on('user-disconnected', (userId: string) => {
                    if (remoteVideoRefs.current[userId]) {
                        remoteVideoRefs.current[userId].close();
                        delete remoteVideoRefs.current[userId];
                        setRemoteStreams((prev) => {
                            const newStreams = { ...prev };
                            delete newStreams[userId];
                            return newStreams;
                        });
                    }
                });
            });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Tạo kết nối WebRTC với một người dùng
    const createPeerConnection = (userId: string): RTCPeerConnection => {
        const peerConnection = new RTCPeerConnection();
        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate && socket) {
                socket.emit('signal', { roomId, signal: event.candidate });
            }
        };

        peerConnection.ontrack = (event: RTCTrackEvent) => {
            setRemoteStreams((prev) => ({
                ...prev,
                [userId]: event.streams[0],
            }));
        };

        remoteVideoRefs.current[userId] = peerConnection;
        return peerConnection;
    };
console.log(remoteStreams);

    return (
        <div>
            <h1>Video Call</h1>
            <video ref={localVideoRef} autoPlay muted style={{ width: '300px', border: '1px solid black' }}></video>
            <div>
                {Object.keys(remoteStreams).map((userId) => (
                    <video
                        key={userId}
                        autoPlay
                        ref={(ref) => {
                            if (ref && remoteStreams[userId]) ref.srcObject = remoteStreams[userId];
                        }}
                        style={{ width: '300px', border: '1px solid black' }}
                    ></video>
                ))}
            </div>
        </div>
    );
}
