'use client';
import VideoCall from "@/components/media/VideoCall";
import { getProjectById, getProjectId } from "@/lib/store/features/projectSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { ProjectDetails, ProjectList } from "@/types/project";
import { Item } from "@radix-ui/react-dropdown-menu";
import { Projector } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function Tasks() {
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<ProjectList>([])
    const refresh = useSelector((state: RootState) => state.task.refresh);

    useEffect(() => {
        (async () => {
            const res = await dispatch(getProjectById());
            if (getProjectById.fulfilled.match(res)) {
                setData(res.payload)
            }
        })();
    }, [refresh])

    const tasks = async (id: string) => {
        const res = await dispatch(getProjectId(id));
        if (getProjectId.fulfilled.match(res)) {
            setData(res.payload);
            return <li className=" grid grid-cols-2 gap-4 py-1 border rounded-md cursor-pointer shadow-sm mb-1">
                        <h5 className="col-start-1 col-span-1 p-2 ">name task</h5>
                        <h5 className="col-start-2 col-span-2 p-2 ">in Progress</h5>
                    </li>
        }
    }

    return (
        <div >
            <div className="">
                <div className=" mb-5">
                    <h1 className="text-2xl font-semibold">Tasks</h1>
                    <VideoCall/>
                </div>
                <main className=" ">
                    <div className="flex p-6 justify-between">
                        <div>list Task</div>
                        <div>process</div>
                    </div>
                    <div className=" ">
                        {data?.map(Item => (
                            <>
                                <div className="flex items-center shadow-lg border p-3 rounded-md mb-2">
                                    <Projector className=" h-5 w-5 mr-3" /><h5>{Item.name}</h5>
                                </div>
                                <ul className="pl-10 ">
                                    <li className=" grid grid-cols-2 gap-4 py-1 border rounded-md cursor-pointer shadow-sm mb-1">
                                        <h5 className="col-start-1 col-span-1 p-2 ">name task</h5>
                                        <h5 className="col-start-2 col-span-2 p-2 ">in Progress</h5>
                                    </li>
                                </ul>
                            </>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
