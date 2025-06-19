'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProject } from '@/contexts/ProjectContext';
import { getTasksByProjectIdSlice } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { getTaskByProjectIdPayload, tasksFilterParams } from '@/types/task';
import { Eye, Trash } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PaginationWithLinks } from '../common/pagination-with-links';
import Modal from "../Modal/Modal";
import DeleteModal from "../Modal/deleteModal";

export default function GetTasksByProjectId() {
    const { dataProject } = useProject();
    const searchParams = useSearchParams();
    const currentPage = searchParams.get("page") || "1";
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [TaskId, setTaskId] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<{ tasks: getTaskByProjectIdPayload[], totalPages: number }>()
    const taskState = useSelector((state: RootState) => state.task);

    useEffect(() => {
        (async () => {
            if (!dataProject) return
            const filter: tasksFilterParams = {
                assignee: taskState.filterParams.assignee,
                reporter: taskState.filterParams.reporter,
                searchParams: taskState.filterParams.searchParams,
                status: taskState.filterParams.status,
                page: currentPage,
            }
            const res = await dispatch(getTasksByProjectIdSlice({ projectId: dataProject._id, filterParams: filter }));
            if (getTasksByProjectIdSlice.fulfilled.match(res)) {
                setData({ tasks: res.payload.tasks, totalPages: res.payload.totalPages });
            }
        })();
    }, [dataProject, taskState, currentPage, taskState.filterParams, dispatch])

    const openModal = async (id: string | null) => {
        setTaskId(id ?? '');
        setModalOpen(true)
    };

    const handleDeleteTask = () => {
        // if (projectId) {
        //     const result = await dispatch(deleteTaskById(TaskId));
        //     if (deleteProjectById.fulfilled.match(result)) {
        //         toast.success("Project deleted successfully!", {
        //             position: "bottom-right",
        //             autoClose: 5000,
        //         });
        //         dispatch(setRefresh(true));
        //         closeModal();
        //     }
        // }
         closeModal();
    }
    const closeModal = () => setModalOpen(false);
    return (
        <div >
            <div className='mb-3'>
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
                                        <Link target="_blank" href={`/projects/${dataProject?._id}/tasks/${task.identifier}`}
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
                                    <button onClick={() => openModal(task._id ?? null)} className="p-2 hover:bg-gray-200 rounded">
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='mt-3 flex justify-end'>
                <PaginationWithLinks page={parseInt(currentPage, 10)} pageSize={10} totalCount={data?.totalPages ?? 0} />
            </div>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <DeleteModal
                    closeModal={closeModal}
                    title="Delete Task"
                    handleDelete={handleDeleteTask}
                    body={<p className="text-black font-semibold mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>}
                />
            </Modal>
        </div>
    );
}
