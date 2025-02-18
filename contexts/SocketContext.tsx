'use client';
import { refreshNotification, updateNotification } from "@/lib/store/features/notificationSlice";
import { setRefresh } from "@/lib/store/features/projectSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { log } from "node:console";
import React, { createContext, useContext, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | undefined;
    sendMessage: (event: string, data: any) => void; // Hàm gửi dữ liệu
}

const SocketContext = createContext<SocketContextType>({
    socket: undefined,
    sendMessage: () => { }, // Hàm mặc định không làm gì
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [notification, setNotification] = useState<any>([])
    const authState = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    // Kết nối socket chỉ một lần khi provider được mount
    useEffect(() => {
        const socketInstance = io("http://localhost:5000");
        // const socketInstance = io("https://azi-management-system-be.onrender.com");
        // Log khi kết nối socket thành công
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance?.id);
        });

        // Log lỗi nếu kết nối thất bại
        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err);
        });
        socketInstance.emit("openConnect", { userId: authState.userId });
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

    return (
        <SocketContext.Provider value={{ socket: socket, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
