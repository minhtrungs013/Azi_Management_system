'use client';
import Modal from '@/components/Modal/Modal';
import { ProjectDetails } from '@/types/project';
import { ArrowDownWideNarrow, CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react';
import CreateTask from './createTask';

export default function ProjectHeader({ data }: { data: ProjectDetails | undefined }) {
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const list = data?.lists.find((list) => list.name === 'TO DO' )
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div>
            <header className="flex items-center justify-between mb-6">
                <div >
                    <input type="text" defaultValue={data?.name} className="text-3xl  font-bold p-2" disabled />
                    <p className='pl-2 text-sm pt-3'>{data?.description}</p>
                </div>
                <div>
                    <div className='flex'>
                        <div className='flex items-center rounded-md p-2 border cursor-pointer shadow-md text-purple-600 mr-3'>
                            <Plus className="w-4 h-4 mr-2" />
                            <button className='text-purple-600 font-semibold'> Invite</button>
                        </div>
                        <div className="flex -space-x-4">
                            <img src="https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg" alt="Avatar 1" className="h-10 w-10 rounded-full border-2 border-gray-100" />
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s87zYsrB1nvFfUvNPUJm6KlFP5wIYz0Nxg&s" alt="Avatar 2" className="h-10 w-10 rounded-full border-2 border-gray-100" />
                            <img src="https://img.pikbest.com/ai/illus_our/20230418/64e0e89c52dec903ce07bb1821b4bcc8.jpg!w700wp" alt="Avatar 3" className="h-10 w-10 rounded-full border-2 border-gray-100" />
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGMvEQPKYQhv8HGhKYOzgvYTRcnWeHw_H0gg&s" alt="Avatar 4" className="h-10 w-10 rounded-full border-2 border-gray-100" />
                            {/* <!-- Additional avatar circle for +2 --> */}
                            <div className="h-10 w-10 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-sm border-2 border-white">
                                +2
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex space-x-2 justify-between">
                <div className='flex'>
                    <button className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Filter <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                    <button className="px-4 py-2 bg-white border rounded-md flex items-center">Today <CalendarDays className="w-4 h-4 ml-2" /></button>
                </div>
                <div className='flex'>
                    <button onClick={openModal} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                    <button className="px-4 py-2 bg-white border rounded-md flex items-center">Create Column <CalendarDays className="w-4 h-4 ml-2" /></button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <CreateTask closeModal={closeModal} listId={list?._id }/>
            </Modal>
        </div>
    )
}
