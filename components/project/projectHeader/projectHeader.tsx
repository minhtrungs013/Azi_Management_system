'use client';
import Meeting from '@/components/media/meeting';
import Modal from '@/components/Modal/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocket } from '@/contexts/SocketContext';
import { getAllMemberProject, getAllNonMemberToProject, getPermissions } from '@/lib/store/features/projectSlice';
import { getAllSprintByProjectIdSlice, setSprintId } from '@/lib/store/features/spintSlice';
import { setFilterParams } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { checkRuleAccess } from '@/lib/utils';
import { members, User } from '@/types/auth';
import { permission, ProjectDetails } from '@/types/project';
import { sprint } from '@/types/sprint';
import { tasksFilterParams } from '@/types/task';
import { ArrowDownWideNarrow, ClipboardList, PhoneCall, RefreshCcwDot, Search, Tally1, UserCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CreateTask from '../../task/createTask';
import CreateColumn from '../projectTodo/createColumn';
import Sprint from '../sprint/sprint';
import InviteProject from './inviteProject';

export default function ProjectHeader({ data }: { data: ProjectDetails | undefined }) {
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname()
    const searchParams = useSearchParams();
    const currentPage = searchParams.get("page") || "1";
    const lastSegment = pathname.split('/').filter(Boolean).pop()
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [showModalByStatus, setShowModalByStatus] = useState<string>('');
    const list = data?.lists.find((list) => list.name === 'TO DO')
    const [permissions, setPermissions] = useState<permission[]>();
    const [sprints, setSprints] = useState<sprint[]>();
    const [allUser, setAllUser] = useState<User[]>();
    const [allMemberProject, setAllMemberProject] = useState<members[]>();
    const authState = useSelector((state: RootState) => state.auth);
    const sprintState = useSelector((state: RootState) => state.sprint);
    const user = allMemberProject?.find((user: members) => user.user._id === authState.userId)
    const { handleGroupCall } = useSocket();
    const [filterParams, setFilterParams1] = useState<tasksFilterParams>({
        assignee: '',
        reporter: '',
        status: 'All',
        page: currentPage,
        searchParams: '',
    });


    const openModal = async (status: string) => {
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
        if (status === 'meeting' && data) {
            handleGroupCall(data);
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
    }, [data, dispatch])

    useEffect(() => {
        (async () => {
            if (!data) return
            const resGetAllSprintByProjectId = await dispatch(getAllSprintByProjectIdSlice(data?._id));
            if (getAllSprintByProjectIdSlice.fulfilled.match(resGetAllSprintByProjectId)) {
                setSprints(resGetAllSprintByProjectId.payload)
            }
        })();
    }, [data, dispatch])


    const handleSwithSprint = async (sprintId: string) => {
        dispatch(setSprintId(sprintId))
    }

    const handleFilterChange = (key: keyof tasksFilterParams, value: string) => {
        const updatedFilterParams = {
            ...filterParams,
            [key]: value,
        };
        setFilterParams1((prev) => ({
            ...prev,
            [key]: value,
        }));
        dispatch(setFilterParams(updatedFilterParams))
    };

    return (
        <div>
            <header className="flex items-center justify-between mb-6">
                <div >
                    <input type="text" defaultValue={data?.name} className="text-3xl  font-bold p-2" disabled />
                    <p className='pl-2 text-sm pt-3'>{data?.description}</p>
                </div>
                {lastSegment === "sprint" ?
                    <div>
                        <div className='flex'>
                            <div onClick={() => openModal('invite')} className='flex items-center rounded-md p-2 border cursor-pointer shadow-md text-purple-600 mr-3'>
                                <UserPlus className="w-4 h-4 mr-2" />
                                <button className='text-purple-600 font-semibold'> Invite</button>
                            </div>
                            <div className="flex -space-x-4">
                                {allMemberProject?.slice(0, 3)?.map((item) => (
                                    <img key={item.user._id} src={`${item.user.avatar_url ? item.user.avatar_url : 'https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg'}`} alt="Avatar 1" className="bg-white h-10 w-10 rounded-full border-2 border-gray-300" />
                                    // <AvatarUser key={item.user._id} url={item.user.avatar_url} name={item.user.firstname}  className='bg-white h-10 w-10 rounded-full border-2 border-gray-300'/>
                                ))}
                                {/* <!-- Additional avatar circle for +2 --> */}
                                {allMemberProject && allMemberProject.length > 3 &&
                                    <div className="h-10 w-10 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-sm border-2 border-white">
                                        +{allMemberProject.length - 3}
                                    </div>}
                            </div>
                        </div>
                    </div>
                    : lastSegment === "backlog" ?
                        <div className="flex items-center space-x-2">
                            <button onClick={() => openModal('createSprint')} className="px-4 py-2 bg-white border rounded-md flex items-center text-sm">Create Sprint <RefreshCcwDot className="w-4 h-4 ml-2" /></button>
                            <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center text-sm">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                        </div>
                        : lastSegment === "tasks" ?
                            <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center text-sm">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                            :
                            <></>
                }

            </header>
            <div className="flex space-x-2 justify-between">
                <div className='flex'>
                    <Link href={`/projects/${data?._id}`} className="pr-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Dashboard<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                    <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                    <Link href={`/projects/${data?._id}/backlog`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Backlog<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                    <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                    <Link href={`/projects/${data?._id}/sprint`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Sprint<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                    <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                    <Link href={`/projects/${data?._id}/tasks`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Task<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                </div>
                <div className='flex'>
                    {lastSegment === "backlog" ?
                        <div>
                            <Select onValueChange={e => handleSwithSprint(e)} value={sprintState.sprintId ? sprintState.sprintId : ''}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sprints?.map((sprint) => (
                                        <SelectItem key={sprint._id} value={sprint._id}>{sprint.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> : lastSegment === "tasks" ?
                            <div className="flex space-x-2 justify-end">
                                <div className='flex'>
                                    <div className="flex items-center space-x-2 mr-2  bg-white border rounded-md px-2">
                                        <input id="yourReport" className="peer hidden" type="checkbox" onChange={(e) => handleFilterChange("reporter", e.target.checked && authState.userId ? authState.userId : "")} />
                                        <label htmlFor="yourReport" className="text-sm font-medium flex items-center leading-none cursor-pointer peer-checked:text-green-500  " >
                                            <UserCheck className="w-5 h-5 mr-1 " />
                                            Your Report
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2 mr-2 bg-white border rounded-md px-2">
                                        <input
                                            type="checkbox"
                                            id="assigneeToMe"
                                            className="peer hidden"
                                            onChange={(e) =>
                                                handleFilterChange("assignee", e.target.checked && authState.userId ? authState.userId : "")
                                            }
                                        />
                                        <label htmlFor="assigneeToMe" className="text-sm font-medium flex items-center leading-none cursor-pointer peer-checked:text-green-500  " >
                                            <ClipboardList className="w-5 h-5 mr-1 " />
                                            Assignee To Me
                                        </label>
                                    </div>

                                    <div className='mr-2 '>
                                        <Select value={filterParams.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                            <SelectTrigger className="w-[150px] px-4 py-3 h-auto text-sm font-medium">
                                                <SelectValue >{filterParams.status}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent >
                                                <SelectItem key={'13d123123'} value={'All'} >
                                                    All
                                                </SelectItem>
                                                <SelectItem className='cursor-pointer' key={'13s3123'} value={'To Do'}>
                                                    To Do
                                                </SelectItem>
                                                <SelectItem className='cursor-pointer' key={'1123'} value={'In Progress'}>
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem className='cursor-pointer' key={'11231a23'} value={'Review'}>
                                                    Review
                                                </SelectItem>
                                                <SelectItem className='cursor-pointer' key={'1231s231'} value={'Bug'}>
                                                    Bug
                                                </SelectItem>
                                                <SelectItem className='cursor-pointer' key={'123d1231'} value={'Done'}>
                                                    Done
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='relative'>
                                        <input type="text" className="text-sm rounded-md border  px-4 py-3 w-64"
                                            placeholder='Search...'
                                            onChange={(e) => handleFilterChange("searchParams", e.target.value)} />
                                        <Search className='absolute bottom-[13px] h-5 text-blue-600  right-4' />
                                    </div>
                                </div>
                            </div>
                            :
                            <>
                                <button className="px-4 py-2 mr-2 bg-white hover:bg-green-500 text-green-600 hover:text-white  border rounded-md flex items-center" onClick={() => openModal('meeting')}>Start Group Call <PhoneCall className="w-4 h-4 ml-2" /></button>
                                <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center ">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                            </>}
                    {/* <button onClick={() => openModal('createColumn')} className="px-4 py-2 bg-white border rounded-md flex items-center">Create Column <CalendarDays className="w-4 h-4 ml-2" /></button> */}
                </div>
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                {showModalByStatus === 'invite' ?
                    <InviteProject closeModal={closeModal} projectId={data?._id} permissions={permissions} allUser={allUser} user={user || undefined} /> :
                    showModalByStatus === 'createTask' ?
                        <CreateTask closeModal={closeModal} listId={list?._id} allMemberProject={allMemberProject} /> :
                        showModalByStatus === 'createColumn' ?
                            <CreateColumn closeModal={closeModal} data={data} /> :
                            showModalByStatus === 'meeting' ?
                                <Meeting closeModal={closeModal} data={data} /> :
                                showModalByStatus === 'createSprint' ?
                                    <Sprint closeModal={closeModal} projectId={data?._id} /> :
                                    <></>
                }
            </Modal>
        </div>
    )
}
