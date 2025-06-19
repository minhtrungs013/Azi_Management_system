"use client"
import BurnDownChart from "@/components/common/BurnDownChart";
import CumulativeFlowChart from "@/components/common/CumulativeFlowChart";
import PieChartComponent from "@/components/common/PieChartComponent";
import VelocityChart from "@/components/common/VelocityChart";
import { useProject } from '@/contexts/ProjectContext';
import { getProjectDashboardByIdSlice } from "@/lib/store/features/projectSlice";
import { AppDispatch } from "@/lib/store/store";
import { Dashboard } from "@/types/project";
import { Accessibility, Bug, FileCheck2, Shrink, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function ProjectDashBoard() {
    const dispatch = useDispatch<AppDispatch>();
    const { dataProject } = useProject();
    const [data, setData] = useState<Dashboard>();

    useEffect(() => {
        (async () => {
            if (!dataProject) return
            const resGetProjectDashboard = await dispatch(getProjectDashboardByIdSlice(dataProject._id));
            if (getProjectDashboardByIdSlice.fulfilled.match(resGetProjectDashboard)) {
                setData(resGetProjectDashboard.payload);
            }
        })();
    }, [dataProject, dispatch])

    return (
        <div >
            <div className="flex ">
                <div className="py-4 mx-auto max-w-screen-2xl w-full ">
                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        <div className="col-span-12 space-y-6 xl:col-span-7">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                            <FileCheck2 className="h-6 w-6" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-1 rounded-sm">Task</span>
                                            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90"></h4>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                            {data?.project.taskCount}</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                            <Bug className="h-6 w-6" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-1 rounded-sm">Bug</span>
                                            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90"></h4>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                            {data?.project.bugCount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-1 rounded-sm">Member</span>
                                            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90"></h4>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                            {data?.project.memberCount}</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                            <Shrink className="h-6 w-6" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-1 rounded-sm">Sprint</span>
                                            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90"></h4>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                            {data?.project.sprintCount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-1 rounded-sm">Backlog</span>
                                            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90"></h4>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                            {data?.project.memberCount}</span>
                                    </div>
                                </div>

                            </div>
                            {/* <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Sales</h3>
                                    <div className="relative h-fit">
                                        <button className="dropdown-toggle">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                                <path fill="currentColor" d="M10.244 6c0-.966.784-1.75 1.75-1.75h.01a1.75 1.75 0 1 1 0 3.5h-.01A1.75 1.75 0 0 1 10.244 6m0 12c0-.966.784-1.75 1.75-1.75h.01a1.75 1.75 0 1 1 0 3.5h-.01a1.75 1.75 0 0 1-1.75-1.75m1.75-7.75a1.75 1.75 0 1 0 0 3.5h.01a1.75 1.75 0 1 0 0-3.5z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="max-w-full overflow-x-auto custom-scrollbar">
                                    <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                                        <template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        <div className="col-span-12 xl:col-span-5">
                            <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
                                <div className="px-5 pt-5 bg-white shadow-default rounded-2xl dark:bg-gray-900 sm:px-6 sm:pt-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{data?.sprint?.currentSprint?.name} <span className="text-sm font-normal text-gray-500 ">{"(Sprint Now)"}</span></h3>
                                            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">Target you’ve set for each month</p>
                                        </div>
                                        <div className="relative h-fit">
                                            <span className="text-sm font-medium text-green-800 dark:text-gray-400 bg-green-50 p-2 rounded-sm flex items-center">
                                                <Accessibility className="mr-2 h-5 w-5" />
                                                <span className="bouncing-text">
                                                    {data?.sprint?.currentSprint?.status.split("").map((char, i) => (
                                                        <span key={i} className="bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                                                            {char}
                                                        </span>
                                                    ))}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative ">
                                        <div className="max-h-[330px]" id="chartDarkStyle">
                                            <PieChartComponent data1={data} />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 ml-6 ">Priority Total</h3>
                                <div className="flex items-center justify-center gap-5 px-6 pb-5">
                                    <div>
                                        <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Low</p>
                                        <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{data?.sprint.lowTaskCount}
                                        </p>
                                    </div>
                                    <div className="w-px bg-gray-200 h-7 dark:bg-gray-800">
                                    </div>
                                    <div>
                                        <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Medium</p>
                                        <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{data?.sprint.mediumTaskCount}
                                        </p>
                                    </div>
                                    <div className="w-px bg-gray-200 h-7 dark:bg-gray-800">
                                    </div>
                                    <div>
                                        <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Hight</p>
                                        <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">{data?.sprint.highTaskCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 xl:col-span-6">
                            <BurnDownChart />
                        </div>
                        <div className="col-span-12 xl:col-span-6">
                            <VelocityChart />
                        </div>
                        <div className="col-span-12">
                            <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">

                                <div className="max-w-full overflow-x-auto custom-scrollbar">
                                    <div className="min-w-[1000px] xl:min-w-full">
                                        <CumulativeFlowChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}