'use client';
import React, { createContext, useContext, useRef, useEffect, useState } from "react";
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
    // Kết nối socket chỉ một lần khi provider được mount
    useEffect(() => {
        const socketInstance = io("http://192.168.188.71:2727/notifications", {
            extraHeaders: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        // Log khi kết nối socket thành công
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance?.id);
        });

        // Log lỗi nếu kết nối thất bại
        socketInstance.on("connect_error", (err) => {
            console.error("Connection error:", err);
        });
        socketInstance.emit("openConnect", { text: "Hello from the client!" });
        socketInstance.on("message", (message) => {
            setNotification([...notification, message])
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
