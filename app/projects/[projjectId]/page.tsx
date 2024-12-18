'use client';
import ProjectHeader from '@/components/project/projectHeader/projectHeader';
import ProjectTodo from '@/components/project/projectTodo/projectTodo';
import { getProjectId } from '@/lib/store/features/projectSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { ProjectDetails } from '@/types/project';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function ProjjectId({ params }: { params: { projjectId: string } }) {
//     const dispatch = useDispatch<AppDispatch>();
//     const [data, setData] = useState<ProjectDetails>()
//     const refresh = useSelector((state: RootState) => state.task.refresh);
// console.log('https://azi-api-nestjs.onrender.com/projects/66f8e3d466362373a15921d3');

//     useEffect(() => {
//         (async () => {
//             const res = await dispatch(getProjectId(params.projjectId));
//             if (getProjectId.fulfilled.match(res)) {
//                 setData(res.payload);
//             }
//         })();
//     }, [refresh, params.projjectId])

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 p-6 ">
                    hihih
                    {/* <ProjectHeader data={data} />
                    <ProjectTodo data={data} /> */}
                </main>
            </div>
        </div>
    );
}
