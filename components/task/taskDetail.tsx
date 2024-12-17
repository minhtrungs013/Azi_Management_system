"use client"
import { setRefresh, updateTask } from "@/lib/store/features/taskSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { checkRuleAccess, handleUploadCloudinary } from "@/lib/utils";
import { members } from "@/types/auth";
import { Cards, issueTypes } from "@/types/project";
import { CaseSensitive, Edit, FileCheck2, Power, Save, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const TaskDetail = ({ closeModal, task, allMemberProject }: { closeModal: () => void, task: Cards | undefined, allMemberProject: members[] | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedRole, setSelectedRole] = useState(issueTypes[0].value);
    const [isEditTask, setIsEditTask] = useState<boolean>(true);
    const [filteredUsers, setFilteredUsers] = useState<members[]>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>(task?.assignee?.name || '');
    const authState = useSelector((state: RootState) => state.auth);
    const [editTask, setEditTask] = useState({
        listId: task?.listId,
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        issueType: task?.issueType,
        position: task?.position,
        image_urls: task?.image_urls || [],
        dueDate: "2024-10-02T08:56:50.403Z",
        assignee: task?.assignee?._id
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditTask((prevEditTask) => {
            return {
                ...prevEditTask,
                [name]: value || '',
            };
        });
    };



    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target?.files
        if (files) {
            const images = await handleUploadCloudinary(files)
            if (images && images?.length > 0) {
                setEditTask((prevEditTask) => {
                    return {
                        ...prevEditTask,
                        image_urls: prevEditTask?.image_urls
                            ? [...prevEditTask.image_urls, ...(images || [])] // Add to the existing image_urls
                            : images || [],
                    };
                });
                if (task) {
                    task.image_urls = editTask.image_urls || [];
                }
            }
        }

    };

    const handleOpenEditTask = async () => {
        if (allMemberProject) {
            const user = allMemberProject.find((user: members) => user.user._id === authState.userId)
            if (user && task) {
                const hasPermission = await checkRuleAccess(['task_admin', 'project_admin', 'content_editor'], user)
                if (!hasPermission && authState.userId !== task.reporter?._id && authState.userId !== task.assignee?._id) {
                    toast.warning('You have no permission to edit this task!', {
                        position: "bottom-left",
                        autoClose: 5000,
                    });
                    return;
                }
            }
        }
        setIsEditTask(!isEditTask);
    }

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

    const handleSubmitUser = (value: members) => {
        setEditTask((prevEditTask) => {
            return {
                ...prevEditTask,
                assignee: value.user._id || '',
            };
        });
        setValue(value.user.name || '')
        sethowSearchUser(false);
    };
    const handleEditTask = async () => {
        if (task?._id) {
            const result = await dispatch(updateTask({ taskId: task?._id, data: editTask }))
            if (updateTask.fulfilled.match(result)) {
                toast.success("Update task successfully!", {
                    position: "bottom-right",
                    autoClose: 5000,
                });
                dispatch(setRefresh(true));
                // closeModal();
                setIsEditTask(!isEditTask);
            } else {
                console.log(result);
            }
        }
    }

    const formatTime = (date: string | undefined): string => {
        if (!date) return '';
        const dateformat = new Date(date);
        const day = String(dateformat.getDate()).padStart(2, '0');
        const month = String(dateformat.getMonth() + 1).padStart(2, '0'); // getMonth() trả về 0-11, nên cộng thêm 1
        const year = dateformat.getFullYear();
        const hours = String(dateformat.getHours()).padStart(2, '0');
        const minutes = String(dateformat.getMinutes()).padStart(2, '0');

        // Định dạng thành chuỗi
        return `${day}-${month}-${year}   ${hours}:${minutes}`;
    }

    return (
        <div className="min-w-[900px]  flex flex-col justify-center sm:py-12">
            <div className="py-3 ">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[900px] min-h-[600px] mx-auto max-h-[800px]  overflow-y-auto section">
                        <h1 className="text-2xl font-semibold text-gray-700  flex items-center ">{task?.title}</h1>
                        <div className="flex items-center mb-8 mt-3">
                            {isEditTask ?
                                <button onClick={() => handleOpenEditTask()} className="px-4 py-3 bg-gray-50  shadow-md border-gray-50  rounded-md flex items-center text-sm font-medium hover:text-red-500"><Edit className='h-5 w-5 mr-2 ' /> Edit</button>
                                :
                                <button onClick={() => handleEditTask()} className="px-4 py-3 bg-gray-50  shadow-md border-gray-50  rounded-md flex items-center text-sm font-medium hover:text-blue-500"><Save className='h-5 w-5 mr-2 ' /> Save</button>
                            }
                        </div>
                        <div className="grid grid-cols-3 gap-4 my-5 ">
                            <div className=" col-start-1 col-span-2  p-2 ">
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Detail: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-red-700">
                                            issueType: <select
                                                id="issueType"
                                                name="issueType"
                                                disabled={true}
                                                onChange={handleChange}
                                                defaultValue={task?.issueType}
                                                className="border border-gray-300 text-black rounded-md p-[9px] w-full cursor-pointer ml-2 ">
                                                <option value="">Select issue</option>
                                                <option value="task"> Task </option>
                                                <option value="bug">Bug</option>
                                                <option value="story">Story</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center  text-blue-700">
                                            Priority: <select
                                                id="priority"
                                                name="priority"
                                                disabled={isEditTask}
                                                onChange={handleChange}
                                                defaultValue={task?.priority}
                                                className="border border-gray-300 text-black rounded-md p-[9px] w-full cursor-pointer ml-2 ">
                                                <option value="">Select priority</option>
                                                <option value="low"> Low </option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Description: </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        disabled={isEditTask}
                                        onChange={handleChange}
                                        defaultValue={task?.description}
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                        placeholder="Enter project description"
                                        // rows="4"
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Attachments: </label>
                                    {!isEditTask && <input type="file" onChange={handleImage} multiple />}
                                    {editTask?.image_urls.length == 0 ? <p className="ml-2 text-sm text-black  p-2"> No file Attachments...</p> :
                                        <div className="flex items-center pt-4">
                                            {editTask?.image_urls.map(imageUrl => (
                                                <img src={imageUrl} alt="Avatar 1" className="bg-white h-24 w-24 rounded-md border-2 shadow-md mr-2 cursor-pointer" />
                                            ))
                                            }
                                        </div>
                                    }
                                </div>
                                <div className="">
                                    <label className=" text-black flex items-center font-semibold mb-1"> Activity: </label>
                                    <div className="my-5 p-2 max-h-44  overflow-y-auto section border-gray-300 rounded-md border">
                                        {editTask?.image_urls.length == 0 ?
                                            <p className="ml-2 text-sm text-black  p-2"> No comment this task...</p>
                                            :
                                            <div className="border-b-[1px] border-gray-300 pb-2 mb-2">
                                                <label className=" text-black flex items-center mb-2">
                                                    <Link href={'/'} className="text-blue-700 underline flex items-center mr-2">
                                                        <img src={`https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg`} alt="Avatar 1" className="bg-white h-6 w-6 rounded-full border cursor-pointer mr-2" /> Vy Nguyễn
                                                    </Link>
                                                    added a comment - yesterday </label>
                                                <p className="ml-8 text-sm">haihaihaiihihiahihi</p>
                                            </div>
                                        }
                                    </div>
                                    <div className="flex items-center mt-5">
                                        <input type="text" className="p-2 w-full border border-gray-400 rounded-md mr-3" placeholder="Add Comment" />
                                        <Send className="h-5 w-5 text-blue-600 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-start-3 col-span-3 ">
                                <div className="mb-2">
                                    <label className=" text-black flex items-center font-semibold mb-1"> People: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-red-700">
                                            Reporter: <input type="text" className="ml-2 text-sm text-black w-full border border-gray-300 rounded-md p-2" disabled={true} placeholder="" defaultValue={task?.reporter?.name} />
                                        </div>
                                        <div className="relative flex items-center  text-blue-700">
                                            Assignee:
                                            <input
                                                type="text"
                                                id="assignedUserId"
                                                value={value}
                                                onChange={handleSeachUser}
                                                disabled={isEditTask}
                                                name="assignedUserId"
                                                className="text-md ml-2 text-sm text-black w-full border border-gray-300 rounded-md  p-2"
                                                placeholder="eg.., Maria, Maria@gmail.com"
                                                required
                                            />
                                            {isShowSearchUser && filteredUsers && filteredUsers?.length > 0 &&
                                                <ul className="absolute top-[40px] w-full bg-white border rounded-md mt-1 shadow-lg z-10 overflow-y-auto max-h-52">
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
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Dates: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-green-700">
                                            Create: <span className="text-md ml-2 text-xs text-black">{formatTime(task?.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center  text-blue-700">
                                            Updated: <span className="text-md ml-2 text-xs text-black">{formatTime(task?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
