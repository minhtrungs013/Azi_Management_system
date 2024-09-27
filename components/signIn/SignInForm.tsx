"use client"
import { login } from '@/lib/store/features/counterSlice';
import { setRefresh } from '@/lib/store/features/projectSlice';
import store, { AppDispatch } from '@/lib/store/store';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface SignInFormProps {
  toggleForm: () => void;
  closeModal: () => void;
}
const SignInForm = ({ toggleForm, closeModal }: SignInFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Both fields are required!');
      return;
    }
    const loginPayload = { username, password };
    try {
      const resultAction = await dispatch(login(loginPayload));
      if (login.fulfilled.match(resultAction)) {
        toast.success("Login successful!", {
          position: "bottom-right",
          autoClose: 5000,
        });
        setError('');
        // setTimeout(() => {
          dispatch(setRefresh(true));
        // }, 500);
        closeModal();
      } else {
        toast.error("wrong username or password please try again", {
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

  };

  return (
    <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-gray-700 text-center mb-8">Welcome Back</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="relative mb-5">
                <input
                  type="username"
                  placeholder="User name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>
              <div className="relative mb-5">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
              >
                Sign In
              </button>
            </form>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span onClick={toggleForm} className="text-purple-500 hover:underline cursor-pointer">
                  Sign up here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
