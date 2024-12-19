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

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setMyStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socket.emit('join-room', roomId);

                socket.on('user-connected', (userId: string) => {
                    console.log(`User connected: ${userId}`);
                    const peerConnection = createPeerConnection(userId);
                    myStream?.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));
                });

                socket.on('signal', async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit | RTCIceCandidate }) => {
                    console.log(`Received signal from ${from}:`, signal);

                    if (!remoteVideoRefs.current[from]) {
                        const peerConnection = createPeerConnection(from);
                        remoteVideoRefs.current[from] = peerConnection;
                    }

                    const peerConnection = remoteVideoRefs.current[from];

                    if (signal && (signal as RTCSessionDescriptionInit).type) {
                        const type = (signal as RTCSessionDescriptionInit).type;
                        console.log(`Signal type: ${type}`);

                        if (type === 'offer') {
                            await peerConnection.setRemoteDescription(signal as RTCSessionDescriptionInit);
                            const answer = await peerConnection.createAnswer();
                            await peerConnection.setLocalDescription(answer);
                            socket.emit('signal', { roomId, signal: answer });
                        } else if (type === 'answer') {
                            await peerConnection.setRemoteDescription(signal as RTCSessionDescriptionInit);
                        }
                    } else if ((signal as RTCIceCandidate).candidate) {
                        peerConnection.addIceCandidate(signal as RTCIceCandidate);
                    }
                });

                socket.on('user-disconnected', (userId: string) => {
                    console.log(`User disconnected: ${userId}`);
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

    const createPeerConnection =  (userId: string): RTCPeerConnection => {
        console.log('Creating peer connection for user:', userId);
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302', // STUN server example
                },
                // You can add TURN server here if needed
            ],
        });
        // createOffer(peerConnection);
        
        peerConnection.addEventListener('icecandidate', event =>  {
            console.log("ICE Candidate Event:", event.candidate);
            if (event.candidate) {
                socket.emit('signal', { roomId, signal: event.candidate });
            }
        });
        
        peerConnection.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", peerConnection.iceGatheringState);
        };
    
        peerConnection.ontrack = (event: RTCTrackEvent) => {
            console.log('Received track event:', event.streams[0]);
            setRemoteStreams((prev) => ({
                ...prev,
                [userId]: event.streams[0],
            }));
        };
    
        remoteVideoRefs.current[userId] = peerConnection;
    
        return peerConnection;
    };
    const createOffer = async (peerConnection: RTCPeerConnection) => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('signal', { roomId, signal: offer });
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
