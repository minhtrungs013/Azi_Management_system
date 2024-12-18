"use client"
import { inviteMemberToProject } from "@/lib/store/features/projectSlice";
import { setRefresh } from "@/lib/store/features/taskSlice";
import { AppDispatch } from "@/lib/store/store";
import { User } from "@/types/auth";
import { AddUserPermissionforProject, permission } from "@/types/project";
import { ShieldCheck, UserPlus, UserSearch } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const InviteProject = ({ closeModal, projectId, permissions, allUser }: { closeModal: () => void, projectId: string | undefined, permissions: permission[] | undefined, allUser: User[] | undefined }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isShowSearchUser, sethowSearchUser] = useState<boolean>(false);
    const [value, setValue] = useState<string>('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>();
    const [addUserPermission, setAddUserPermission] = useState<AddUserPermissionforProject>();

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.id;
        const isChecked = e.target.checked;
        const index = addUserPermission?.permissionIds.findIndex((item) => item === value);

        if (index === -1 && isChecked) {
            setAddUserPermission((prev) => ({
                userId: prev?.userId || '',
                permissionIds: [...(prev?.permissionIds || []), value],
            }));
        } else if (index !== -1 && !isChecked) {
            setAddUserPermission((prev) => ({
                userId: prev?.userId || '',
                permissionIds: prev?.permissionIds.filter((item) => item !== value) || [],
            }));
        }
    };


    const handleSubmitUser = (value: User) => {
        setAddUserPermission((prev) => ({
            userId: value._id || '',
            permissionIds: prev?.permissionIds || [],
        }));
        setValue(value.name || '')
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
        const filteredUsers = allUser?.filter((user) =>
            user?.name && user?.name.toLowerCase().includes(lowerCaseValue) ||
            user?.email && user?.email.toLowerCase().includes(lowerCaseValue)
        );
        setFilteredUsers(filteredUsers)
    };

    const handleCreateTask = async () => {
        if (addUserPermission && projectId) {
            const result = await dispatch(inviteMemberToProject({ url: projectId, payload: addUserPermission }));
            if (inviteMemberToProject.fulfilled.match(result)) {
                toast.success("Add member to project successfully!", {
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
                        <h1 className="text-2xl font-semibold text-gray-700 mb-8 flex items-center "> <UserPlus className="h-10 w-10 mr-3 text-amber-600" /> Add people to project</h1>
                        <form action="">
                            <div className="mb-4 relative" >
                                <label htmlFor="title" className=" text-gray-700 mb-2  flex items-center"> <UserSearch className="h-5 w-5 mr-2" />Names or Emails </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={value}
                                    onChange={handleSeachUser}
                                    className="border border-gray-300 rounded-md p-4 w-full text-sm"
                                    placeholder="eg.., Maria, Maria@gmail.com "
                                    required
                                />
                                {isShowSearchUser && filteredUsers && filteredUsers?.length > 0 &&
                                    <ul className="absolute w-full bg-white border rounded-md mt-1 shadow-lg z-10 overflow-y-auto max-h-60">
                                        {filteredUsers?.map((filteredUser) => (
                                            <li
                                                key={filteredUser._id}
                                                onClick={() => handleSubmitUser(filteredUser)}
                                                className={`p-2 hover:bg-blue-100 cursor-pointer`}
                                            >
                                                <div className="flex">
                                                    <img src={filteredUser.avatar_url} alt="" className="h-10 w-10 rounded-full border-2  border-gray-100 mr-2" />
                                                    <div>
                                                        <div className={` text-base text-gray-900 `}>{filteredUser.name}</div>
                                                        <p className="text-xs text-gray-600">{filteredUser.email}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>
                            <div className="relative mb-5">
                                <label className=" text-gray-700 mb-2 flex items-center"> <ShieldCheck className="h-5 w-5 mr-2" />Permission</label>
                                {permissions?.map((permission) => (
                                    <>
                                        {permission.name !== "project_admin" &&
                                            <div className="flex items-center mb-1 ml-[2px]" key={permission._id}>
                                                <input
                                                    id={permission._id}
                                                    name={permission.name}
                                                    onChange={handleSelect}
                                                    type="checkbox"
                                                    className="h-4 w-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor={permission._id} className="ml-2 text-sm  text-gray-900 cursor-pointer">
                                                    {permission.label}
                                                </label>
                                            </div>
                                        }
                                    </>
                                ))}
                            </div>
                            <p className="text-xs mb-5 text-gray-600 ">This site is protected by reCAPTCHA and the Google Privacy Policy﻿, (opens new window) and Terms of Service﻿, (opens new window) apply.Add</p>
                        </form>

                        <div className='flex justify-end'>
                            <button onClick={closeModal} type="button" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                Cancel
                            </button>
                            <button onClick={handleCreateTask} className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteProject;
