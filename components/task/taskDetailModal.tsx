"use client"
import { setRefresh, updateTask } from "@/lib/store/features/taskSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { checkRuleAccess, handleUploadCloudinary } from "@/lib/utils";
import { members } from "@/types/auth";
import { Cards, issueTypes } from "@/types/project";
import { BookmarkCheck, Bug, CaseSensitive, CircleDashed, DoorOpen, Edit, Eye, FileCheck2, Leaf, Power, Save, Send, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import CopyButton from "../common/copyButton";
import { Button } from "../ui/button";
import Image from "next/image";
import { AvatarUser } from "../common/AvatarUser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const TaskDetailModal = ({ closeModal, task, allMemberProject, projjectId }: { closeModal: () => void, task: Cards | undefined, allMemberProject: members[] | undefined, projjectId: string | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedRole, setSelectedRole] = useState(issueTypes[0].value);
    const [isEditTask, setIsEditTask] = useState<boolean>(true);
    const [filteredUsers, setFilteredUsers] = useState<members[]>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>(task?.assignee?.firstname + " " + task?.assignee?.lastname || '');
    const authState = useSelector((state: RootState) => state.auth);
    const [editTask, setEditTask] = useState({
        listId: task?.listId,
        title: task?.title,
        description: task?.description,
        priority: task?.priority,
        issueType: task?.issueType,
        position: task?.position,
        image_urls: task?.image_urls || [],
        startDate: task?.startDate,
        endDate: task?.endDate,
        assignee: task?.assignee?._id,
        reporter: task?.reporter?._id

    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const dateFields = ['startDate', 'endDate'];
        const newValue = dateFields.includes(name) ? value + ':00.000Z' : value;
        setEditTask((prevEditTask) => {
            return {
                ...prevEditTask,
                [name]: newValue || '',
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
            user?.user.firstname && user?.user.firstname.toLowerCase().includes(lowerCaseValue) ||
            user?.user.lastname && user?.user.lastname.toLowerCase().includes(lowerCaseValue) ||
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
        setValue((value.user.firstname ?? '') + " " + (value.user.lastname ?? '') || '')
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

    const formatDateTimeForInput = (dateString: string) => {
        if (!dateString) return ''; // Nếu không có giá trị
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Nếu không hợp lệ
        return date.toISOString().slice(0, 16); // Cắt tới yyyy-MM-ddTHH:mm
    };

    const adjustForTimezone = (dateString: string) => {
        const localDate = new Date(dateString);
        return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
    };

    return (
        <div className="md:w-[900px] xl:w-[1300px] lg:w-[1000px] flex flex-col justify-center sm:py-12">
            <div className="py-3">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl ">
                    <div className="overflow-y-auto section">
                        <div className="grid grid-cols-3 gap-4 my-5 ">
                            <div className="col-start-1 col-span-2 p-2 ">
                                {isEditTask ?
                                    <h1 className="text-2xl font-semibold text-gray-700 max-w-[800px] line-clamp-2">{task?.title}</h1>
                                    :
                                    <textarea className="ml-2 text-2xl font-semibold w-full max-w-[850px] border text-gray-700 border-gray-300 rounded-md p-2" name="title" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={task?.title} ></textarea>
                                }
                            </div>
                            <div className="col-start-3 col-span-3 flex justify-between">
                                <div className="flex items-center mb-8 mt-3">
                                    {isEditTask ?
                                        <Button onClick={() => handleOpenEditTask()} variant="outline" size="sm" className="mr-2 hover:text-red-500"><Edit className='h-5 w-5 mr-2 ' /> Edit</Button>
                                        :
                                        <Button onClick={() => handleEditTask()} variant="outline" size="sm" className="mr-2 hover:text-blue-500"><Save className='h-5 w-5 mr-2 ' /> Save</Button>
                                    }
                                    <CopyButton label={`${task?.identifier}`} copyText={`http://localhost:3000/projects/${projjectId}/tasks/${task?.identifier}`} />
                                </div>
                                <div className="flex items-center mb-8 mt-3">
                                    <Button onClick={(e) => closeModal()} variant="outline" size="sm" className="px-4 py-3 flex items-center text-sm font-medium hover:text-red-500"><X /></Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 my-5 ">
                            <div className=" col-start-1 col-span-2  p-2 ">
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Detail: </label>
                                    <div className="grid grid-cols-2 gap-2 ml-2 py-2">
                                        <div className="text-gray-700 font-medium">
                                            <p className="mb-1">Type </p>
                                            <p className="bg-gray-100 text-black rounded-sm p-[9px] w-[100%] cursor-pointer">{task?.issueType}</p>
                                        </div>
                                        <div className="text-gray-700 font-medium">
                                            <p className="mb-1">Priority </p>
                                            {isEditTask ?
                                                <p className=" bg-gray-100 text-black rounded-sm p-[9px] w-[100%] cursor-pointer">{task?.priority}</p>
                                                :
                                                <select
                                                    id="priority"
                                                    name="priority"
                                                    disabled={isEditTask}
                                                    onChange={handleChange}
                                                    defaultValue={task?.priority}
                                                    className="border border-gray-300 text-black rounded-md p-[9px] w-[100%] cursor-pointer">
                                                    <option value="">Select priority</option>
                                                    <option value="low"> Low </option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Description: </label>
                                    <div className="ml-2">
                                        <textarea
                                            id="description"
                                            name="description"
                                            disabled={isEditTask}
                                            onChange={handleChange}
                                            defaultValue={task?.description}
                                            className="border border-gray-300 rounded-md p-2 w-full min-h-[200px]"
                                            placeholder="Enter project description"
                                            // rows="4"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Attachments: </label>
                                    {!isEditTask && <input type="file" onChange={handleImage} multiple />}
                                    {editTask?.image_urls.length == 0 ? <p className="text-sm text-black  p-2"> No file Attachments...</p> :
                                        <div className="flex items-center pt-4">
                                            {editTask?.image_urls?.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt="Avatar 1" className="bg-white h-24 w-24 rounded-md border-2 shadow-md mr-2 cursor-pointer" />
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
                                                        <AvatarUser name={"Vy Nguyễn"} url={`https://internetviettel.vn/wp-content/uploads/2017/05/1-2.jpg`} className="bg-white h-6 w-6 rounded-full border cursor-pointer mr-2" />
                                                        Vy Nguyễn
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
                                    <div className="flex items-center mb-2 ">
                                        <Select defaultValue="system">
                                            <SelectTrigger className="w-[180px] font-medium bg-green-100 border-none" >
                                                <SelectValue placeholder="Theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light"> <div className="flex items-center justify-between text-gray-600"> <DoorOpen /> <span className="ml-2 font-medium">OPEN</span></div></SelectItem>
                                                <SelectItem value="dark"><div className="flex items-center justify-between text-gray-600"> <BookmarkCheck /> <span className="ml-2 font-medium">TO DO</span></div></SelectItem>
                                                <SelectItem value="system"><div className="flex items-center justify-between text-orange-600"> <CircleDashed /> <span className="ml-2 font-medium">IN-PROGRESS</span></div></SelectItem>
                                                <SelectItem value="system1"><div className="flex items-center justify-between text-red-500"> <Bug /> <span className="ml-2 font-medium ">BUG</span></div></SelectItem>
                                                <SelectItem value="system2"><div className="flex items-center justify-between text-blue-600"> <Eye /> <span className="ml-2 font-medium">IN-REVIEW</span></div></SelectItem>
                                                <SelectItem value="system3"> <div className="flex items-center justify-between text-green-600"> <Leaf /> <span className="ml-2 font-medium">DONE</span></div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className=" text-black flex items-center font-semibold mb-1"> People: </label>
                                    <div className="ml-2 py-2 ">
                                        <div className="flex items-center mb-2 ">
                                            <span className="text-sm w-[125px] text-gray-700 font-medium">Reporter </span>
                                            <AvatarUser name={task?.reporter?.firstname + " " + task?.reporter?.lastname} url={task?.assignee?.avatar_url} className="ml-2 h-10 min-w-10 w-10 rounded-full border-2 border-gray-100" />
                                            <p className=" text-sm text-black w-full p-2">{task?.reporter?.firstname + " " + task?.reporter?.lastname}</p>
                                        </div>
                                        <div className="relative flex items-center ">
                                            <span className="text-sm w-[125px] text-gray-700 font-medium">Assignee </span>
                                            {isEditTask ?
                                                <>
                                                    <AvatarUser name={task?.assignee?.firstname + " " + task?.assignee?.lastname} url={task?.assignee?.avatar_url} className="ml-2 h-10 min-w-10 w-10 rounded-full border-2 border-gray-100" />
                                                    <p className=" text-sm text-black w-full p-2">{task?.assignee?.firstname + " " + task?.assignee?.lastname}</p>
                                                </>
                                                :
                                                <>
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
                                                                        <AvatarUser name={filteredUser.user.firstname + " " + filteredUser.user.lastname} url={filteredUser.user.avatar_url} className="h-10 w-10 rounded-full border-2  border-gray-100 mr-2" />
                                                                        <div>
                                                                            <div className={` text-base text-gray-900 `}>{filteredUser.user?.firstname + " " + filteredUser.user?.lastname}</div>
                                                                            <p className="text-xs text-gray-600">{filteredUser.user.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    }
                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Dates: </label>
                                    <div className="ml-2 py-2 font-medium">
                                        <div className="flex items-center mb-2 ">
                                            <span className="text-sm w-[125px] text-gray-700 ">Create At</span> <p className="text-sm  text-black rounded-sm p-[9px] w-[100%]">{formatTime(task?.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center ">
                                            <span className="text-sm w-[125px] text-gray-700 "> Updated At </span><p className="text-sm text-black rounded-sm p-[9px] w-[100%]">{formatTime(task?.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Progress: </label>
                                    <div className="ml-2 py-2 font-medium">
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-sm w-[125px] text-gray-700 ">Start Date </span>
                                            {isEditTask ?
                                                <p className="  text-black rounded-sm p-[9px] w-[100%]">{formatTime(task?.startDate || '')}</p>
                                                :
                                                <input type="datetime-local" className="ml-2 text-sm text-black  w-full border border-gray-300 rounded-md p-2" name="startDate" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={formatDateTimeForInput(task?.startDate || '')} />
                                            }
                                        </div>
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-sm w-[125px] text-gray-700 ">End Date </span>
                                            {isEditTask ?
                                                <p className="  text-black rounded-sm p-[9px] w-[100%] cursor-pointer">{formatTime(task?.endDate || '')}</p>
                                                :
                                                <input type="datetime-local" className="ml-2 text-sm text-red-600 font-semibold w-full border border-gray-300 rounded-md p-2" name="endDate" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={formatDateTimeForInput(task?.endDate || '')} />
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Other: </label>
                                    <div className="ml-2 py-2 font-medium">
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-sm w-[125px] text-gray-700 ">Affects Build/s </span>
                                            {isEditTask ?
                                                <p className="  text-black rounded-sm p-[9px] w-[100%]">v10.5.1</p>
                                                :
                                                <input type="text" className="ml-2  text-black  w-full border border-gray-300 rounded-sm p-[9px]" name="AffectsBuild" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={'v10.5.2'} />
                                            }
                                        </div>
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-sm w-[125px] text-gray-700 ">Fix versions </span>
                                            {isEditTask ?
                                                <p className="  text-black rounded-sm p-[9px] w-[100%]">v10.5.1</p>
                                                :
                                                <input type="text" className="ml-2  text-black  w-full border border-gray-300 rounded-sm p-[9px]" name="FixVersions" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={'v10.5.2'} />
                                            }
                                        </div>
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-sm w-[125px] text-gray-700 ">Fix Build/s </span>
                                            {isEditTask ?
                                                <p className=" text-black rounded-sm p-[9px] w-[100%]">v10.5.2</p>
                                                :
                                                <input type="text" className="ml-2  text-red-600 w-full border border-gray-300 rounded-sm p-[9px]" name="FixBuild" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={'v10.5.2'} />
                                            }
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

export default TaskDetailModal;
