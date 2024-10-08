"use client"
import { postListToProject } from "@/lib/store/features/projectSlice";
import { setRefresh } from "@/lib/store/features/taskSlice";
import { AppDispatch } from "@/lib/store/store";
import { List, PostList, ProjectDetails } from "@/types/project";
import { CaseSensitive, FileCheck2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CreateColumn = ({ closeModal, data }: { closeModal: () => void, data: ProjectDetails | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [createList, setCreateList] = useState<PostList>({
        projectId: data?._id || '',
        name: "",
        position: 0,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateList((prevList) => {
            return {
                ...prevList,
                [name]: value || '',
            };
        });
    };
    const handleCreateTask = async () => {
        createList.name = createList.name.toUpperCase();
            const result = await dispatch(postListToProject(createList));
            if (postListToProject.fulfilled.match(result)) {
                toast.success("Create List successfully!", {
                    position: "bottom-right",
                    autoClose: 5000,
                });
                dispatch(setRefresh(true));
                closeModal();
            }
    }

    return (
        <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
            <div className="py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-5 bg-white shadow-lg sm:rounded-xl sm:p-10">
                    <div className="min-w-[500px] mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center "> <FileCheck2 className="h-10 w-10 mr-3 text-green-400" /> Create Column</h1>
                        <form action="">
                            <div className="mb-4">
                                <label htmlFor="name" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="Enter name..."
                                    required
                                />
                            </div>
                            {/* <div className="mb-4">
                                <label htmlFor="position" className=" text-gray-700 flex items-center"> <CaseSensitive className="h-7 w-7 mr-2 text-blue-600" />Position</label>
                                <input
                                    type="number"
                                    id="position"
                                    name="position"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    placeholder="Enter position "
                                    required
                                />
                            </div> */}
                            {/* <ul>
                                {lists?.map(list => (
                                    <li>
                                        <span>{list.position}</span> {list.name}
                                    </li>
                                ))}
                            </ul> */}
                        </form>
                        <div className='flex justify-end'>
                            <button onClick={closeModal} type="button" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                Cancel
                            </button>
                            <button onClick={handleCreateTask} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                Create Colmun
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateColumn;
