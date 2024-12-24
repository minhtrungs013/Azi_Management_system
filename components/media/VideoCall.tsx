"use client";
import React, { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const VideoCall: React.FC = () => {
    const [username, setUsername] = useState("");
    const [callTo, setCallTo] = useState("");
    const [callStatus, setCallStatus] = useState("");
    const [incomingCall, setIncomingCall] = useState<{ from: string; sdp: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const socket = useRef<Socket | null>(null);
    const config = {
        iceServers: [{
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
            ],
        }],
    };

    useEffect(() => {
        socket.current = io("https://azi-api-nestjs.onrender.com/notifications", {
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        peerConnection.current = new RTCPeerConnection(config);

        socket.current.on("offer", handleOffer);
        socket.current.on("answer", handleAnswer);
        socket.current.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.current?.disconnect();
        };
    }, []);

    const handleRegister = () => {
        if (!socket.current) return;
        socket.current.emit("register", username);
        alert(`Registered as ${username}`);
    };

    const handleCall = async () => {
        if (!socket.current || !peerConnection.current) return;

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current?.emit("ice-candidate", { to: callTo, candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        const createAndSendOffer = async () => {
            const offer = await peerConnection.current!.createOffer();
            await peerConnection.current!.setLocalDescription(offer);
            socket.current?.emit("call", { to: callTo, sdp: offer });
            setCallStatus("Calling...");
        };

        await createAndSendOffer();

        let retryCount = 0;
        const maxRetries = 3;
        const retryInterval = 5000;

        const retryIfNeeded = () => {
            if (peerConnection.current?.iceConnectionState !== "connected" && retryCount < maxRetries) {
                retryCount++;
                createAndSendOffer();
                setTimeout(retryIfNeeded, retryInterval);
            }
        };

        setTimeout(retryIfNeeded, retryInterval);
    };

    const handleOffer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        setIncomingCall({ from, sdp });
    };

    const handleAnswer = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        if (peerConnection.current) {
            const remoteDesc = new RTCSessionDescription(sdp);
            await peerConnection.current.setRemoteDescription(remoteDesc);
            setCallStatus("In Call");
        }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (peerConnection.current && candidate) {
            try {
                await peerConnection.current.addIceCandidate(candidate);
            } catch (error) {
                console.error("Error adding received ice candidate", error);
            }
        }
    };

    const joinCall = async () => {
        if (!incomingCall || !socket.current || !peerConnection.current) return;
        const { from, sdp } = incomingCall;

        const remoteDesc = new RTCSessionDescription(sdp);
        await peerConnection.current.setRemoteDescription(remoteDesc);

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => peerConnection.current!.addTrack(track, localStream));

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current?.emit("ice-candidate", { to: from, candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        };

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.current.emit("answer", { to: from, sdp: answer });

        setIncomingCall(null);
        setCallStatus("In Call");
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
                <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }}></video>
                <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }}></video>
            </div>
        </div>
    );
};

export default VideoCall;
