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
    const [isJoinCall, setIsJoinCall] = useState<boolean>(false);
    const [test, setTest] = useState<any>(null);
    let pendingCandidates: RTCIceCandidate[] = [];

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        let testpeerConnection = new RTCPeerConnection(configuration);
        socket.on("incommingCall", async (data: any) => {
            setTest(data)
            setIsJoinCall(true)
            console.log(data);
            
            // Kiểm tra trạng thái signalingState
            if (testpeerConnection.signalingState !== "stable") {
                console.warn("PeerConnection is not in a stable state, skipping setRemoteDescription.");
                return;
            }
        
            try {
                await testpeerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
                // Thực hiện việc xử lý ICE candidates đã lưu lại
                pendingCandidates.forEach(async (candidate) => {
                    try {
                        await testpeerConnection.addIceCandidate(candidate);
                    } catch (err) {
                        console.error("Error adding pending ICE candidate:", err);
                    }
                });
                pendingCandidates = [];
        
                setPeerConnection(testpeerConnection);
            } catch (error) {
                console.error("Error setting remote description:", error);
            }

        });

        socket.on("newParticipantJoinCall", async (offer: any) => {
            console.log("New participant joins:", offer);

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
        console.log(offer);

            // Set remote description and process pending ICE candidates
            await pc.setRemoteDescription(new RTCSessionDescription(offer.offer));
        console.log(offer, 'aa');

            pendingCandidates.forEach(async (candidate) => {
                await pc.addIceCandidate(candidate).catch((err) => console.error("Error adding ICE candidate:", err));
            });
            pendingCandidates = [];

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            setPeerConnection(pc);

            socket.emit("answer", answer);
        });

        socket.on("answer", async (answer: any) => {
            console.log(answer);

            if (!answer || !answer.type || !answer.sdp) {
                console.error("Invalid answer received:", answer);
                return;
            }

            if (testpeerConnection) {
                try {
                    await testpeerConnection.setRemoteDescription(new RTCSessionDescription(answer.answer));
                } catch (error) {
                    console.error("Error setting remote description:", error);
                }
            } else {
                console.error("PeerConnection is not initialized.");
            }
        });

        socket.on("iceCandidate", async (candidate: any) => {
            const iceCandidate = new RTCIceCandidate(candidate[0]);

            if (testpeerConnection) {
                if (
                    testpeerConnection.remoteDescription &&
                    testpeerConnection.remoteDescription.type
                ) {
                    try {
                        await testpeerConnection.addIceCandidate(iceCandidate);
                    } catch (err) {
                        console.error("Error adding ICE candidate:", err);
                    }
                } else {
                    console.log("Remote description not set, storing candidate.");
                    pendingCandidates.push(iceCandidate);
                }
            } else {
                console.error("PeerConnection not initialized, storing candidate.");
                pendingCandidates.push(iceCandidate);
            }
        });
    }, [peerConnection, socket]);
    console.log(peerConnection);

    const startCall = async () => {
        if (!socket) return;
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        const pc = new RTCPeerConnection(configuration);

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

        setPeerConnection(pc);

        socket.emit("startCall", { offer: offer, projectId: '66fbaf738d9864e3b8420736', callId: callId.current });
    };

    const joinCall = async (data: any) => {
        if (!socket || !data) return;
        console.log("peerConnection state: ", peerConnection);
        let pc = peerConnection ?? new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
    
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                socket.emit("iceCandidate", event.candidate, callId.current);
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
    
        // Set remote description
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    
        // Add any pending candidates
        pendingCandidates.forEach(async (candidate) => {
            try {
                await pc.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error adding pending ICE candidate:", err);
            }
        });
        pendingCandidates = [];
    
        // Create and send the answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
    console.log(data);
    
        setPeerConnection(pc);
        socket.emit("joinCall", { from: data.from , projectId: '66fbaf738d9864e3b8420736', callId: callId.current });
        socket.emit("answer", {
            type: pc.localDescription?.type,
            sdp: pc.localDescription?.sdp,
            offer: data.offer,
            callId: callId.current
        });
    };


    return (
        <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: "300px", height: "auto" }}></video>
            <video ref={remoteVideoRef} autoPlay style={{ width: "300px", height: "auto" }}></video>
            {!isJoinCall ?
                <button onClick={startCall}>Start Call</button>
                :
                <button onClick={() => joinCall(test)}> join Call</button>
            }

        </div>
    );
};

export default VideoCall;
