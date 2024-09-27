"use client"
import { FolderOpenDot, Plus } from 'lucide-react';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import CreateOrUpdateProjectForm from './createOrUpdateProjectForm';

const Toolbar = () => {
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div className='flex justify-between items-center mb-10'>
            <div className='flex items-center text-purple-600 font-semibold'>
                <FolderOpenDot className="w-7 h-7 mr-2" />
                <h3>Project Management</h3>
            </div>
            <div onClick={openModal} className='flex items-center rounded-md p-2 border cursor-pointer shadow-md text-purple-600 mr-3'>
                <Plus className="w-4 h-4 mr-2" />
                <button className='text-purple-600 font-semibold'> Create Project</button>
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <CreateOrUpdateProjectForm closeModal={closeModal} projectId={undefined} />
            </Modal>
        </div>
    );
};

export default Toolbar;
