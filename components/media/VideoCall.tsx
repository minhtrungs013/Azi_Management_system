'use client';
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const VideoCall = () => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [participants, setParticipants] = useState(["Me"]);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const callId = useRef<string>(uuidv4());
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

    const { socket } = useSocket();

    useEffect(() => {
        // WebSocket event listeners
        if (!socket) return;

        socket.on("incommingCall", (a: any) => {
            if (window.confirm("Incoming call. Accept?")) {
                joinCall(a);
            } else {
                socket.emit("declineCall");
            }
        });

        socket.on("newParticipantJoinCall", async (offer: any) => {
            console.log('New participant joins:', offer);

            const pc = new RTCPeerConnection();
            setPeerConnection(pc);

            pc.ontrack = (event: RTCTrackEvent) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Set remote description after receiving the offer
            await pc.setRemoteDescription(new RTCSessionDescription(offer.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("answer", answer);
        });

        socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on("iceCandidate", async (candidate: any) => {
            console.log(candidate);

            if (peerConnection && candidate && candidate[0]) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate[0]));
            }
        });
    }, [peerConnection, socket]);

    const startCall = async () => {
        if (!socket) return;
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);
    
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                // Kiểm tra nếu candidate có đầy đủ các trường cần thiết
                if (event.candidate.sdpMid && event.candidate.sdpMLineIndex !== null) {
                    socket.emit("iceCandidate", event.candidate, callId.current);
                } else {
                    console.error("Invalid ICE candidate received: ", event.candidate);
                }
            }
        };
    
        pc.ontrack = (event: RTCTrackEvent) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
    
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
    
        socket.emit("startCall", { offer: offer, projectId: '66fbaf738d9864e3b8420736', callId: callId.current });
    };
    
    const joinCall = async (a: any) => {
        if (!socket) return;
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        const pc = new RTCPeerConnection(configuration);
        setPeerConnection(pc);
    
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                // Kiểm tra nếu candidate có đầy đủ các trường cần thiết
                if (event.candidate.sdpMid && event.candidate.sdpMLineIndex !== null) {
                    socket.emit("iceCandidate", event.candidate, callId.current);
                } else {
                    console.error("Invalid ICE candidate received: ", event.candidate);
                }
            }
        };
    
        pc.ontrack = (event: RTCTrackEvent) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
    
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
    
        // Set remote description after receiving the offer
        await pc.setRemoteDescription(new RTCSessionDescription(a.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    
        socket.emit("answer", answer);
    };
    

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: "300px", height: "auto" }}></video>
            <video ref={remoteVideoRef} autoPlay style={{ width: "300px", height: "auto" }}></video>
            <button onClick={startCall}>Start Call</button>
        </div>
    );
};

export default VideoCall;