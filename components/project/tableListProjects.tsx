"use client"
import { getAllMemberProject, getProjectById } from "@/lib/store/features/projectSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { members } from "@/types/auth";
import { Project, ProjectList } from "@/types/project";
import { Edit3, Eye, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import CreateOrUpdateProjectForm from "./createOrUpdateProjectForm";
import DeleteProject from "./deleteProject";

const roleColors: Record<string, string> = {
    commenter: "bg-gray-300 text-gray-800", 
    viewer: "bg-blue-400 text-white",     
    member_manager: "bg-green-400 text-white", 
    content_editor: "bg-orange-400 text-white",
    task_admin: "bg-red-500 text-white",    
};

const TableListProjects = () => {
    const dispatch = useDispatch<AppDispatch>();
    const refresh = useSelector((state: RootState) => state.project.refresh);
    const authState = useSelector((state: RootState) => state.auth);
    const [projects, setProjects] = useState<ProjectList>([]);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [allRoles, setAllRoles] = useState<{ [key: string]: any[] }>({});
    const [project, setProject] = useState<Project>();
    const [status, setStatus] = useState<boolean>();

    const closeModal = () => setModalOpen(false);
    const openModal = (project: Project, status: boolean) => {
        setStatus(status);
        setProject(project);
        setModalOpen(true);
    };

    useEffect(() => {
        // Fetch all projects
        (async () => {
            const res = await dispatch(getProjectById());
            if (getProjectById.fulfilled.match(res)) {
                setProjects(res.payload);
                console.log(res.payload);

            }
        })();
    }, [refresh]);

    // Fetch roles for each project
    useEffect(() => {
        const fetchRoles = async () => {
            const rolesMap: { [key: string]: any[] } = {};
            for (const project of projects) {
                const resAllMemberProject = await dispatch(getAllMemberProject(project._id));
                if (getAllMemberProject.fulfilled.match(resAllMemberProject)) {
                    const user: members = resAllMemberProject.payload.find(
                        (user: members) => user.user._id === authState.userId
                    );
                    if (user) {
                        rolesMap[project._id] = user.permissions;
                    }
                }
            }
            setAllRoles(rolesMap);
        };

        if (projects.length > 0) {
            fetchRoles();
        }
    }, [projects]);

    return (
        <div className="">
            <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Project Name
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {projects?.map((project) => (
                        <tr className="border-b" key={project._id}>
                            <td className="py-4 px-6">
                                <Link
                                    href={`/projects/${project._id}`}
                                    className="mr-2 p-2 text-blue-500 underline flex items-center"
                                >
                                    {project.name}
                                </Link>
                            </td>
                            <td className="py-4 px-6">{project.description}</td>
                            <td className="py-4 px-6 ">
                                {allRoles[project._id]?.map((role, index) => (
                                    <>
                                        <p key={index} className={`max-w-[112px] mb-1 text-xs px-2 py-1 rounded-md ${roleColors[role.name] || "bg-gray-200 text-black"}`}>
                                            {role.label}
                                        </p>
                                    </>
                                ))}
                            </td>
                            <td className="py-4 px-6 ">
                                <div className="text-center flex items-center justify-center">
                                    <Link href={`/projects/${project._id}`} className="mr-2 p-2 hover:bg-gray-200 rounded">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                    </Link>
                                    <button onClick={() => openModal(project, true)} className="mr-2 p-2 hover:bg-gray-200 rounded">
                                        <Edit3 className="w-4 h-4 text-green-500" />
                                    </button>
                                    <button onClick={() => openModal(project, false)} className="p-2 hover:bg-gray-200 rounded">
                                        <Trash className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                {status ? (
                    <CreateOrUpdateProjectForm closeModal={closeModal} projectId={project} />
                ) : (
                    <DeleteProject closeModal={closeModal} projectId={project} />
                )}
            </Modal>
        </div>
    );
};

export default TableListProjects;
