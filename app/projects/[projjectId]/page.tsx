'use client';
import ProjectHeader from '@/components/project/projectHeader/projectHeader';
import ProjectTodo from '@/components/project/projectTodo/projectTodo';
import { getProjectId } from '@/lib/store/features/projectSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { ProjectDetails } from '@/types/project';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function ProjectId({ params }: { params: { projjectId: string } }) {
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<ProjectDetails>()
    const refresh = useSelector((state: RootState) => state.task.refresh);

    useEffect(() => {
        (async () => {
            const res = await dispatch(getProjectId(params.projjectId));
            if (getProjectId.fulfilled.match(res)) {
                setData(res.payload);
            }
        })();
    }, [refresh, params.projjectId])

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 p-6 ">
                    <ProjectHeader data={data} />
                    <ProjectTodo data={data} />
                </main>
            </div>
        </div>
    );
}
