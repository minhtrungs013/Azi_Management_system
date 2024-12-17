"use client"
import { createtask, setRefresh } from "@/lib/store/features/taskSlice";
import { AppDispatch } from "@/lib/store/store";
import { members } from "@/types/auth";
import { taskPayload } from "@/types/task";
import { Bug, CaseSensitive, FileCheck2, ShieldAlert, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CreateTask = ({ closeModal, listId, allMemberProject }: { closeModal: () => void, listId: string | undefined, allMemberProject: members[] | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [filteredUsers, setFilteredUsers] = useState<members[]>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
console.log(allMemberProject);

    const [createTask, setCreateTask] = useState({
        title: "",
        description: "",
        priority: "low",
        issueType: '',
        position: 0,
        assignee: '',
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
    const handleSubmitUser = (value: members) => {
        setCreateTask((prevTask) => {
            return {
                ...prevTask,
                assignee: value.user._id || '',
            };
        });
        setValue(value.user.name || '')
        sethowSearchUser(false);
    };

    const handleSeachUser = (e: React.ChangeEvent<HTMLInputElement>) => {
        const lowerCaseValue = e.target.value.toLowerCase();
        setValue(e.target.value);
        sethowSearchUser(true);
        if (lowerCaseValue === undefined || lowerCaseValue === '') {
            setFilteredUsers([]);
            return;
        }
        const filteredUsers = allMemberProject?.filter((user) =>
            user?.user.name && user?.user.name.toLowerCase().includes(lowerCaseValue) ||
            user?.user.email && user?.user.email.toLowerCase().includes(lowerCaseValue)
        );
        setFilteredUsers(filteredUsers)
    };
    const handleCreateTask = async () => {
        if (listId) {
            const task: taskPayload = {
                listId: listId,
                title: createTask.title,
                description: createTask.description,
                position: 0,
                issueType: createTask.issueType,
                priority: createTask.priority,
                assignee: createTask.assignee,
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
                                <label htmlFor="title" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Title</label>
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
                                <label htmlFor="description" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2  text-blue-600" />Description</label>
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
                            <div className="flex items-center">

                                <div className="mb-4 w-full mr-2">
                                    <label htmlFor="assignedUserIds" className="flex items-center text-gray-700 mb-2">  <Bug className="h-7 w-7 mr-2 text-red-600" />Issue Type</label>
                                    <select
                                        id="issueType"
                                        name="issueType"
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-md p-[9px] w-full cursor-pointer">
                                        <option value="">Select issue</option>
                                        <option value="task"> Task </option>
                                        <option value="bug">Bug</option>
                                        <option value="story">Story</option>
                                    </select>
                                </div>
                                <div className="mb-4 w-full">
                                    <label htmlFor="assignedUserIds" className="flex items-center text-gray-700 mb-2">  <ShieldAlert className="h-7 w-7 mr-2 text-red-600" />Priority</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-md p-[9px] w-full cursor-pointer">
                                        <option value="">Select priority</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4 w-full mr-5 relative">
                                <label htmlFor="assignedUserId" className="flex items-center text-gray-700 mb-3">  <UserPlus className="h-6 w-6 mr-2 text-amber-600" />Assignee</label>
                                <input
                                    type="text"
                                    id="assignedUserId"
                                    value={value}
                                    onChange={handleSeachUser}
                                    name="assignedUserId"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="eg.., Maria, Maria@gmail.com"
                                    required
                                />
                                {isShowSearchUser && filteredUsers && filteredUsers?.length > 0 &&
                                    <ul className="absolute w-full bg-white border rounded-md mt-1 shadow-lg z-10 overflow-y-auto max-h-52">
                                        {filteredUsers?.map((filteredUser) => (
                                            <li
                                                key={filteredUser.user._id}
                                                onClick={() => handleSubmitUser(filteredUser)}
                                                className={`p-2 hover:bg-blue-100 cursor-pointer`}
                                            >
                                                <div className="flex">
                                                    <img src={filteredUser.user.avatar_url} alt="" className="h-10 w-10 rounded-full border-2  border-gray-100 mr-2" />
                                                    <div>
                                                        <div className={` text-base text-gray-900 `}>{filteredUser.user.name}</div>
                                                        <p className="text-xs text-gray-600">{filteredUser.user.email}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                }
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
