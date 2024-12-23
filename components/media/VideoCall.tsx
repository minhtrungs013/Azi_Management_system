'use client';
import React, { useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';



const VideoCall: React.FC = () => {
    const [username, setUsername] = useState('');
    const [callTo, setCallTo] = useState('');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    
    const socket = io("https://azi-api-nestjs.onrender.com/notifications", {
        extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
    });
    const config = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    const handleRegister = () => {
        socket.emit('register', username);
    };

    const handleCall = async () => {
        peerConnection.current = new RTCPeerConnection(config);

        // Thêm local stream
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { to: callTo, candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('call', { to: callTo, sdp: offer });
    };

    socket.on('offer', async ({ from, sdp }) => {
        peerConnection.current = new RTCPeerConnection(config);

        const remoteDesc = new RTCSessionDescription(sdp);
        await peerConnection.current.setRemoteDescription(remoteDesc);

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { to: from, candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { to: from, sdp: answer });
    });

    socket.on('answer', async ({ sdp }) => {
        const remoteDesc = new RTCSessionDescription(sdp);
        await peerConnection.current!.setRemoteDescription(remoteDesc);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
        if (peerConnection.current) {
            await peerConnection.current.addIceCandidate(candidate);
        }
    });

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

            <div>
                <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }}></video>
                <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }}></video>
            </div>
        </div>
    );
};

export default VideoCall;



