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
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const { socket } = useSocket();
    let pendingCandidates: RTCIceCandidate[] = [];

    useEffect(() => {
        if (!socket) return;


        socket.on("incommingCall", async (offer: any) => {
            if (window.confirm("Incoming call. Accept?")) {
                joinCall(offer);
            } else {
                socket.emit("declineCall");
            }
        });

        socket.on("newParticipantJoinCall", async (offer: any) => {
            const pc = new RTCPeerConnection();

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

            // Set remote description and process pending ICE candidates
            await pc.setRemoteDescription(new RTCSessionDescription(offer.offer));

            pendingCandidates.forEach(async (candidate) => {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            });
            pendingCandidates = [];

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Update both ref and state
            peerConnectionRef.current = pc;
            setPeerConnection(pc);

            socket.emit("answer", answer);
        });

        socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
            const pc = peerConnectionRef.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } else {
                console.error("PeerConnection is null during 'answer' event.");
            }
        });

        socket.on("iceCandidate", async (candidate: any) => {
            const pc = peerConnectionRef.current;
            const iceCandidate = new RTCIceCandidate(candidate);

            if (pc) {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    try {
                        await pc.addIceCandidate(iceCandidate);
                    } catch (err) {
                        console.error("Error adding ICE candidate:", err);
                    }
                } else {
                    console.log("Remote description not set yet, storing candidate.");
                    pendingCandidates.push(iceCandidate);
                }
            } else {
                console.error("PeerConnection not initialized, storing ICE candidate.");
                pendingCandidates.push(iceCandidate); // Store ICE candidate until PeerConnection is initialized
            }
        });

        return () => {
            // Cleanup listeners when component unmounts
            socket.off("incommingCall");
            socket.off("newParticipantJoinCall");
            socket.off("answer");
            socket.off("iceCandidate");
        };
    }, [socket]);

    const startCall = async () => {
        if (!socket) return;

        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
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

        peerConnectionRef.current = pc;
        setPeerConnection(pc);

        socket.emit("startCall", { offer: offer, projectId: '66fbaf738d9864e3b8420736', callId: callId.current });
    };

    const joinCall = async (data: any) => {
        if (!socket) return;

        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
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

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        // Process pending candidates after PeerConnection is initialized
        pendingCandidates.forEach(async (candidate: any) => {
            try {
                await pc.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error adding pending ICE candidate:", err);
            }
        });
        pendingCandidates = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        peerConnectionRef.current = pc;
        setPeerConnection(pc);

        socket.emit("answer", { answer, callId: callId.current });
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
