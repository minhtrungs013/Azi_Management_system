"use client"
import { useSocket } from "@/contexts/SocketContext";
import { createNotification } from "@/lib/store/features/notificationSlice";
import { getAllMemberProject, getListByProjectIdSlice } from "@/lib/store/features/projectSlice";
import { getTasksByIdSlice, moveTask, setRefresh, updateTask } from "@/lib/store/features/taskSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { checkRuleAccess, handleUploadCloudinary } from "@/lib/utils";
import { members } from "@/types/auth";
import { notificationCreate } from "@/types/notification";
import { Cards, issueTypes, listtest } from "@/types/project";
import { Select } from "@radix-ui/react-select";
import { BookOpenText, Bug, CalendarDays, ChartCandlestick, ClipboardList, Edit, FileArchive, Leaf, MessagesSquare, Save, Send, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import CopyButton from "../common/copyButton";
import { Button } from "../ui/button";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const TaskDetail = ({ taskId, projjectId }: { taskId: string, projjectId: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedRole, setSelectedRole] = useState(issueTypes[0].value);
    const [isEditTask, setIsEditTask] = useState<boolean>(true);
    const [filteredUsers, setFilteredUsers] = useState<members[]>();
    const [task, setTask] = useState<Cards>();
    const [allMemberProject, setAllMemberProject] = useState<members[]>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>(task?.assignee?.firstname + " " + task?.assignee?.lastname || '');
    const authState = useSelector((state: RootState) => state.auth);
    const userIds = allMemberProject?.map(item => item.user._id);
    const { socket, sendMessage } = useSocket();
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
    const [value1, setValue1] = useState('');
    const [list, setList] = useState<listtest[]>([]);

    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],

        // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean']                                         // remove formatting button
    ];
    const editorModule  = { toolbar: toolbarOptions }
    const fetchTask = async () => {
        const resGetTasksById = await dispatch(getTasksByIdSlice(taskId));
        if (getTasksByIdSlice.fulfilled.match(resGetTasksById)) {
            setTask(resGetTasksById.payload);
            setEditTask((prevEditTask) => ({
                ...prevEditTask,
                listId: resGetTasksById.payload?.listId,
                title: resGetTasksById.payload?.title,
                description: resGetTasksById.payload?.description,
                priority: resGetTasksById.payload?.priority,
                issueType: resGetTasksById.payload?.issueType,
                position: resGetTasksById.payload?.position,
                image_urls: resGetTasksById.payload?.image_urls || [],
                startDate: resGetTasksById.payload?.startDate,
                endDate: resGetTasksById.payload?.endDate,
                reporter: resGetTasksById.payload.reporter._id,
                assignee: resGetTasksById.payload.assignee._id
            }));
            setValue(resGetTasksById.payload?.assignee?.firstname + " " + resGetTasksById.payload?.assignee?.lastname || '');

        }
    }
    useEffect(() => {
        (async () => {
            const resAllMemberProject = await dispatch(getAllMemberProject(projjectId));
            if (getAllMemberProject.fulfilled.match(resAllMemberProject)) {
                setAllMemberProject(resAllMemberProject.payload);

            }
            const resgetListByProjectId = await dispatch(getListByProjectIdSlice(projjectId));
            if (getListByProjectIdSlice.fulfilled.match(resgetListByProjectId)) {
                setList(resgetListByProjectId.payload);
            }
            fetchTask();
        })();
    }, [projjectId, taskId])

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
                fetchTask();
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
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
    };

    const handleOnValueChange = (value: string) => {
        if (!task) return;
        dispatch(moveTask({ taskId: task?._id, listId: value }))
        const notification: notificationCreate = {
            title: 'Move Task',
            message: authState.name + ' has been moved ' + task?.title + ' to ' + list.find(item => item._id == editTask.listId)?.name,
            type: 'Task',
            link: `/projects/${projjectId}/tasks/${task?.identifier}`,
            senderId: authState.userId || '',
            notificationRecipients: userIds || []
        }
        dispatch(createNotification(notification))
        setTimeout(() => {
            sendMessage('sendNotification', { group: projjectId, message: authState.name + ' has been moved ' + task?.title + ' to ' + list.find(item => item._id == value)?.name });
        }, 1000);
        setEditTask((prevEditTask) => ({ ...prevEditTask, listId: value }))
    }
    return (
        <div className="">
            <div className="py-3 ">
                <div className="relative ">
                    <div className="min-w-[900px] min-h-[600px] mx-auto max-h-[800px]  overflow-y-auto section">
                        <div className="grid grid-cols-3 gap-4  my-5 ">
                            <div className="col-start-1 col-span-2  p-2 ">
                                <div className="flex items-center">
                                    {task?.issueType === 'task' ? <ClipboardList className='h-11 w-11  p-3 rounded-sm mr-2 text-green-600 shadow-md bg-green-50' /> :
                                        <Bug className='h-11 w-11  p-3 rounded-sm mr-2 text-red-600 shadow-md bg-red-50' />}

                                    {isEditTask ?
                                        <h1 className="text-2xl font-semibold text-gray-700  line-clamp-2">{task?.title}</h1>
                                        :
                                        <input
                                            type="text"
                                            id="title"
                                            defaultValue={task?.title}
                                            onChange={handleChange}
                                            name="title"
                                            className="ml-2 text-2xl font-semibold text-black w-full border border-gray-300 rounded-md  p-2"
                                            placeholder="eg.., Maria, Maria@gmail.com"
                                            required
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-start-3 col-span-3 flex justify-between items-center">
                                <div className="">
                                    <CopyButton label={`${task?.identifier}`} copyText={`http://localhost:3000/projects/${projjectId}/tasks/${task?.identifier}`} />
                                </div>
                                <div className="flex mt-2">
                                    {isEditTask ?
                                        <Button onClick={() => handleOpenEditTask()} variant="secondary" size="sm" className="mr-2 hover:text-red-500"><Edit className='h-5 w-5 mr-2 ' /> Edit</Button>
                                        :
                                        <div>
                                            <Button onClick={() => setIsEditTask(!isEditTask)} variant="destructive" size="sm" className="mr-2 "><X className='h-5 w-5 ' /> Cancel</Button>
                                            <Button onClick={() => handleEditTask()} variant="secondary" size="sm" className="mr-2 hover:text-blue-500"><Save className='h-5 w-5 mr-2' /> Save</Button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 my-5 ">
                            <div className=" col-start-1 col-span-2  p-2 ">
                                {/* <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> Detail: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-red-700">
                                            issueType: <p className=" text-black p-[9px] w-full cursor-pointer ml-2 ">
                                                {task?.issueType}
                                            </p>
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
                                </div> */}
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-3"> <BookOpenText className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> Description: </label>
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
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"> <FileArchive className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> Attachments: </label>
                                    {!isEditTask && <input type="file" onChange={handleImage} multiple />}
                                    {editTask?.image_urls.length == 0 ? <p className="ml-2 text-sm text-black  p-2"> No file Attachments...</p> :
                                        <div className="flex items-center pt-4">
                                            {editTask?.image_urls.map((imageUrl, index) => (
                                                <img key={index} src={imageUrl} alt="Avatar 1" className="bg-white h-24 w-24 rounded-md border-2 shadow-md mr-2 cursor-pointer" />
                                            ))
                                            }
                                        </div>
                                    }
                                </div>
                                <div className="">
                                    <label className=" text-black flex items-center font-semibold mb-1"> <MessagesSquare className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> Activity: </label>
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
                                    <div className="flex items-center mt-5 mb-10">
                                        <ReactQuill modules={editorModule} theme="snow" value={value1} onChange={setValue1} className="w-full" />

                                        <Send className="h-5 w-5 text-blue-600 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-start-3 col-span-3 ">
                                <div className="flex items-center mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mr-2">  <Leaf className='h-11 w-11  p-3 rounded-sm mr-2 text-green-600 shadow-md bg-green-50' /> Status: </label>
                                    <Select value={editTask.listId} onValueChange={(value) => handleOnValueChange(value)}>
                                        <SelectTrigger className="w-[150px] px-4 py-3 h-auto text-sm font-medium">
                                            <SelectValue>
                                                {list.find(item => item._id == editTask.listId)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent >
                                            {list?.map((item, index) => (
                                                <SelectItem key={index} value={item._id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="mb-2">
                                    <label className=" text-black flex items-center font-semibold mb-1"><Users className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> People: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-red-700">
                                            Reporter:  <img src={task?.reporter.avatar_url} alt="" className="ml-2 h-10 min-w-10 w-10 rounded-full border-2  border-gray-100" />
                                            <p className=" text-sm text-black w-full p-2">{task?.reporter?.firstname + " " + task?.reporter?.lastname}</p>
                                        </div>
                                        <div className="relative flex items-center  text-blue-700">
                                            Assignee:
                                            {isEditTask ?
                                                <>
                                                    <img src={task?.assignee.avatar_url} alt="" className="ml-2 h-10 w-10 rounded-full border-2  border-gray-100" />
                                                    <p className=" text-sm text-black w-full p-2">{task?.assignee?.firstname + " " + task?.assignee?.lastname}</p>
                                                </> :
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
                                                                        <img src={filteredUser.user.avatar_url} alt="" className="h-10 w-10 rounded-full border-2  border-gray-100 mr-2" />
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
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"><CalendarDays className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> Dates: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2  text-green-700">
                                            Create: <span className="text-md ml-2 text-xs text-black">{formatTime(task?.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center  text-blue-700">
                                            Updated: <span className="text-md ml-2 text-xs text-black">{formatTime(task?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label htmlFor="title" className=" text-black flex items-center font-semibold mb-1"><ChartCandlestick className='h-11 w-11  p-3 rounded-sm mr-2 text-blue-600 shadow-md bg-blue-50' /> Progress: </label>
                                    <div className="ml-2 py-2">
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-md w-[110px]  text-green-700">Start Date: </span>  <input type="datetime-local" className="ml-2 text-sm text-black  w-full border border-gray-300 rounded-md p-2" name="startDate" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={formatDateTimeForInput(task?.startDate || '')} />
                                        </div>
                                        <div className="flex items-center mb-2 text-blue-700">
                                            <span className="text-md w-[110px] text-red-700">End Date: </span>     <input type="datetime-local" className="ml-2 text-sm text-red-600 font-semibold w-full border border-gray-300 rounded-md p-2" name="endDate" onChange={handleChange} disabled={isEditTask} placeholder="" defaultValue={formatDateTimeForInput(task?.endDate || '')} />
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
