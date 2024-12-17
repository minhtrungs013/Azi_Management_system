"use client"
import { createProject, setRefresh, updateProjectById } from '@/lib/store/features/projectSlice';
import { AppDispatch } from '@/lib/store/store';
import { Project, projectPayload, ProjectUpdate } from '@/types/project';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const CreateOrUpdateProjectForm = ({ closeModal, projectId }: { closeModal: () => void; projectId: Project | undefined }) => {
    const [project, setProject] = useState<projectPayload>({
        name: '',
        description: '',
    })
    const dispatch = useDispatch<AppDispatch>();


    useEffect(() => {
        if (projectId !== undefined) {
            setProject({
                name: projectId?.name,
                description: projectId?.description,
            });
        }
    }, [])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProject((prevProject) => {
            return {
                ...prevProject,
                [name]: value || '',
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (project?.name === '' || project?.description === '') {
            toast.error('Please fill all required fields', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        }

        try {
            if (projectId === undefined) {
                const result = await dispatch(createProject(project));
                if (createProject.fulfilled.match(result)) {
                    toast.success(`Create project ${project?.name} successfully`, {
                        position: 'bottom-right',
                        autoClose: 5000,
                    });
                    dispatch(setRefresh(true));
                    closeModal();
                }

            } else {
                const Project: ProjectUpdate = {
                    id: projectId._id,
                    name: project.name,
                    description: project.description,
                }
                const result = await dispatch(updateProjectById({ url: `${projectId._id}`, payload: project }));
                if (updateProjectById.fulfilled.match(result)) {
                    dispatch(setRefresh(true));
                    toast.success(`Update project ${project?.name} successfully`, {
                        position: 'bottom-right',
                        autoClose: 5000,
                    });
                    closeModal();
                }

            }

        } catch (error: any) {
            toast.error(error.message || 'An error occurred', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        } finally {
            setProject({
                name: '',
                description: ''
            });
        }
    };

    return (
        <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
            <div className=" py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[500px] mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8">{projectId === undefined ? 'Add New Project' : 'Edit Project'}</h1>
                        <form onSubmit={handleSubmit}>
                            <div className='flex'>
                                <div className="relative mb-5 w-full">
                                    <input
                                        type="text"
                                        name='name'
                                        defaultValue={project.name}
                                        placeholder="project name"
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                    />
                                </div>
                                <div className="relative mb-5 ml-2 w-full">
                                    <input
                                        type="text"
                                        name='description'
                                        defaultValue={project.description}
                                        placeholder="Description"
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                    />
                                </div>
                            </div>
                            <div className='flex justify-end'>
                                <button onClick={closeModal} type="submit" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                    Cancel
                                </button>
                                <button type="submit" className=" px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOrUpdateProjectForm;
