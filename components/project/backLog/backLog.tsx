'use client';
import Modal from "@/components/Modal/Modal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProject } from '@/contexts/ProjectContext';
import { setRefresh } from '@/lib/store/features/projectSlice';
import { setSprintId, updateSprintByIdSlice } from "@/lib/store/features/spintSlice";
import { addTaskToSprintThunk, deleteTaskByIdSlice, getTaskByCurrentSprintSlice, getTasksBySprintIdSlice, getTasksOnBacklogSlice, moveTaskToBacklogSlice } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { sprint, sprintPayload } from "@/types/sprint";
import { getTaskByProjectIdPayload } from '@/types/task';
import { Edit, Ellipsis, Eye, RefreshCcwDot, SendToBack, Trash } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UpdateOrCreateSprint from "../sprint/updateOrCreateSprint";
import { toast } from "react-toastify";
import { checkRuleAccess } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import DeleteModal from "@/components/Modal/deleteModal";
export default function BackLog() {
    const { dataProject } = useProject();
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<{ tasks: getTaskByProjectIdPayload[], sprint: sprint, completionPercentage: number }>()
    const [backlog, setBacklog] = useState<getTaskByProjectIdPayload[]>()
    const [sprint, setSprint] = useState<sprint>()
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [showModalByStatus, setShowModalByStatus] = useState<string>('');
    const [taskId, setTaskId] = useState<string>('');
    const projectState = useSelector((state: RootState) => state.project);
    const sprintState = useSelector((state: RootState) => state.sprint);
    useEffect(() => {
        (async () => {
            if (!dataProject) return
            const res = await dispatch(getTaskByCurrentSprintSlice(dataProject._id));
            if (getTaskByCurrentSprintSlice.fulfilled.match(res)) {
                setData({ tasks: res.payload.tasks, sprint: res.payload.sprint, completionPercentage: res.payload.completionPercentage }); // Replace '1' with the actual totalPages if available
                setSprint(res.payload.sprint);
                dispatch(setSprintId(res.payload.sprint._id))
            }
            const resGettTasksOnBacklog = await dispatch(getTasksOnBacklogSlice(dataProject._id));
            if (getTasksOnBacklogSlice.fulfilled.match(resGettTasksOnBacklog)) {
                setBacklog(resGettTasksOnBacklog.payload);
            }
        })();
    }, [dataProject, projectState.refresh, dispatch, sprintState.refresh])

    const handleChangeStatusSprint = (sprint: sprint) => {
        sprint.status === 'Pending' ? sprint.status = 'Running' : sprint.status === 'Running' ? sprint.status = 'Completed' : sprint.status
        dispatch(updateSprintByIdSlice(sprint))
        dispatch(setRefresh(true))
    }

    useEffect(() => {
        (async () => {
            if (!sprintState.sprintId) return
            const res = await dispatch(getTasksBySprintIdSlice(sprintState.sprintId))
            if (getTasksBySprintIdSlice.fulfilled.match(res)) {
                if (data) {
                    setData({ tasks: res.payload.tasks, sprint: res.payload.sprint, completionPercentage: data.completionPercentage });
                    setSprint(res.payload.sprint);
                }

            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, sprintState.sprintId])

    const openModal = async (status: string, id?: string) => {
        if (projectState.role) {
            const hasPermissioncreateSprint = await checkRuleAccess(['task_admin', 'project_admin'], projectState.role)
            if (!hasPermissioncreateSprint && status === "createSprint") {
                toast.warning('You do not have permission to create Sprint for the project.!', {
                    position: "bottom-left",
                    autoClose: 5000,
                });
                return;
            }
            const hasPermissionDeleteTask = await checkRuleAccess(['task_admin', 'project_admin'], projectState.role)
            if (!hasPermissionDeleteTask && status === "deleteTask") {
                toast.warning('You do not have permission to delete tasks for the project.!', {
                    position: "top-right",
                    autoClose: 5000,
                });
                return;
            }

        }
        if (status === 'deleteTask') {
            setTaskId(id ?? '')
        }
        setShowModalByStatus(status)
        setModalOpen(true)
    };

    const closeModal = () => setModalOpen(false);

    const handleMoveToBacklog = async (taskId?: string) => {
        if (!taskId || !projectState.role) return

        const hasPermissionMoveToBacklog = await checkRuleAccess(['task_admin', 'project_admin'], projectState.role)
        if (!hasPermissionMoveToBacklog) {
            toast.warning('You do not have permission to delete tasks for the project.!', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }
        const result = await dispatch(moveTaskToBacklogSlice(taskId))
        if (moveTaskToBacklogSlice.fulfilled.match(result)) {
            toast.success("Move task to Backlog successfully!", {
                position: "top-right",
                autoClose: 5000,
            });
            dispatch(setRefresh(true));
            closeModal()
            return
        } else {
            console.log(result);
        }
    }
    const handleDeleteTask = async () => {
        if (taskId) {
            const result = await dispatch(deleteTaskByIdSlice(taskId));
            if (deleteTaskByIdSlice.fulfilled.match(result)) {
                toast.success("Task deleted successfully!", {
                    position: "top-right",
                    autoClose: 5000,
                });
                dispatch(setRefresh(true));
                closeModal();
            }
        }
        closeModal();
    }
    const handleAddToSprint = async (taskId?: string) => {
        if (!taskId || !projectState.role || !data) return

        const hasPermissionAddToSprint = await checkRuleAccess(['task_admin', 'project_admin'], projectState.role)
        if (!hasPermissionAddToSprint) {
            toast.warning('You do not have permission to add tasks to Sprint for the project.!', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }
        
        if (data.sprint.status === "Running" && data.sprint) {
            const res = await dispatch(addTaskToSprintThunk({ sprintId: data.sprint._id as string, taskId: taskId }))
            if (addTaskToSprintThunk.fulfilled.match(res)) {
                dispatch(setRefresh(true));
                toast.success("Add task to Sprint successfully!", {
                    position: "top-right",
                    autoClose: 5000,
                });
            }

        } else {
            toast.warning("You can only add tasks to a running sprint!", {
                position: "top-right",
                autoClose: 5000,
            });
        }

    }
    return (
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
                                <Button variant={"secondary"} size="sm" onClick={() => handleChangeStatusSprint(data.sprint)}
                                    disabled={data.sprint.status === "Completed"}
                                    className={`ml-3 rounded-sm w-[120px] 
                                            ${data.sprint.status === "Pending" ? "bg-gray-100 hover:bg-gray-100 hover:text-gray-700 text-gray-500" :
                                            data.sprint.status === "Running" ? "bg-green-100 hover:bg-green-100 hover:text-green-700 text-green-500" :
                                                "bg-purple-100 hover:bg-purple-100 hover:text-purple-700 text-purple-500"}
                                     `}>
                                    {data.sprint.status === "Pending" ? "Start Sprint" : data.sprint.status === "Running" ? " Complete" : "Finish"}
                                </Button>
                                <Button onClick={() => openModal('createSprint')} variant="secondary" size="sm" className="mx-2 hover:text-white bg-orange-50 hover:bg-orange-500 text-orange-500 border-none"><Edit className='h-5 w-5 mr-2 ' /> Edit</Button>
                            </div>
                        </div>
                        <Progress value={data?.completionPercentage} className="w-full bg-gray-300 [&>div]:bg-green-600 h-2 mb-2" />
                        <AccordionContent>
                            <div className="overflow-auto max-h-[300px] section">
                                <ul className="bg-white border border-gray-200 text-xs text-gray-700 divide-y divide-gray-200">
                                    {data?.tasks?.map((task) => (
                                        <li key={task._id} className="flex items-center px-4 py-2  gap-4">
                                            <div className="w-[55%]  text-sm">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            target="_blank"
                                                            href={`/projects/${dataProject?._id}/tasks/${task.identifier}`}
                                                            className="line-clamp-1 underline text-blue-600"
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" align="start">
                                                        <p>{task.title}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <div
                                                    className={`absolute h-5/6 w-[3px] top-[5px] left-0 ${task.issueType === "task"
                                                        ? "bg-blue-600"
                                                        : task.issueType === "bug"
                                                            ? "bg-red-500"
                                                            : "bg-green-500"
                                                        }`}
                                                ></div>
                                            </div>
                                            <div className="w-[10%]">
                                                <span
                                                    className={`font-normal rounded-sm py-1 px-2 ${task.priority === "high"
                                                        ? "text-red-500 bg-red-100"
                                                        : task.priority === "medium"
                                                            ? "text-orange-500 bg-orange-100"
                                                            : "text-green-500 bg-green-100"
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="w-[10%] font-semibold">
                                                <span
                                                    className={`rounded-sm ${task.listId.name === "TO DO"
                                                        ? "text-slate-700"
                                                        : task.listId.name === "IN PROGRESS"
                                                            ? "text-orange-600"
                                                            : task.listId.name === "REVIEW"
                                                                ? "text-blue-600"
                                                                : task.listId.name === "BUG"
                                                                    ? "text-red-600"
                                                                    : task.listId.name === "DONE"
                                                                        ? "text-green-500"
                                                                        : ""
                                                        }`}
                                                >
                                                    {task.listId.name}
                                                </span>
                                            </div>
                                            <div className="w-[20%] flex items-center">
                                                <img
                                                    src={task.assignee?.avatar_url}
                                                    alt="Avatar"
                                                    className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100"
                                                />
                                                <span>
                                                    {task.assignee.firstname + " " + task.assignee.lastname}
                                                </span>
                                            </div>
                                            <div className="w-[5%]">
                                                <div className="text-center flex items-center justify-center mr-5">
                                                    <Link target="_blank" href={`/projects/${dataProject?._id}/tasks/${task.identifier}`} className="mr-2 p-2 hover:bg-gray-200 rounded cursor-pointer">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div >
                                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" align="end">
                                                                <p>View Task</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </Link>
                                                    <button onClick={() => handleMoveToBacklog(task._id)} className="p-2 hover:bg-gray-200 rounded">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div >
                                                                    <SendToBack className="w-4 h-4 text-purple-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" align="end">
                                                                <p>Move to Backlog</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </button>
                                                    <button onClick={() => openModal('deleteTask', task._id)} className="p-2 hover:bg-gray-200 rounded">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div >
                                                                    <Trash className="w-4 h-4 text-red-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" align="end">
                                                                <p>Delete Task</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
                        <div className="overflow-auto max-h-[300px] section">
                            <ul className="bg-white border border-gray-200 text-xs text-gray-700 divide-y divide-gray-200">
                                {backlog?.map((task) => (
                                    <li key={task._id} className="flex items-center px-4 py-2  gap-4">
                                        <div className="w-[55%]  text-sm">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        target="_blank"
                                                        href={`/projects/${dataProject?._id}/tasks/${task.identifier}`}
                                                        className="line-clamp-1 underline text-blue-600"
                                                    >
                                                        {task.title}
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="start">
                                                    <p>{task.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <div
                                                className={`absolute h-5/6 w-[3px] top-[5px] left-0 ${task.issueType === "task"
                                                    ? "bg-blue-600"
                                                    : task.issueType === "bug"
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                    }`}
                                            ></div>
                                        </div>
                                        <div className="w-[10%]">
                                            <span
                                                className={`font-normal rounded-sm py-1 px-2 ${task.priority === "high"
                                                    ? "text-red-500 bg-red-100"
                                                    : task.priority === "medium"
                                                        ? "text-orange-500 bg-orange-100"
                                                        : "text-green-500 bg-green-100"
                                                    }`}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="w-[10%] font-semibold">
                                            <span
                                                className={`rounded-sm ${task.listId.name === "TO DO"
                                                    ? "text-slate-700"
                                                    : task.listId.name === "IN PROGRESS"
                                                        ? "text-orange-600"
                                                        : task.listId.name === "REVIEW"
                                                            ? "text-blue-600"
                                                            : task.listId.name === "BUG"
                                                                ? "text-red-600"
                                                                : task.listId.name === "DONE"
                                                                    ? "text-green-500"
                                                                    : ""
                                                    }`}
                                            >
                                                {task.listId.name}
                                            </span>
                                        </div>
                                        <div className="w-[20%] flex items-center">
                                            <img
                                                src={task.assignee?.avatar_url}
                                                alt="Avatar"
                                                className="h-7 w-7 mr-3 rounded-full border-2 border-gray-100"
                                            />
                                            <span>
                                                {task.assignee.firstname + " " + task.assignee.lastname}
                                            </span>
                                        </div>
                                        <div className="w-[5%]">
                                            <div className="text-center flex items-center justify-center mr-5">
                                                <Link target="_blank" href={`/projects/${dataProject?._id}/tasks/${task.identifier}`} className="mr-2 p-2 hover:bg-gray-200 rounded cursor-pointer">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div >
                                                                <Eye className="w-4 h-4 text-blue-500" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" align="end">
                                                            <p>View Task</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Link>
                                                <button onClick={() => handleAddToSprint(task._id)} className="p-2 hover:bg-gray-200 rounded">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div >
                                                                <RefreshCcwDot className="w-4 h-4 text-purple-500" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" align="end">
                                                            <p>Add To Sprint</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </button>
                                                <button onClick={() => openModal('deleteTask', task._id)} className="p-2 hover:bg-gray-200 rounded">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div >
                                                                <Trash className="w-4 h-4 text-red-500" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" align="end">
                                                            <p>Delete Task</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div>
                <Modal isOpen={isModalOpen} closeModal={closeModal}>
                    {showModalByStatus === 'createSprint' ?
                        <UpdateOrCreateSprint closeModal={closeModal} projectId={projectState?.projectId} data={sprint} /> :
                        showModalByStatus === 'deleteTask' ?
                            <DeleteModal
                                closeModal={closeModal}
                                title="Delete Task"
                                handleDelete={handleDeleteTask}
                                body={<p className="text-black font-semibold mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>}
                            /> :

                            <></>
                    }
                </Modal>
            </div>
        </div>
    );
}
