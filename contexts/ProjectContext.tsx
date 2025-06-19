// lib/context/ProjectContext.tsx
'use client';
import { ProjectDetails } from '@/types/project';
import React, { createContext, useContext } from 'react';

const ProjectContext = createContext<{ dataProject: ProjectDetails | undefined } | undefined>(undefined);

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProject must be used within a ProjectProvider');
    return context;
};

export const ProjectProvider = ({
    dataProject,
    children,
}: {
    dataProject?: ProjectDetails;
    children: React.ReactNode;
}) => {
    return (
        <ProjectContext.Provider value={{ dataProject }}>
            {children}
        </ProjectContext.Provider>
    );
};
