"use client"
import { deleteProjectById, setRefresh } from "@/lib/store/features/projectSlice";
import { AppDispatch } from "@/lib/store/store";
import { Project } from "@/types/project";
import { TriangleAlert } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const DeleteProject = ({ closeModal, projectId }: { closeModal: () => void; projectId: Project | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();


    const handleDelete = async () => {
        if (projectId) {
            const result = await dispatch(deleteProjectById(projectId._id));
            if (deleteProjectById.fulfilled.match(result)) {
                toast.success("Project deleted successfully!", {
                    position: "bottom-right",
                    autoClose: 5000,
                });
                dispatch(setRefresh(true));
                closeModal();
            }
        }
    }

    return (
        <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
            <div className="py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[500px] mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center "> <TriangleAlert className="h-10 w-10 mr-3 text-red-400"/> Delete Project</h1>
                        <p className="text-black font-semibold mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
                        <p className="text-gray-600  text-sm">Please confirm that you want to permanently remove the project named <strong className="text-red-500">{projectId?.name}</strong> from your account.</p>
                        <div className='flex justify-end'>
                            <button onClick={closeModal} type="button" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteProject;
