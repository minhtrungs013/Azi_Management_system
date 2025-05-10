'use client';
import React, { useRef, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const VideoCall: React.FC = () => {
    const [username, setUsername] = useState('');
    const [callTo, setCallTo] = useState('');
    const [test, setTest] = useState<RTCIceCandidateInit>();
    const [callStatus, setCallStatus] = useState('');
    const [incomingCall, setIncomingCall] = useState<{ from: string; signal: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useRef<Socket | null>(null);

    const config = {
        iceServers: [
            {
                urls: 'turn:my-turn-server.mycompany.com:19403',
                username: 'optional-username',
                credential: 'auth-token'
            }
        ]
    }
        ;

    useEffect(() => {
        // socket.current = io('http://localhost:5000');
        socket.current = io('https://azi-management-system-be.onrender.com');
        peerConnection.current = new RTCPeerConnection(config);
        peerConnection.current.ontrack = (event) => {
            console.log('Received remote track!', event);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket.current && callTo) {
                socket.current.emit('ice-candidate', {
                    to: callTo,
                    candidate: event.candidate,
                });
            }
        };

        socket.current.on('callIncoming', handleOffer);
        socket.current.on('callAccepted', handleAnswer);
        socket.current.on('ice-candidate', handleIceCandidate);
        socket.current.on('callEnded', handleCallEnded);

        return () => {
            socket.current?.disconnect();
            peerConnection.current?.close();
        };
    }, []);

    const handleRegister = () => {
        if (!socket.current) return;
        socket.current.emit('register', username);
        alert(`Registered as ${username}`);
    };

    const handleCall = async () => {
        if (!socket.current || !peerConnection.current) return;

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current!.emit('ice-candidate', {
                    to: callTo,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };
        console.log(peerConnection.current);
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.current.emit('callUser', {
            to: callTo,
            signalData: offer,
            from: socket.current.id,
            name: username,
        });

        setCallStatus('Calling...');
    };

    const handleOffer = async ({ from, signal }: { from: string; signal: RTCSessionDescriptionInit }) => {
        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection(config);
        }

        const remoteDesc = new RTCSessionDescription(signal);
        await peerConnection.current.setRemoteDescription(remoteDesc);

        setIncomingCall({ from, signal });
    };

    const joinCall = async () => {
        if (!incomingCall || !peerConnection.current || !socket.current) return;
        const { from, signal } = incomingCall;

        const remoteDesc = new RTCSessionDescription(signal);
        await peerConnection.current.setRemoteDescription(remoteDesc);

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => {
            peerConnection.current!.addTrack(track, localStream);
        });

        // 4. Create Answer
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current!.emit('ice-candidate', {
                    to: from,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.current.ontrack = (event) => {
            console.log('Received remote track!', event);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        socket.current.emit('answerCall', {
            to: from,
            signal: answer,
        });

        setIncomingCall(null);
        setCallStatus('In Call');
    };

    const handleAnswer = async ({ signal }: { signal: RTCSessionDescriptionInit }) => {

        if (!peerConnection.current) return;

        const state = peerConnection.current.signalingState;

        const remoteDesc = new RTCSessionDescription(signal);

        try {
            if (state === 'have-local-offer') {
                await peerConnection.current.setRemoteDescription(remoteDesc);
                setCallStatus('In Call');

            } else if (state === 'stable' && !peerConnection.current.remoteDescription) {
                await peerConnection.current.setRemoteDescription(remoteDesc);
                console.log("Remote description set manually in stable state");
                setCallStatus('In Call');
            } else {
                console.warn("Skipping setting remoteDescription, unexpected signaling state:", state);
            }
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        setTest(candidate);
        if (peerConnection.current) {
            if (peerConnection.current.remoteDescription) {
                try {
                    await peerConnection.current.addIceCandidate(candidate);
                    console.log("ICE Candidate added successfully");
                } catch (error) {
                    console.error("Error adding received ice candidate", error);
                }
            } else {
                console.log("Remote description is not set yet");
            }
        }
    };

    const handleEndCall = () => {
        if (!socket.current || !callTo) return;
        socket.current.emit('endCall', { to: callTo });
        setCallStatus('');
        peerConnection.current?.close();
        peerConnection.current = new RTCPeerConnection(config);
    };

    const handleCallEnded = () => {
        alert('Call ended by other user');
        setCallStatus('');
        peerConnection.current?.close();
        peerConnection.current = new RTCPeerConnection(config);
    };

    const declineCall = () => {
        setIncomingCall(null);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="space-x-2">
                <input
                    placeholder="Your Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border px-2 py-1"
                />
                <button onClick={handleRegister} className="bg-blue-500 text-white px-4 py-1 rounded">
                    Register
                </button>
            </div>

            <div className="space-x-2">
                <input
                    placeholder="Call To Username"
                    value={callTo}
                    onChange={(e) => setCallTo(e.target.value)}
                    className="border px-2 py-1"
                />
                <button onClick={handleCall} className="bg-green-500 text-white px-4 py-1 rounded">
                    Call
                </button>
                <button onClick={handleEndCall} className="bg-red-500 text-white px-4 py-1 rounded">
                    End
                </button>
            </div>

            {callStatus && <p>Status: {callStatus}</p>}

            {incomingCall && (
                <div className="bg-yellow-100 p-4 rounded">
                    <p>Incoming call from <strong>{incomingCall.from}</strong></p>
                    <button onClick={joinCall} className="bg-green-600 text-white px-3 py-1 rounded mr-2">
                        Accept
                    </button>
                    <button onClick={declineCall} className="bg-gray-400 text-white px-3 py-1 rounded">
                        Decline
                    </button>
                </div>
            )}

            <div className="flex gap-4 mt-4">
                <video ref={localVideoRef} autoPlay muted className="w-1/2 border rounded" />
                <video ref={remoteVideoRef} autoPlay className="w-1/2 border rounded" />
            </div>
        </div>
    );
};

export default VideoCall;
