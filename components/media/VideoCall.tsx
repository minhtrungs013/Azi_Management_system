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
    let pendingCandidates: RTCIceCandidate[] = [];
    const { socket } = useSocket();
    if(socket) {
        socket.on("incommingCall", async (offer: any) => {
            if (window.confirm("Incoming call. Accept?")) {
                joinCall(offer)
            } else {
                socket.emit("declineCall");
            }
        });
    }
    useEffect(() => {
        if (!socket) return;
        // socket.on("incommingCall", async (offer: any) => {
        //     if (window.confirm("Incoming call. Accept?")) {
        //         joinCall(offer)
        //     } else {
        //         socket.emit("declineCall");
        //     }
        // });

        const handlerNewParticipantJoinCall = async (offer: any) => {
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

            // Set remote description and process pending ICE candidates
            await pc.setRemoteDescription(new RTCSessionDescription(offer.offer));
            pendingCandidates.forEach(async (candidate) => {
                await pc.addIceCandidate(candidate).catch((err) => console.error("Error adding ICE candidate:", err));
            });
            pendingCandidates = [];

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            setPeerConnection(pc);
            socket.emit("answer", answer);
        }

        const handlerAnswer = async (answer: RTCSessionDescriptionInit) => {
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        }

        const handleIceCandidate = async (candidate: any) => {
            console.log("peerConnection:", peerConnection);
            if (peerConnection) {
                if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate[0])).catch((err) =>
                        console.error("Error adding ICE candidate:", err)
                    );
                } else {
                    console.log("Remote description not set, storing candidate.");
                    pendingCandidates.push(new RTCIceCandidate(candidate[0]));
                }
            } else {
                console.error("PeerConnection not initialized, cannot add ICE candidate.");
            }

        };
        socket.on("newParticipantJoinCall", handlerNewParticipantJoinCall);
        socket.on("answer", handlerAnswer);

        // return () => {
        //     socket.off("newParticipantJoinCall", handlerNewParticipantJoinCall);
        //     socket.off("answer", handlerAnswer);
        //     socket.off("iceCandidate", handleIceCandidate);
        // };
    }, []);

    useEffect(() => {
        if (socket) {
            const handleIceCandidate = async (candidate: any) => {
                console.log("peerConnection:", peerConnection);
                if (peerConnection) {
                    if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate[0])).catch((err) =>
                            console.error("Error adding ICE candidate:", err)
                        );
                    } else {
                        console.log("Remote description not set, storing candidate.");
                        pendingCandidates.push(new RTCIceCandidate(candidate[0]));
                    }
                } else {
                    console.error("PeerConnection not initialized, cannot add ICE candidate.");
                }

            };

        socket.on("iceCandidate", handleIceCandidate);
        }
    }, [peerConnection])


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
        if (!socket) return;

        // Tạo PeerConnection với cấu hình STUN
        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };
        const pc = new RTCPeerConnection(configuration);


        // Xử lý ICE candidate
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                if (event.candidate.sdpMid && event.candidate.sdpMLineIndex !== null) {
                    socket.emit("iceCandidate", event.candidate, callId.current);
                } else {
                    console.error("Invalid ICE candidate received: ", event.candidate);
                }
            }
        };

        // Xử lý track nhận được từ remote
        pc.ontrack = (event: RTCTrackEvent) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Lấy stream từ camera/microphone
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // Thiết lập remote description bằng offer nhận được
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        // Tạo và thiết lập answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        setPeerConnection(pc);
        // Gửi answer cho người gọi
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
