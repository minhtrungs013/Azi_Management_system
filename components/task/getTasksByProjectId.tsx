'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getAllMemberProject, getProjectId } from '@/lib/store/features/projectSlice';
import { getTasksByProjectIdSlice } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { checkRuleAccess } from '@/lib/utils';
import { members } from '@/types/auth';
import { ProjectDetails } from '@/types/project';
import { getTaskByProjectIdPayload, tasksFilterParams } from '@/types/task';
import { ArrowDownWideNarrow, ClipboardList, Eye, Search, SquareChartGantt, Tally1, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { PaginationWithLinks } from '../common/pagination-with-links';
import Modal from '../Modal/Modal';
import CreateTask from './createTask';

export default function GetTasksByProjectId({ projjectId }: { projjectId: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentPage = searchParams.get("page") || "1";
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<{ tasks: getTaskByProjectIdPayload[], totalPages: number }>()
    const [project, setProject] = useState<ProjectDetails>()
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [list, setList] = useState<any>();
    const [allMemberProject, setAllMemberProject] = useState<members[]>();
    const authState = useSelector((state: RootState) => state.auth);
    const [filterParams, setFilterParams] = useState<tasksFilterParams>({
        assignee: '',
        reporter: '',
        status: 'All',
        page: currentPage,
        searchParams: '',
    });

    const openModal = async (status: string) => {
        const user = allMemberProject?.find((user: members) => user.user._id === authState.userId)
        if (user) {
            const hasPermissionCreateTask = await checkRuleAccess(['task_admin', 'project_admin'], user)
            if (!hasPermissionCreateTask && (status === "createTask" || status === "createColumn")) {
                toast.warning('You do not have permission to create tasks or create columns for the project.!', {
                    position: "bottom-left",
                    autoClose: 5000,
                });
                return;
            }
        }
        setModalOpen(true)
    };

    const closeModal = () => setModalOpen(false);

    useEffect(() => {
        (async () => {
            const resGetProjectId = await dispatch(getProjectId(projjectId));
            if (getProjectId.fulfilled.match(resGetProjectId)) {
                setProject(resGetProjectId.payload);
                setList(resGetProjectId.payload?.lists.find((list: { name: string }) => list.name === 'TO DO'))
            }
            const resAllMemberProject = await dispatch(getAllMemberProject(projjectId));
            if (getAllMemberProject.fulfilled.match(resAllMemberProject)) {
                setAllMemberProject(resAllMemberProject.payload);
            }
        })();
    }, [projjectId])

    useEffect(() => {
        (async () => {

            const res = await dispatch(getTasksByProjectIdSlice({ projectId: projjectId, filterParams: filterParams }));
            if (getTasksByProjectIdSlice.fulfilled.match(res)) {
                setData({ tasks: res.payload.tasks, totalPages: res.payload.totalPages }); // Replace '1' with the actual totalPages if available
            }
        })();
    }, [projjectId, filterParams])

    // const handleSort = (key: string) => {
    //     if (data) {
    //         setData([...data].sort((a: any, b: any) => b[key].localeCompare(a[key])));
    //     }
    // };

    const handleFilterChange = (key: keyof tasksFilterParams, value: string) => {
        setFilterParams((prev) => ({
            ...prev,
            [key]: value,
        }));
    };


    return (
        <div >
            <div className='mb-3'>
                <header className="flex items-center justify-between mb-6">
                    <div >
                        <p className="text-3xl  font-bold p-2">{project?.name}</p>
                        <p className='pl-2 text-sm pt-3'>{project?.description}</p>
                    </div>
                    <div>
                        <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center ">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>

                    </div>
                </header>
                <div className="flex space-x-2 justify-between">
                    <div className='flex'>
                        <Link href={`/projects/${project?._id}`} className="pr-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Dashboard<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                        <Link href={`/projects/${project?._id}/backlog`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Backlog<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                        <Link href={`/projects/${project?._id}/sprint`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Sprint<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        <div className="flex items-center justify-center text-gray-400"> <Tally1 /></div>
                        <Link href={`/projects/${project?._id}/tasks`} className="px-4 py-2 bg-white hover:text-purple-600 font-medium flex items-center mr-2">Task<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        {/* <Link href={`/projects/${data?._id}/member`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Member<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                    <Link href={`/projects/${data?._id}/backlog`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Backlog<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link> */}
                    </div>
                    <div className='flex'>
                        <div className="flex items-center space-x-2 mr-2  bg-white border rounded-md px-2">
                            <input id="yourReport" className="peer hidden" type="checkbox" onChange={(checked) => handleFilterChange("reporter", checked && authState.userId ? authState.userId : "")} />
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
                <Modal isOpen={isModalOpen} closeModal={closeModal}>
                    <CreateTask closeModal={closeModal} listId={list?._id} allMemberProject={allMemberProject} /> :
                </Modal>
            </div>
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Task Name
                        </th>
                        {/* <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Description
                        </th> */}
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Priority
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Start Date
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            End Date
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Assignee
                        </th>
                        <th className="py-2 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Report
                        </th>
                        <th className="py-2 px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {data?.tasks?.map((task) => (
                        <tr className="border text-xs  drop-shadow-sm" key={task._id}>
                            <td className="relative py-2 px-4 max-w-[350px] text-sm">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link target="_blank" href={`/projects/${projjectId}/tasks/${task.identifier}`}
                                            className="mr-2 px-2  line-clamp-1 underline text-blue-600">
                                            {task.title}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" align="start">
                                        <p>{task.title}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <div className={`absolute h-5/6  w-[3px] top-[5px] left-0 ${task.issueType == 'task' ? '  bg-blue-600 ' :
                                    task.issueType == 'bug' ? ' bg-red-500' : 'bg-green-500'
                                    }`}></div>
                            </td>
                            {/* <td className="py-2 px-4  max-w-[300px]">
                                <span className="mr-2 px-2   line-clamp-1" > {task.description}</span>
                            </td> */}
                            <td className="py-2 px-4 ">
                                <span className={`font-normal rounded-sm py-1 px-2 ${task.priority === 'high' ? 'text-red-500  bg-red-100' :
                                    task.priority === 'medium' ? 'text-orange-500  bg-orange-100' :
                                        'text-green-500  bg-green-100'}`}>{task.priority}</span>
                            </td>

                            <td className="py-2 px-4">
                                <span className={`font-semibold rounded-sm ${task.listId.name === 'TO DO' ? 'text-slate-700' :
                                    task.listId.name === 'IN PROGRESS' ? 'text-orange-600 ' :
                                        task.listId.name === 'REVIEW' ? 'text-blue-600 ' :
                                            task.listId.name === 'BUG' ? 'text-red-600 ' :
                                                task.listId.name === 'DONE' ? 'text-green-500' : ''} `}>{task.listId.name}</span>
                            </td>
                            <td className="py-2 px-4  max-w-[300px]">
                                <span>{task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}</span>
                            </td>
                            <td className="py-2 px-4  max-w-[300px]">
                                <span>{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}</span>
                            </td>
                            <td className="py-2 px-4 flex items-center">
                                <div className='flex items-center'>
                                    <img src={task.assignee?.avatar_url} alt="Avatar 1" className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100" /> {task.assignee.firstname + " " + task.assignee.lastname}
                                </div>
                            </td>
                            <td className="py-2 px-4 ">
                                <div className='flex items-center'>
                                    <img src={task.reporter?.avatar_url} alt="Avatar 1" className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100" /> {task.reporter?.firstname + " " + task.reporter?.lastname}
                                </div>
                            </td>
                            <td className="py-2 px-4 ">
                                <div className="text-center flex items-center justify-center">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link target="_blank" href={`/projects/${projjectId}/tasks/${task.identifier}`} className="mr-2 p-2 hover:bg-gray-200 rounded">
                                                <Eye className="w-4 h-4 text-blue-500" />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="left" align="end">
                                            <p>View Task</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='mt-3 flex justify-end'>
                <PaginationWithLinks page={parseInt(currentPage, 10)} pageSize={10} totalCount={data?.totalPages ?? 0} />
            </div>
        </div>
    );
}
