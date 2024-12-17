'use client';
import { getProjectById } from '@/lib/store/features/projectSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { ProjectList } from '@/types/project';
import { Ellipsis, FolderOpenDot, LayoutDashboard, ListChecks, MessageSquare, Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../Modal/Modal';
import NotificationListener from '../Notification/NotificationListener';
import CreateProjectForm from '../project/createOrUpdateProjectForm';

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../lib/store/store';

export function Navbar() {
    const [openItemId, setOpenItemId] = useState<string | null>(null);
    const optionsRef = useRef<HTMLDivElement | null>(null);
    const authState = useSelector((state: RootState) => state.auth);
    const pathname = usePathname()
    const [projects, setProjects] = useState<ProjectList>([]);
    const dispatch = useDispatch<AppDispatch>();
    const refresh = useSelector((state: RootState) => state.project.refresh);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const toggleOptions = (id: string) => {
        setOpenItemId(openItemId === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setOpenItemId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    // const projects = [
    //     { id: 1, name: 'Mobile App', color: 'bg-green-500', href: '/projects/1' },
    //     { id: 2, name: 'Website Redesign', color: 'bg-yellow-500', href: '/projects/2' },
    //     { id: 3, name: 'Design System', color: 'bg-purple-500', href: '/projects/3' }
    // ];
    const navbars = [
        { id: 1, name: 'Home', icon: <LayoutDashboard className="w-5 h-5" />, href: '/home' },
        { id: 2, name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, href: '/messages' },
        { id: 3, name: 'Tasks', icon: <ListChecks className="w-5 h-5" />, href: '/tasks' },
        { id: 4, name: 'Members', icon: <Users className="w-5 h-5" />, href: '/members' },
        { id: 5, name: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/settings' }
    ];

    useEffect(() => {
        (async () => {
            const res = await dispatch(getProjectById());
            if (getProjectById.fulfilled.match(res)) {
                setProjects(res.payload);
            }
        })();
    }, [refresh])
    return (
        <div className="bg-white dark:bg-[#020817] shadow-lg dark:shadow-sm dark:shadow-slate-600 h-screen">
            <div className="flex items-center h-16 p-4 bg-white dark:bg-[#020817] shadow-sm dark:shadow-slate-600">
                <img src="https://res.cloudinary.com/dax8xvyhi/image/upload/v1727755525/emtzje8x6vlsqzsxdg7a.png" alt="" className='h-14 mr-2 pb-[5px]' />
                {/* <img src="https://res.cloudinary.com/dax8xvyhi/image/upload/v1727755525/kujrbiv97xfkbdme13lz.png" alt="" className='h-14 mr-2 pb-[5px]' /> */}
                <div className="flex-shrink-0">
                    <h1 className="font-bold text-sm text-purple-600">Azi Management System</h1>
                </div>
            </div>
            <div className="space-y-8 p-4">
                <nav className="space-y-4">
                    {navbars.map(navbarItem => (
                        <Link
                            key={navbarItem.id}
                            href={navbarItem.href}
                            className={`flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md ${pathname === navbarItem.href
                                ? 'bg-purple-100 text-purple-600 shadow-sm shadow-purple-300'
                                : 'text-gray-700 hover:bg-gray'
                                }`}
                        >
                            {navbarItem.icon}
                            <span>{navbarItem.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Project Section */}
                <div>
                    <div className='flex justify-between items-center'>
                        <Link href='/projects' className={`text-sm w-full text-gray-500 font-semibold flex items-center ${pathname === '/projects' && ' text-purple-600'}`}>
                            <FolderOpenDot className="w-5 h-5 mr-2" />  MY PROJECTS
                        </Link>
                        <button onClick={openModal} className='rounded-md p-2 border cursor-pointer shadow-md'>
                            <Plus className="w-4 h-4 " />
                        </button>
                    </div>
                    <ul className="space-y-2  p-4">
                        {projects.map(project => (
                            <li key={project._id} className={`flex w-full group/item justify-between items-center rounded-md ${pathname.replace("/projects/", "") === project._id
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}>
                                <Link href={`/projects/${project._id}`} className="flex items-center space-x-2 p-2 w-full">
                                    <span className={`w-2 h-2 bg-green-500 rounded-full`}></span>
                                    <span className={`${pathname.replace("/projects/", "") === project._id
                                        ? 'font-medium'
                                        : ''}
                                    `}>{project.name}</span>
                                </Link>
                                <div className='p-2 relative'>
                                    <div onClick={() => toggleOptions(project._id)} className='cursor-pointer'>
                                        <Ellipsis className='group/edit invisible group-hover/item:visible cursor-pointer' />
                                    </div>
                                    {openItemId === project._id && (
                                        <div ref={optionsRef} className="absolute top-full right-[-100px] bg-white shadow-md p-2 rounded-sm">
                                            <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => alert('Edit clicked')}>
                                                Edit
                                            </button>
                                            <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => alert('Delete clicked')}>
                                                Delete
                                            </button>
                                            <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => alert('Completed clicked')}>
                                                Completed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Thoughts Time Section */}
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="text-yellow-500">
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m0 0h-1m1-4v2m0 2h.01m4-4.44V8c0-1.68-1.79-2.68-3.2-1.95A4 4 0 007 11.56V13a3 3 0 003 3h2a3 3 0 003-3v-1.44c.28-.29.55-.58.78-.88A4 4 0 0013 5c0-1.1-.9-2-2-2s-2 .9-2 2c0 0 .01 0 0 0"></path>
                        </svg>
                    </div>
                    <h4 className="text-gray-700 font-semibold mt-2">Thoughts Time</h4>
                    <p className="text-sm text-gray-500">
                        We don't have any notice for you, till then you can share your thoughts with your peers.
                    </p>
                    <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md">Write a message</button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <CreateProjectForm closeModal={closeModal} projectId={undefined} />
            </Modal>
        </div>
    );
}
