"use client"
import { getProjectById } from "@/lib/store/features/projectSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { Project, ProjectList } from "@/types/project";
import { ArrowUpDown, Box, Edit3, Eye, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import CreateOrUpdateProjectForm from "./createOrUpdateProjectForm";
import DeleteProject from "./deleteProject";

const TableListProjects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const refresh = useSelector((state: RootState) => state.project.refresh);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    const closeModal = () => setModalOpen(false);
    const [projects, setProjects] = useState<ProjectList>([]);
    const [project, setProject] = useState<Project>();
    const [status, setStatus] = useState<boolean>();

    const openModal = (project: Project, status: boolean) => {
        if (status === true) {
            setStatus(status)
        } else {
            setStatus(status)
        }
        setProject(project)
        setModalOpen(true)
    };

    useEffect(() => {
        (async () => {
            const res = await dispatch(getProjectById());
            if (getProjectById.fulfilled.match(res)) {
                setProjects(res.payload);
            }
        })();
    }, [refresh])

    return (
        <div className=''>
            <table className="min-w-full bg-white border border-gray-200 ">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Project Name <ArrowUpDown className="inline-block w-4 h-4 ml-1" />
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            description <ArrowUpDown className="inline-block w-4 h-4 ml-1" />
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Role <ArrowUpDown className="inline-block w-4 h-4 ml-1" />
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {projects?.map(project => (
                        <tr className="border-b" key={project._id}>
                            <td className="py-4 px-6"><Link href={`/projects/${project._id}`} className="mr-2 p-2  text-blue-500 underline flex items-center"> <Box className="w-7 h-7 mr-2 text-purple-600" />{project.name}</Link></td>
                            <td className="py-4 px-6">{project.description}</td>
                            <td className="py-4 px-6">Admin</td>
                            <td className="py-4 px-6 text-center flex items-center justify-center">
                                <Link href={`/projects/${project._id}`} className="mr-2 p-2 hover:bg-gray-200 rounded block w-8">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                </Link>
                                <button onClick={() => openModal(project, true)} className="mr-2 p-2 hover:bg-gray-200 rounded">
                                    <Edit3 className="w-4 h-4 text-green-500" />
                                </button>
                                <button onClick={() => openModal(project, false)} className="p-2 hover:bg-gray-200 rounded">
                                    <Trash className="w-4 h-4 text-red-500" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                {status ? <CreateOrUpdateProjectForm closeModal={closeModal} projectId={project} />
                    :
                    <DeleteProject closeModal={closeModal} projectId={project} />
                }
            </Modal>
        </div>
    );
};

export default TableListProjects;
