"use client"
import { createtask, setRefresh } from "@/lib/store/features/taskSlice";
import { AppDispatch } from "@/lib/store/store";
import { taskPayload } from "@/types/task";
import { FileCheck2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CreateTask = ({ closeModal, listId }: { closeModal: () => void, listId: string | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [createTask, setCreateTask] = useState({
        title: "",
        description: "",
        priority: "low",
    })
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCreateTask((prevTask) => {
            return {
                ...prevTask,
                [name]: value || '',
            };
        });
    };
    const handleCreateTask = async () => {
        if (listId) {
            const task: taskPayload = {
                listId: listId,
                title: createTask.title,
                description: createTask.description,
                position: 0,
                priority: createTask.priority,
                assignedUserIds: [],
                image_urls: [],
            }
            const result = await dispatch(createtask(task));
            if (createtask.fulfilled.match(result)) {
                toast.success("Task create successfully!", {
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
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center "> <FileCheck2 className="h-10 w-10 mr-3 text-green-400" /> Create Task</h1>
                        <form action="">
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="Enter project title"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="Enter project description"
                                    // rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="assignedUserId" className="block text-gray-700 mb-2">Assigned User</label>
                                <input
                                    type="text"
                                    id="assignedUserId"
                                    onChange={handleChange}
                                    name="assignedUserId"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="Enter project title"
                                    required
                                />
                            </div>
                            <div className="mb-7">
                                <label htmlFor="assignedUserIds" className="block text-gray-700 mb-2">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </form>
                        <div className='flex justify-end'>
                            <button onClick={closeModal} type="button" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                Cancel
                            </button>
                            <button onClick={handleCreateTask} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTask;
