'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getAllMemberProject, getProjectId, setRefresh } from '@/lib/store/features/projectSlice';
import { completeSprintByIdSlice, getAllSprintByProjectIdSlice, updateSprintByIdSlice } from "@/lib/store/features/spintSlice";
import { getTaskByCurrentSprintSlice, getTasksBySprintIdSlice, getTasksOnBacklogSlice } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { checkRuleAccess } from '@/lib/utils';
import { members } from '@/types/auth';
import { ProjectDetails } from '@/types/project';
import { sprint } from "@/types/sprint";
import { getTaskByProjectIdPayload, tasksFilterParams } from '@/types/task';
import { ArrowDownWideNarrow, Ellipsis, RefreshCcwDot, SquareChartGantt } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Modal from '../../Modal/Modal';
import CreateTask from '../../task/createTask';
import Sprint from "../sprint/sprint";

export default function BackLog({ projjectId }: { projjectId: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentPage = searchParams.get("page") || "1";
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<{ tasks: getTaskByProjectIdPayload[], sprint: sprint, completionPercentage: number }>()
    const [backlog, setBacklog] = useState<getTaskByProjectIdPayload[]>()
    const [project, setProject] = useState<ProjectDetails>()
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [list, setList] = useState<any>();
    const [sprints, setSprints] = useState<sprint[]>();
    const [allMemberProject, setAllMemberProject] = useState<members[]>();
    const authState = useSelector((state: RootState) => state.auth);
    const projectState = useSelector((state: RootState) => state.project);
    const [showModalByStatus, setShowModalByStatus] = useState<string>('');
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
        setShowModalByStatus(status)
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

            const res = await dispatch(getTaskByCurrentSprintSlice(projjectId));
            if (getTaskByCurrentSprintSlice.fulfilled.match(res)) {
                setData({ tasks: res.payload.tasks, sprint: res.payload.sprint, completionPercentage: res.payload.completionPercentage }); // Replace '1' with the actual totalPages if available
            }
            const resGettTasksOnBacklog = await dispatch(getTasksOnBacklogSlice(projjectId));
            if (getTasksOnBacklogSlice.fulfilled.match(resGettTasksOnBacklog)) {
                setBacklog(resGettTasksOnBacklog.payload);
            }
            const resGetAllSprintByProjectId = await dispatch(getAllSprintByProjectIdSlice(projjectId));
            if (getAllSprintByProjectIdSlice.fulfilled.match(resGetAllSprintByProjectId)) {
                setSprints(resGetAllSprintByProjectId.payload)
            }
        })();
    }, [projjectId, filterParams, projectState.refresh])

    const handleFilterChange = (key: keyof tasksFilterParams, value: string) => {
        setFilterParams((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleChangeStatusSprint = (sprint: sprint) => {
        sprint.status === 'Pending' ? sprint.status = 'Running' : sprint.status === 'Running' ? sprint.status = 'Completed' : sprint.status
        dispatch(updateSprintByIdSlice(sprint))
        dispatch(setRefresh(true))
    }
    const handleSwithSprint = async (sprintId: string) => {

        const res = await dispatch(getTasksBySprintIdSlice(sprintId))
        if (getTasksBySprintIdSlice.fulfilled.match(res)) {
            if (data) {
                setData({ tasks: res.payload.tasks, sprint: res.payload.sprint, completionPercentage: data.completionPercentage });
            }

        }
    }


    return (
        <div >
            <div className='mb-3'>
                <header className="flex items-center justify-between mb-6">
                    <div >
                        <p className="text-3xl  font-bold p-2">{project?.name}</p>
                        <p className='pl-2 text-sm pt-3'>{project?.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => openModal('createSprint')} className="px-4 py-2 bg-white border rounded-md flex items-center text-sm">Create Sprint <RefreshCcwDot className="w-4 h-4 ml-2" /></button>
                        <button onClick={() => openModal('createTask')} className="px-4 py-2 bg-white border rounded-md flex items-center text-sm">Create Task <ArrowDownWideNarrow className="w-4 h-4 ml-2" /></button>
                    </div>
                </header>
                <div className="flex space-x-2 justify-between">
                    <div className='flex'>
                        <Link href={`/projects/${project?._id}`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Dashboard<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        <Link href={`/projects/${project?._id}/backlog`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2"><SquareChartGantt className="w-4 h-4 mr-2" />BackLog</Link>
                        <Link href={`/projects/${project?._id}/sprint`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2">Sprint<ArrowDownWideNarrow className="w-4 h-4 ml-2" /></Link>
                        <Link href={`/projects/${project?._id}/tasks`} className="px-4 py-2 bg-white border rounded-md flex items-center mr-2"><SquareChartGantt className="w-4 h-4 mr-2" />Task</Link>
                    </div>
                    <div>
                        <Select onValueChange={e => handleSwithSprint(e)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sprint" />
                            </SelectTrigger>
                            <SelectContent>
                                {sprints?.map((sprint) => (
                                    <SelectItem key={sprint._id} value={sprint._id}>{sprint.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Modal isOpen={isModalOpen} closeModal={closeModal}>
                    {showModalByStatus === 'createTask' ?
                        <CreateTask closeModal={closeModal} listId={list?._id} allMemberProject={allMemberProject} /> :
                        <Sprint closeModal={closeModal} projectId={projjectId} />
                    }
                </Modal>
            </div>
            <div>
                {data &&
                    <Accordion type="single" collapsible defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <div className="flex items-center justify-between w-full bg-gray-50 rounded-t-sm pl-3">
                                <AccordionTrigger>
                                    <div className="flex items-center">
                                        <h3 className=" min-w-[100px] ml-3 bg-gray-200 rounded-sm p-2 text-sm font-medium">{data?.sprint.name}</h3>
                                        <span className=" text-gray-400 font-normal text-xs ml-2">{data?.sprint.startDate} - {data?.sprint.endDate} | {data?.sprint.status} | {data?.tasks.length} issues</span>
                                    </div>
                                </AccordionTrigger>
                                <div className="flex items-center">
                                    <Button variant={"secondary"} onClick={() => handleChangeStatusSprint(data.sprint)}
                                        disabled={data.sprint.status === "Completed"}
                                        className={`ml-3 rounded-sm p-2 text-sm font-medium w-[120px]
                                            ${data.sprint.status === "Pending" ? "bg-gray-100 hover:bg-gray-100 hover:text-gray-700 text-gray-500" :
                                                data.sprint.status === "Running" ? "bg-green-100 hover:bg-green-100 hover:text-green-700 text-green-500" :
                                                    "bg-purple-100 hover:bg-purple-100 hover:text-purple-700 text-purple-500"}
                                     `}>
                                        {data.sprint.status === "Pending" ? "Start Sprint" : data.sprint.status === "Running" ? " Complete Sprint" : "Finish"}
                                    </Button>
                                    <Ellipsis className="text-gray-400 font-normal text-xs ml-2 cursor-pointer" />
                                </div>
                            </div>
                            <Progress value={data?.completionPercentage} className="w-full bg-gray-300 [&>div]:bg-green-600 h-2 mb-2" />
                            <AccordionContent>
                                <div className="overflow-auto max-h-[300px] section1">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <tbody className="text-gray-700">
                                            {data?.tasks?.map((task) => (
                                                <tr className="border text-xs  drop-shadow-sm" key={task._id}>
                                                    <td className="relative py-2 px-4 min-w-[350px] max-w-[350px] text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link target="_blank" href={`/projects/${projjectId}/tasks/${task.identifier}`}
                                                                    className="mr-2 px-2  line-clamp-1 underline text-blue-600 ">
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
                                                    <td className="py-2 px-4 flex items-center">
                                                        <div className='flex items-center'>
                                                            <img src={task.assignee?.avatar_url} alt="Avatar 1" className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100" /> {task.assignee.firstname + " " + task.assignee.lastname}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                }

                <Accordion type="single" collapsible defaultValue="item-2" className="mt-3">
                    <AccordionItem value="item-2">
                        <div className="flex items-center justify-between w-full bg-gray-50 rounded-t-sm pl-3">
                            <AccordionTrigger>
                                <div className="flex items-center">
                                    <h3 className=" min-w-[100px] ml-3 bg-gray-200 rounded-sm p-2 text-sm font-medium">BackLog</h3>
                                    <span className=" text-gray-400 font-normal text-xs ml-2"> </span>
                                </div>
                            </AccordionTrigger>
                            <div className="flex items-center">

                            </div>
                        </div>
                        <AccordionContent>
                            <div className="overflow-auto max-h-[300px] section1">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <tbody className="text-gray-700">
                                        {backlog?.map((task) => (
                                            <tr className="border text-xs  drop-shadow-sm" key={task._id}>
                                                <td className="relative py-2 px-4 min-w-[350px] max-w-[350px] text-sm">
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
                                                <td className="py-2 px-4 ">
                                                    <span className={`font-normal rounded-sm py-1 px-2  ${task.priority === 'high' ? 'text-red-500  bg-red-100' :
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
                                                <td className="py-2 px-4 flex items-center">
                                                    <div className='flex items-center'>
                                                        <img src={task.assignee?.avatar_url} alt="Avatar 1" className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100" /> {task.assignee.firstname + " " + task.assignee.lastname}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>
        </div>
    );
}
