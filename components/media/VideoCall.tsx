'use client';
import React, { useRef, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { log } from 'util';

const VideoCall: React.FC = () => {
    const [username, setUsername] = useState('');
    const [callTo, setCallTo] = useState('');
    const [callStatus, setCallStatus] = useState(''); // Trạng thái cuộc gọi
    const [incomingCall, setIncomingCall] = useState<{ from: string; sdp: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const socket = useRef<Socket | null>(null);
    const config = {
        iceServers: [{
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
            ]
        }],
    };

    // Kết nối socket khi component mount
    useEffect(() => {
        socket.current = io("https://azi-api-nestjs.onrender.com/notifications", {
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        peerConnection.current = new RTCPeerConnection(config);
        // Lắng nghe các sự kiện socket
        socket.current.on('offer', handleOffer);
        socket.current.on('answer', handleAnswer);
        socket.current.on('ice-candidate', handleIceCandidate);
        socket.current.on('request-media', handleRequestMedia);

        return () => {
            // Hủy kết nối socket khi component unmount
            socket.current?.disconnect();
        };
    }, []);

    const handleRegister = () => {
        if (!socket.current) return;
        socket.current.emit('register', username);
        alert(`Registered as ${username}`);
    };
    console.log(peerConnection);

    const handleCall = async () => {
        if (!socket.current) return;
        if (!peerConnection.current) return console.log('peer not connection');

        // peerConnection.current = new RTCPeerConnection(config);

        // Thêm local stream
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (socket.current && event.candidate) {
                const candidateData = { to: callTo, candidate: event.candidate };
                console.log("Socket sẵn sàng, gửi ICE candidate");
                socket.current.emit('ice-candidate', candidateData);
            } else {
                console.log("Socket chưa sẵn sàng, retry sau 1 giây");
            };
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.current.emit('call', { to: callTo, sdp: offer });

        setCallStatus('Calling...');
    };

    const handleOffer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        setIncomingCall({ from, sdp });
    };

    const handleAnswer = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        const remoteDesc = new RTCSessionDescription(sdp);
        await peerConnection.current!.setRemoteDescription(remoteDesc);
        setCallStatus('In Call');
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        console.log('handleIceCandidate', candidate);

        if (peerConnection.current && candidate) {
            try {
                await peerConnection.current.addIceCandidate(candidate);
            } catch (error) {
                console.error("Error adding received ice candidate", error);
            }
        } else {
            console.log('không nhận');

        }
    };

    // Xử lý yêu cầu gửi lại media khi B chưa nhận được
    const handleRequestMedia = async ({ to }: { to: string }) => {
        if (peerConnection.current && !remoteVideoRef.current?.srcObject) {
            console.log("B yêu cầu A gửi lại media.");

            // Lấy lại local stream
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

            localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

            // Tạo offer mới và gửi lại media cho B
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.current?.emit('call', { to, sdp: offer });
        }
    };

    const joinCall = async () => {
        if (!incomingCall || !socket.current || !peerConnection.current) return;
        console.log('Joining call with peer connection', peerConnection.current);

        const { from, sdp } = incomingCall;
        const remoteDesc = new RTCSessionDescription(sdp);
        await peerConnection.current.setRemoteDescription(remoteDesc);
        console.log('Set remote description');

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (socket.current && event.candidate) {
                console.log("Socket sẵn sàng, gửi ICE candidate", event.candidate);
                const candidateData = { to: from, candidate: event.candidate };
                socket.current.emit('ice-candidate', candidateData);
            }
        };

        // Kiểm tra ontrack lại lần nữa
        peerConnection.current.addEventListener('track', (event) => {
            console.log("Track added", event);
            if (event.streams && event.streams.length > 0) {
                const remoteStream = event.streams[0];
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            }
        });

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit('answer', { to: from, sdp: answer });

        setIncomingCall(null);
        setCallStatus('In Call');
    };

    const declineCall = () => {
        setIncomingCall(null);
    };

    return (
        <div>
            <div>
                <input
                    placeholder="Your Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={handleRegister}>Register</button>
            </div>

            <div>
                <input
                    placeholder="Call To Username"
                    value={callTo}
                    onChange={(e) => setCallTo(e.target.value)}
                />
                <button onClick={handleCall}>Call</button>
            </div>

            {callStatus && <p>Status: {callStatus}</p>}

            {incomingCall && (
                <div>
                    <p>{`Incoming call from ${incomingCall.from}`}</p>
                    <button onClick={joinCall}>Accept</button>
                    <button onClick={declineCall}>Decline</button>
                </div>
            )}

            <div>
                <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }}></video>
                <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }}></video>
            </div>
        </div>
    );
};

export default VideoCall;