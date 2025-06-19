'use client';
import ProjectHeader from '@/components/project/projectHeader/projectHeader';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { getProjectId } from '@/lib/store/features/projectSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { ProjectDetails } from '@/types/project';
import { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
interface ProjectLayoutProps {
    children: ReactNode;
    params: {
        projjectId: string;
    };
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children, params }) => {
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
    }, [refresh, params.projjectId, dispatch])
    return (
        <ProjectProvider dataProject={data}>
            <div className="flex">
                <main className="flex-1 p-6">
                    <ProjectHeader data={data} />
                    <div>{children}</div>
                </main>
            </div>
        </ProjectProvider>
    );
};

export default ProjectLayout;
