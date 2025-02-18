'use client';
import { ReactNode } from 'react';

interface ProjectLayoutProps {
  children: ReactNode;
}

const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children }) => {

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 p-6 ">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ProjectLayout;
