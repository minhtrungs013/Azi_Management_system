"use client"
import { refreshUser, updateUser } from '@/lib/store/features/counterSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { handleUploadCloudinary } from '@/lib/utils';
import { UserUpdate } from '@/types/auth';
import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = ({ closeModal }: { closeModal: () => void }) => {

    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.auth);

    const [user, setUser] = useState<UserUpdate>({
        name: authState.name || '',
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
        console.log(files);
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
                        <form onSubmit={handleSubmit}>
                            <div className='flex items-center'>
                                <div className='relative w-52'>
                                    <div className='flex items-center justify-center'>
                                        <img className=' h-36 w-36 rounded-[100%]' src={`${user.avatar_url == '' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s87zYsrB1nvFfUvNPUJm6KlFP5wIYz0Nxg&s" : user.avatar_url}`} alt="" />
                                    </div>
                                    <div className='flex items-center justify-center'>
                                        <p className=' font-semibold'>{authState.name}</p>
                                    </div>
                                    <div className='absolute rounded-full bottom-[26px] right-[40px] cursor-pointer '>
                                        <Upload className='cursor-pointer text-4xl text-gray-500 hover:text-gray-300 z-10' />
                                        <input type="file" className='cursor-pointer absolute z-20 bottom-0 left-0 opacity-0 h-10 w-10' onChange={handleImage} />
                                    </div>
                                </div>
                                <div >
                                    <div className='flex items-center'>
                                        <div className="relative mb-5 mr-2">
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
                                        <div className="relative mb-5">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name='name'
                                                defaultValue={user.name}
                                                placeholder=" Full Name"
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className='flex items-center'>
                                        <div className="relative mb-5 mr-2">
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
                                        <div className="relative mb-5 ">
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

                                    </div>

                                </div>
                            </div>
                            <div className='flex items-center justify-end '>
                                <button onClick={closeModal} type="button" className="mr-2 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-md shadow-md hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
                                    Cancel
                                </button>
                                <button type='submit' className=" px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
                                    Update
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
