'use client';
import { useSocket } from '@/contexts/SocketContext';
import { config } from '@/lib/config/socketConfig';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
const VideoCall: React.FC = () => {
    const [username, setUsername] = useState('');
    const [callTo, setCallTo] = useState('');
    const [callStatus, setCallStatus] = useState('');
    const [incomingCall, setIncomingCall] = useState<{ from: string; signal: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const { socket } = useSocket();

    useEffect(() => {
        peerConnection.current = new RTCPeerConnection(config);
        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        socket?.on('callIncoming', handleOffer);
        socket?.on('callAccepted', handleAnswer);
        socket?.on('ice-candidate', handleIceCandidate);
        socket?.on('callEnded', handleCallEnded);

        return () => {
            socket?.disconnect();
            peerConnection.current?.close();
        };
    }, [socket]);


    const handleRegister = () => {
        if (!socket) return;
        socket.emit('register', username);
        toast.success('Registered successfully!', {
            position: "top-right", 
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    const handleCall = async () => {
        if (!socket || !peerConnection.current) return;

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket!.emit('ice-candidate', {
                    to: callTo,
                    candidate: event.candidate,
                });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit('callUser', {
            to: callTo,
            signalData: offer,
            from: socket.id,
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
        if (!incomingCall || !peerConnection.current || !socket) return;
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
                socket!.emit('ice-candidate', {
                    to: from,
                    candidate: event.candidate,
                });
            }
        };

        socket.emit('answerCall', {
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

    const handleClearlocalStreamAndRemoteStream = () => {
        // Clear local video stream
        if (localVideoRef.current?.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        // Clear remote video stream
        if (remoteVideoRef.current?.srcObject) {
            const tracks = (remoteVideoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            remoteVideoRef.current.srcObject = null;
        }
    }

    const handleEndCall = () => {
        if (!socket || !callTo) return;
        socket.emit('endCall', { to: callTo });
        setCallStatus('');
        peerConnection.current?.close();
        peerConnection.current = new RTCPeerConnection(config);
        handleClearlocalStreamAndRemoteStream();
        toast.info('📞 Call ended.', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

    };

    const handleCallEnded = () => {
        
        setCallStatus('');
        peerConnection.current?.close();
        peerConnection.current = new RTCPeerConnection(config);
        setIncomingCall(null);
        handleClearlocalStreamAndRemoteStream();

        toast.warning('📞 The call has ended.', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
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
