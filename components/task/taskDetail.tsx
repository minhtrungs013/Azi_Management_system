"use client"
import { AppDispatch } from "@/lib/store/store";
import { members } from "@/types/auth";
import { Cards, issueTypes } from "@/types/project";
import { CaseSensitive, FileCheck2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";

const TaskDetail = ({ closeModal, task }: { closeModal: () => void, task: Cards | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [selectedRole, setSelectedRole] = useState(issueTypes[0].value);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filteredUsers, setFilteredUsers] = useState<members[]>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');


    console.log(task);

    return (
        <div className="min-w-[900px]  flex flex-col justify-center sm:py-12">
            <div className="py-3 ">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[900px] min-h-[600px] mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center ">{task?.title}</h1>
                        <div className="grid grid-cols-3 gap-4 my-5 ">
                            <div className=" col-start-1 col-span-2">
                                <div>
                                    <label htmlFor="title" className=" text-gray-700 flex items-center font-semibold mb-1"> Detail: </label>
                                    <div>
                                        <div className="flex items-center">
                                            <FileCheck2 className="h-6 w-6 mr-3 text-green-400" />
                                            Status: {task?.issueType}
                                        </div>
                                        <div className="flex items-center">
                                            <CaseSensitive className="h-6 w-6 mr-3 text-blue-600" />
                                            Priority: {task?.priority}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="title" className=" text-gray-700 flex items-center font-semibold mb-1"> Description: </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        defaultValue={task?.description}
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                        placeholder="Enter project description"
                                        // rows="4"
                                        required
                                    ></textarea>
                                </div>

                            </div>
                            <div className="col-start-3 col-span-3 ">1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;
