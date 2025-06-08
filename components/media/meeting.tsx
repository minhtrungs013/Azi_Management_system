'use client';
import { useSocket } from '@/contexts/SocketContext';
import { config } from '@/lib/config/socketConfig';
import { ProjectDetails } from '@/types/project';
import { FileCheck2, Mic, MicIcon, Phone, User, VideoIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';
const Meeting = ({ closeModal, data }: { closeModal: () => void, data: ProjectDetails | undefined }) => {
    const [username, setUsername] = useState('');
    const [callTo, setCallTo] = useState('');
    const [callStatus, setCallStatus] = useState('');
    const [incomingCall, setIncomingCall] = useState<{ from: string; signal: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [peers, setPeers] = useState<Map<string, RTCPeerConnection | null>>(new Map());
    const { socket } = useSocket();
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

    // useEffect(() => {
    //     peerConnection.current = new RTCPeerConnection(config);
    //     peerConnection.current.ontrack = (event) => {
    //         if (remoteVideoRef.current) {
    //             remoteVideoRef.current.srcObject = event.streams[0];
    //         }
    //         setRemoteStreams((prev) => new Map(prev.set(event.streams[0].id, event.streams[0])));
    //     };


    //     socket?.on('groupCallIncoming', handleIncomingCall);
    //     socket?.on('groupCallAccepted', handleGroupAnswer);
    //     socket?.on('groupIceCandidate', handleIceCandidate);
    //     socket?.on('groupCallEnded', handleGroupCallEnded);
    //     setPeers(new Map());
    //     return () => {
    //         socket?.disconnect();
    //         peerConnection.current?.close();
    //     };
    // }, [socket]);

    // const handleGroupCall = async () => {
    //     if (!data?._id) {
    //         toast.error('Project ID is required to start a group call.');
    //         return;
    //     }
    //     if (!peerConnection.current) {
    //         toast.error('Project ID is required to start a group call.');
    //         return;
    //     }

    //     try {
    //         const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //         if (localVideoRef.current) {
    //             localVideoRef.current.srcObject = localStream;
    //         }

    //         localStream.getTracks().forEach((track) => { peerConnection.current?.addTrack(track, localStream) });

    //         peerConnection.current.onicecandidate = (event) => {
    //             if (event.candidate) {
    //                 socket!.emit('groupIceCandidate', {
    //                     groupId: data?._id,
    //                     candidate: event.candidate,
    //                 });
    //             }
    //         };

    //         const offer = await peerConnection.current?.createOffer();
    //         await peerConnection.current?.setLocalDescription(offer!);

    //         socket?.emit('groupCall', { groupId: data._id, from: socket.id, signalData: offer });
    //         setCallStatus('Calling...');
    //         if (socket?.id && peerConnection.current) {
    //             setPeers((prev) => new Map(prev.set(typeof socket.id, peerConnection.current)));
    //         }
    //     } catch (error) {
    //         console.error('Error starting group call:', error);
    //         toast.error('Failed to start group call.');
    //     }

    // }

    // const handleIncomingCall = async ({ from, signal, socketId }: { from: string; signal: RTCSessionDescriptionInit, socketId: string }) => {
    // console.log('from', from, 'socketId', socketId);

    //     if (!peerConnection.current) {
    //         peerConnection.current = new RTCPeerConnection(config);
    //     }
    //     const remoteDesc = new RTCSessionDescription(signal);
    //     await peerConnection.current.setRemoteDescription;

    //     setPeers((prev) => new Map(prev.set(from, peerConnection.current)));
    // };


    // const handleGroupAnswer = async () => {
    //     // if (!peerConnection.current) {
    //     //     peerConnection.current = new RTCPeerConnection(config);
    //     // }

    //     // const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //     // if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    //     // localStream.getTracks().forEach((track) => {
    //     //     peerConnection.current!.addTrack(track, localStream);
    //     // });

    //     //  peerConnection.current.onicecandidate = (event) => {
    //     //     if (event.candidate) {
    //     //         socket?.emit('groupIceCandidate', {
    //     //             to: data?._id,
    //     //             candidate: event.candidate,
    //     //         });
    //     //     }
    //     // };

    //     //  peerConnection.current.ontrack = (event) => {
    //     //     const stream = event.streams[0];
    //     //     setRemoteStreams((prev) => new Map(prev.set(from, stream)));
    //     // };

    //     // await  peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));

    //     // const answer = await pc.createAnswer();
    //     // await  peerConnection.current.setLocalDescription(answer);

    //     // setPeers((prev) => new Map(prev.set(from, pc)));

    //     // socket?.emit('acceptGroupCall', { to: from, signal: answer });
    //     // setCallStatus('In Call');

    // };

   
    // const handleGroupCallEnded = async () => {

    // };
    // const handleIceCandidate = async () => {

    // };




    return (
        <div className='bg-gradient-to-b from-[#1a1a29] to-[#0c0c12]  flex flex-col items-center justify-center p-4 '>
            <div className="w-11/12 min-w-[1200px] max-w-[1400px]">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center justify-center cursor-default">
                        <div className="w-10 h-10 rounded-full bg-[#1f1f2f] flex items-center justify-center mr-2">
                            <User className="text-white text-9xl" />
                        </div>
                        <div>
                            <p className='text-white'>Meeting </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">

                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative bg-[#252836] rounded-md aspect-video flex items-center justify-center">
                        <div className="absolute top-2 right-2 text-white cursor-pointer">
                            <i className="fas fa-expand-arrows-alt"></i>
                        </div>
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border border-[#2f8e2f]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#5a5a6f] flex items-center justify-center">
                                <User className="text-white text-9xl" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-[#2f8e2f]"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 text-[#7a7a8f] text-xs select-none">Username 1</div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1f1f2f] flex items-center justify-center cursor-pointer">
                            <MicIcon className="text-white text-xs" />
                        </div>
                    </div>

                    <div className="relative bg-[#252836] rounded-md aspect-video flex items-center justify-center">
                        <div className="absolute top-2 right-2 text-white cursor-pointer">
                            <i className="fas fa-expand-arrows-alt"></i>
                        </div>
                        <div className="w-20 h-20  rounded-full bg-[#5a5a6f] flex items-center justify-center">
                            <User className="text-white text-9xl" />
                        </div>
                        <div className="absolute bottom-2 left-2 text-[#7a7a8f] text-xs select-none">Username 3</div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#d92a2a] flex items-center justify-center cursor-pointer">
                            <MicIcon className="text-white text-xs" />
                        </div>
                    </div>

                    <div className="relative bg-[#252836] rounded-md aspect-video flex items-center justify-center">
                        <div className="absolute top-2 right-2 text-white cursor-pointer">
                            <i className="fas fa-expand-arrows-alt"></i>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-[#5a5a6f] flex items-center justify-center">
                            <User className="text-white text-9xl" />
                        </div>
                        <div className="absolute bottom-2 left-2 text-[#7a7a8f] text-xs select-none">Username 2</div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#d92a2a] flex items-center justify-center cursor-pointer">
                            <MicIcon className="text-white text-xs" />
                        </div>
                    </div>

                    <div className="relative bg-[#252836] rounded-md aspect-video flex items-center justify-center">
                        <div className="absolute top-2 right-2 text-white cursor-pointer">
                            <i className="fas fa-expand-arrows-alt"></i>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-[#5a5a6f] flex items-center justify-center">
                            <User className="text-white text-9xl" />
                        </div>
                        <div className="absolute bottom-2 left-2 text-[#7a7a8f] text-xs select-none">Username 4</div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#d92a2a] flex items-center justify-center cursor-pointer">
                            <MicIcon className="text-white text-xs" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center space-x-6 mt-6">
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-user-friends"></i>
                    </button>
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-volume-up"></i>
                    </button>
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-comment"></i>
                    </button>
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-user-friends"></i>
                    </button>
                </div>

                <div className="flex justify-center items-center space-x-6 mt-6">
                    <button className="w-14 h-14 rounded-full bg-[#2f8e2f] flex items-center justify-center text-white text-2xl cursor-pointer">
                        <Mic className="text-white" />
                    </button>
                    <button className="w-14 h-14 rounded-full bg-[#d98a0a] flex items-center justify-center text-white text-2xl cursor-pointer">
                        <VideoIcon className="text-white" />
                    </button>
                    <button className="w-14 h-14 rounded-full bg-[#d92a2a] flex items-center justify-center text-white text-2xl cursor-pointer">
                        <Phone className="text-white" />
                    </button>
                </div>

                <div className="flex justify-center items-center space-x-6 mt-6">
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-upload"></i>
                    </button>
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-cog"></i>
                    </button>
                    <button className="text-white text-xl cursor-pointer">
                        <i className="fas fa-user"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Meeting;
