'use client';
import { MicIcon, Phone, PhoneOff, User, VideoIcon, Volume2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocket } from '@/contexts/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
const AnswerCall = ({ closeModal }: { closeModal: () => void }) => {
    const projectState = useSelector((state: RootState) => state.project);
    const { handleGroupAnswer } = useSocket();

    
    const handleEndCall = () => {
        closeModal()
    }

     const handleJoinCall = () => {
        if(projectState.projectId){
            handleGroupAnswer(typeof projectState.projectId)
        } 
    }

    return (
        <div className="flex flex-col items-center space-y-5 min-w-[500px] bg-white p-5 rounded-xl">
            <div className="w-32 h-32 rounded-full border-4 border-gray-200 flex items-center justify-center">
                {/* <User className="fas fa-user-circle text-gray-200 text-[100px] w-[82px] h-[69px]" /> */}
                <Avatar className=' w-[120px] h-[120px]'>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
            <div className='mt-1'>
                <p>Group A Call You</p>
            </div>
            <div className="flex space-x-6">
                {/* <button
                    className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#2f333a] text-xl"
                    aria-label="Mute"
                >
                    <Volume2 className="fas fa-volume-up" />
                </button> */}
                <button
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl"
                    aria-label="End call"
                    onClick={handleEndCall}
                >
                    <PhoneOff className="fas fa-phone" />
                </button>
                <button
                    className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#2f333a] text-xl"
                    aria-label="Microphone"
                >
                    <MicIcon className="fas fa-microphone" />
                </button>
                <button
                    className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#2f333a] text-xl"
                    aria-label="Video"
                >
                    <VideoIcon className="fas fa-video" />
                </button>

                <button
                    className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl"
                    aria-label="End call"
                    onClick={handleJoinCall}
                >
                    <Phone className="fas fa-phone" />
                </button>

            </div>
        </div>
    );
};

export default AnswerCall;
