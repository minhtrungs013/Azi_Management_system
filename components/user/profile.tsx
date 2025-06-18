"use client"
import { refreshUser, updateUser } from '@/lib/store/features/counterSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { handleUploadCloudinary } from '@/lib/utils';
import { UserUpdate } from '@/types/auth';
import { Plus, Save, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '../ui/button';

const Profile = ({ closeModal }: { closeModal: () => void }) => {

    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.auth);

    const [user, setUser] = useState<UserUpdate>({
        lastname: authState.lastname || '',
        firstname: authState.firstname || '',
        email: authState.email || '',
        location: authState.location || '',
        avatar_url: authState.avatar_url || '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevUser) => {
            return {
                ...prevUser,
                [name]: value || '',
            };
        });
    };
    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target?.files
        if (files) {
            const images = await handleUploadCloudinary(files)
            if (images && images?.length > 0) {
                user.avatar_url = images[0]
                handleSubmit()
            }
        }

    };

    const handleSubmit = async () => {
        if (user && authState.userId) {
            try {
                const resultAction = await dispatch(updateUser({ url: authState.userId, payload: user }));
                if (updateUser.fulfilled.match(resultAction)) {
                    toast.success("Update Frofile successful!", {
                        position: "bottom-right",
                        autoClose: 5000,
                    });
                    dispatch(refreshUser(user));
                    // closeModal();
                } else {
                    toast.error('something went wrong please try again', {
                        position: "bottom-right",
                        autoClose: 5000,
                    });
                }
            } catch (error) {
                toast.error('something went wrong please try again', {
                    position: "bottom-right",
                    autoClose: 5000,
                });
            }
        }
    };

    return (
        <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
            <div className="relative py-3">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl">
                    <div className=" mx-auto">
                        <div className='flex'>
                            <h1 className="text-2xl font-semibold text-gray-700 text-center mb-8">Frofile Setting</h1>
                        </div>
                        <div >
                            <div className='flex items-center'>
                                <div className='relative w-52'>
                                    <div className='flex items-center justify-center'>
                                        <img className=' h-36 w-36 rounded-[100%]' src={`${user.avatar_url == '' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s87zYsrB1nvFfUvNPUJm6KlFP5wIYz0Nxg&s" : user.avatar_url}`} alt="" />
                                    </div>
                                    <div className='flex items-center justify-center'>
                                        <p className=' font-semibold'>{authState.firstname + " " + authState.lastname}</p>
                                    </div>
                                    <div className='absolute rounded-full bottom-[26px] right-[40px] cursor-pointer '>
                                        <Upload className='cursor-pointer text-4xl text-gray-500 hover:text-gray-300 z-10' />
                                        <input type="file" className='cursor-pointer absolute z-20 bottom-0 left-0 opacity-0 h-10 w-10' onChange={handleImage} />
                                    </div>
                                </div>
                                <div >
                                    <div className='flex items-center'>
                                        <div className="relative mb-5 mr-2 min-w-[250px]">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                name='username'
                                                value={authState.username || ''}
                                                disabled
                                                placeholder="User name"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                        <div className="relative mb-5 min-w-[250px]">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                name='email'
                                                defaultValue={user.email}
                                                placeholder="Email"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className='flex items-center'>
                                        <div className="relative mb-5 mr-2 min-w-[250px]">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                name='lastname'
                                                defaultValue={user.lastname}
                                                placeholder="Last Name"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                        <div className="relative mb-5 min-w-[250px]">
                                            <label className="block text-sm font-medium text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name='firstname'
                                                defaultValue={user.firstname}
                                                placeholder="First Name"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div className="relative mb-5 mr-2 min-w-[250px]">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Address
                                            </label>
                                            <input
                                                type="Text"
                                                name='location'
                                                defaultValue={user.location}
                                                placeholder="Address"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                        <div className="relative mb-5 ">
                                            <div className='flex items-center  mt-5'>
                                                <Button onClick={closeModal} variant="outline" size="sm" className="min-w-24 mr-2 hover:text-white bg-red-50 hover:bg-red-500 text-red-500 border-red-500"><X className='h-5 w-5 ' /> Cancel</Button>
                                                <Button onClick={() => handleSubmit()} variant="outline" size="sm" className="min-w-24 mr-2 text-white hover:bg-purple-50 bg-purple-500 hover:text-purple-500 border-purple-500"><Save className='h-5 w-5 ' /> Update</Button>
                                            </div>
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

export default Profile;
