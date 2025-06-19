'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useProject } from '@/contexts/ProjectContext';
import { setRefresh } from '@/lib/store/features/projectSlice';
import { setSprintId, updateSprintByIdSlice } from "@/lib/store/features/spintSlice";
import { getTaskByCurrentSprintSlice, getTasksBySprintIdSlice, getTasksOnBacklogSlice } from '@/lib/store/features/taskSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { sprint } from "@/types/sprint";
import { getTaskByProjectIdPayload } from '@/types/task';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
export default function BackLog() {
    const { dataProject } = useProject();
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<{ tasks: getTaskByProjectIdPayload[], sprint: sprint, completionPercentage: number }>()
    const [backlog, setBacklog] = useState<getTaskByProjectIdPayload[]>()
    const projectState = useSelector((state: RootState) => state.project);
    const sprintState = useSelector((state: RootState) => state.sprint);
    useEffect(() => {
        (async () => {
            if (!dataProject) return
            const res = await dispatch(getTaskByCurrentSprintSlice(dataProject._id));
            if (getTaskByCurrentSprintSlice.fulfilled.match(res)) {
                setData({ tasks: res.payload.tasks, sprint: res.payload.sprint, completionPercentage: res.payload.completionPercentage }); // Replace '1' with the actual totalPages if available
                dispatch(setSprintId(res.payload.sprint._id))
            }
            const resGettTasksOnBacklog = await dispatch(getTasksOnBacklogSlice(dataProject._id));
            if (getTasksOnBacklogSlice.fulfilled.match(resGettTasksOnBacklog)) {
                setBacklog(resGettTasksOnBacklog.payload);
            }
        })();
    }, [dataProject, projectState.refresh, dispatch])

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
                }

            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, sprintState.sprintId])

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
                                                            <Link target="_blank" href={`/projects/${dataProject?._id}/tasks/${task.identifier}`}
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
    );
}
