"use client"
import { Button } from "@/components/ui/button";
import { createSprintSlice, setRefresh } from "@/lib/store/features/spintSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { sprintPayload } from "@/types/sprint";
import { CaseSensitive, Plus, RefreshCcwDot, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const Sprint = ({ closeModal, projectId }: { closeModal: () => void, projectId: string | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [value, setValue] = useState<string>('');
    const authState = useSelector((state: RootState) => state.auth);
    const [createSprint, setCreateSprint] = useState({
        projectId: "",
        name: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCreateSprint((prevSprint) => {
            return {
                ...prevSprint,
                [name]: value || '',
            };
        });
    };

    const handleCreateSpint = async () => {
        const print: sprintPayload = {
            projectId: projectId || '',
            name: createSprint.name,
            description: createSprint.description,
            startDate: createSprint.startDate,
            endDate: createSprint.endDate,
        }
        try {
            await dispatch(createSprintSlice(print)).unwrap();
            toast.success("Sprint created successfully!", {
                position: "bottom-right",
                autoClose: 5000,
            });
            dispatch(setRefresh(true));
            closeModal();
        } catch (error: any) {
            toast.error("Failed to create sprint: " + (error.message || "Unknown error"), {
                position: "bottom-right",
                autoClose: 5000,
            });
        }
    }

    return (
        <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
            <div className="py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[500px] mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center "><RefreshCcwDot className="h-10 w-10 mr-3 text-green-400" /> Create Sprint</h1>
                        <form action="">
                            <div className="mb-4">
                                <label htmlFor="title" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="EX: Spint 1"
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
                                    <label htmlFor="startDate" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Title</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                        placeholder="Enter project title"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />

                                </div>
                                <div className="mb-4 w-full">
                                    <label htmlFor="endDate" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Title</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        onChange={handleChange}
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                        placeholder="Enter project title"
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                        <div className='flex justify-end'>
                            <Button onClick={closeModal} variant="outline" size="sm" className="min-w-24 mr-2 hover:text-white bg-red-50 hover:bg-red-500 text-red-500 border-red-500"><X className='h-5 w-5 ' /> Cancel</Button>
                            <Button onClick={handleCreateSpint} variant="outline" size="sm" className="min-w-24 mr-2 text-white hover:bg-purple-50 bg-purple-500 hover:text-purple-500 border-purple-500"><Plus className='h-5 w-5 ' /> Create Sprint</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sprint;
