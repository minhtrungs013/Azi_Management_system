'use client';
import { refreshNotification, updateNotification } from "@/lib/store/features/notificationSlice";
import { setRefresh } from "@/lib/store/features/projectSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { log } from "node:console";
import React, { createContext, useContext, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import { URL } from '@/lib/config/api';
import { config } from '@/lib/config/socketConfig';
import { ProjectDetails } from "@/types/project";
import { answerCall, setIncomingCall } from '@/lib/store/features/socialSlice';
import { setProjectId } from '@/lib/store/features/projectSlice';
interface SocketContextType {
    socket: Socket | undefined;
    sendMessage: (event: string, data: any) => void; // Hàm gửi dữ liệu
    handleGroupCall: (data: ProjectDetails) => void; // Hàm gửi dữ liệu
    handleGroupAnswer: (projectId: string) => void; // Hàm gửi dữ liệu
}

const SocketContext = createContext<SocketContextType>({
    socket: undefined,
    sendMessage: () => { }, // Hàm mặc định không làm gì
    handleGroupCall: () => { }, // Hàm mặc định không làm gì
    handleGroupAnswer: () => { }, // Hàm mặc định không làm gì
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [notification, setNotification] = useState<any>([])
    const authState = useSelector((state: RootState) => state.auth);
    const socialState = useSelector((state: RootState) => state.social);
    const dispatch = useDispatch<AppDispatch>();
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [peers, setPeers] = useState<Map<string, RTCPeerConnection | null>>(new Map());
    const [callStatus, setCallStatus] = useState('');
    // Kết nối socket chỉ một lần khi provider được mount
    useEffect(() => {
        const socketInstance = io('http://localhost:5000');
        // const socketInstance = io("https://azi-management-system-be.onrender.com");
        // Log khi kết nối socket thành công
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance?.id);
        });
        peerConnection.current = new RTCPeerConnection(config);
        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
            // setRemoteStreams((prev) => new Map(prev.set(event.streams[0].id, event.streams[0])));
        };


        // Log lỗi nếu kết nối thất bại
        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err);
        });
        socketInstance.emit("openConnect", { userId: authState.userId });

        socketInstance?.on('groupCallIncoming', handleIncomingCall);
        socketInstance?.on('groupCallAccepted', handleGroupAnswer);
        socketInstance?.on('groupIceCandidate', handleIceCandidate);
        socketInstance?.on('groupCallEnded', handleGroupCallEnded);
        socketInstance.on("sendNotification", ({ group, message }) => {
            setNotification([...notification, message])
        });
        socketInstance.on("sendNotification", ({ group, message }) => {
            toast.info(message, {
                position: "bottom-left",
                autoClose: 5000,
            });
            dispatch(setRefresh(true));
            dispatch(refreshNotification(true));
        });
        setSocket(socketInstance);


        // Dọn dẹp khi component unmount
        return () => {
            socketInstance?.disconnect();
        };
    }, []);  // Chạy một lần khi component mount

    // Hàm gửi dữ liệu qua socket
    const sendMessage = (event: string, data: any) => {
        if (socket) {
            socket.emit(event, data);

        } else {
            console.error("Socket is not connected");
        }
    };

    const handleGroupCall = async (data: ProjectDetails) => {
        if (!data?._id) {
            toast.error('Project ID is required to start a group call.');
            return;
        }
        if (!peerConnection.current) {
            toast.error('Project ID is required to start a group call.');
            return;
        }

        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }

            localStream.getTracks().forEach((track) => { peerConnection.current?.addTrack(track, localStream) });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket!.emit('groupIceCandidate', {
                        groupId: data?._id,
                        candidate: event.candidate,
                    });
                }
            };

            const offer = await peerConnection.current?.createOffer();
            await peerConnection.current?.setLocalDescription(offer!);

            socket?.emit('groupCall', { groupId: data._id, from: socket.id, signalData: offer });
            setCallStatus('Calling...');
            if (socket?.id && peerConnection.current) {
                setPeers((prev) => new Map(prev.set(typeof socket.id, peerConnection.current)));
            }
        } catch (error) {
            console.error('Error starting group call:', error);
            toast.error('Failed to start group call.');
        }

    }

    const handleIncomingCall = async ({ from, signal, socketId, groupId }: { from: string; signal: RTCSessionDescriptionInit, socketId: string, groupId: string }) => {
        console.log('from', from, 'socketId', socketId, groupId);

        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection(config);
        }
        const remoteDesc = new RTCSessionDescription(signal);
        peerConnection.current.setRemoteDescription;
        setPeers((prev) => new Map(prev.set(from, peerConnection.current)));

        dispatch(answerCall());
        dispatch(setIncomingCall({from, signal, socketId, groupId}));
        dispatch(setProjectId(groupId));
    };


    const handleGroupAnswer = async (projectId: string) => {
        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection(config);
        }

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach((track) => {
            peerConnection.current!.addTrack(track, localStream);
        });

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('groupIceCandidate', {
                    to: projectId,
                    candidate: event.candidate,
                });
            }
        };

        //  peerConnection.current.ontrack = (event) => {
        //     const stream = event.streams[0];
        //     setPeers((prev) => new Map(prev.set(from, stream)));
        // };

        // await  peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));

        // const answer = await pc.createAnswer();
        // await  peerConnection.current.setLocalDescription(answer);

        // setPeers((prev) => new Map(prev.set(from, pc)));

        // socket?.emit('acceptGroupCall', { to: from, signal: answer });
        // setCallStatus('In Call');

    };


    const handleGroupCallEnded = async () => {

    };
    const handleIceCandidate = async () => {

    };
    return (
        <SocketContext.Provider value={{ socket: socket, sendMessage, handleGroupCall, handleGroupAnswer }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
