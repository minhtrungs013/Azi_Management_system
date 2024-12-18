'use client';
import Modal from '@/components/Modal/Modal';
import { getAllMemberProject, getAllNonMemberToProject, getPermissions } from '@/lib/store/features/projectSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { members, User } from '@/types/auth';
import { permission, ProjectDetails } from '@/types/project';
import { ArrowDownWideNarrow, CalendarDays, PhoneCall, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateTask from '../../task/createTask';
import InviteProject from './inviteProject';
import CreateColumn from '../projectTodo/createColumn';
import { toast } from 'react-toastify';
import { checkRuleAccess } from '@/lib/utils';

export default function ProjectHeader({ data }: { data: ProjectDetails | undefined }) {
    const dispatch = useDispatch<AppDispatch>();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [showModalByStatus, setShowModalByStatus] = useState<string>('');
    const list = data?.lists.find((list) => list.name === 'TO DO')
    const [permissions, setPermissions] = useState<permission[]>();
    const [allUser, setAllUser] = useState<User[]>();
    const [allMemberProject, setAllMemberProject] = useState<members[]>();
    const authState = useSelector((state: RootState) => state.auth);

    const openModal = async (status: string) => {
        if (allMemberProject) {
            const user = allMemberProject.find((user: members) => user.user._id === authState.userId)
            if (user) {
                const hasPermissionCreateTask = await checkRuleAccess(['task_admin', 'project_admin'], user)
                if (!hasPermissionCreateTask && (status === "createTask" || status === "createColumn")) {
                    toast.warning('You do not have permission to create tasks or create columns for the project.!', {
                        position: "bottom-left",
                        autoClose: 5000,
                    });
                    return;
                }
                const hasPermissionCreateColum = await checkRuleAccess(['member_manager', 'project_admin'], user)
                if (!hasPermissionCreateColum && status === "invite") {
                    toast.warning('You do not have permission to invite people to the project.!', {
                        position: "bottom-left",
                        autoClose: 5000,
                    });
                    return;
                }

            }
        }
        setShowModalByStatus(status)
        setModalOpen(true)
    };
    
    const closeModal = () => setModalOpen(false);

    useEffect(() => {
        (async () => {
            const res = await dispatch(getPermissions());
            if (getPermissions.fulfilled.match(res)) {
                setPermissions(res.payload);
            }
            if (data?._id) {
                const resAllNonMemberToProjectr = await dispatch(getAllNonMemberToProject(data?._id));
                if (getAllNonMemberToProject.fulfilled.match(resAllNonMemberToProjectr)) {
                    setAllUser(resAllNonMemberToProjectr.payload);
                }
                const resAllMemberProject = await dispatch(getAllMemberProject(data?._id));
                if (getAllMemberProject.fulfilled.match(resAllMemberProject)) {
                    setAllMemberProject(resAllMemberProject.payload);
                }

            }
        })();
    }, [data])

    return (
        <div>
            <header className="flex items-center justify-between mb-6">
                <div >
                    <input type="text" defaultValue={data?.name} className="text-3xl  font-bold p-2" disabled />
                    <p className='pl-2 text-sm pt-3'>{data?.description}</p>
                </div>
                <div>
                    <div className='flex'>
                        <div onClick={() => openModal('invite')} className='flex items-center rounded-md p-2 border cursor-pointer shadow-md text-purple-600 mr-3'>
                            <UserPlus className="w-4 h-4 mr-2" />
                            <button className='text-purple-600 font-semibold'> Invite</button>
                        </div>
                        <div className="flex -space-x-4">
                            {allMemberProject?.slice(0, 3).map((item) => (
                                <img key={item.user._id} src={`${item.user.avatar_url ? item.user.avatar_url : 'https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg'}`} alt="Avatar 1" className="bg-white h-10 w-10 rounded-full border-2 border-gray-300" />
                            ))}
                            {/* <!-- Additional avatar circle for +2 --> */}
                            {allMemberProject && allMemberProject.length > 3 &&
                                <div className="h-10 w-10 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-sm border-2 border-white">
                                    +{allMemberProject.length - 3}
                                </div>}
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex space-x-2 justify-between">
                <div className='flex'>
                    <button className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Member Management <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                    <button className="px-4 py-2 bg-white hover:bg-green-500 text-green-600 hover:text-white  border rounded-md flex items-center">Start Group Call <PhoneCall className="w-4 h-4 ml-2" /></button>
                </div>
                <div className='flex'>
                    <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                    <button onClick={() => openModal('createColumn')} className="px-4 py-2 bg-white border rounded-md flex items-center">Create Column <CalendarDays className="w-4 h-4 ml-2" /></button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                {showModalByStatus === 'invite' ?
                    <InviteProject closeModal={closeModal} projectId={data?._id} permissions={permissions} allUser={allUser} /> :
                    showModalByStatus === 'createTask' ?
                        <CreateTask closeModal={closeModal} listId={list?._id} allMemberProject={allMemberProject} /> :
                        showModalByStatus === 'createColumn' ?
                            <CreateColumn closeModal={closeModal} data={data} /> :

                            <CreateTask closeModal={closeModal} listId={list?._id} allMemberProject={allMemberProject} />
                }
            </Modal>
        </div>
    )
}
