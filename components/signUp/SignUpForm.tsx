// components/LoginForm.tsx
"use client"
import { AppDispatch } from '@/lib/store/store'; // Import the AppDispatch type
import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const SignUpForm = ({ toggleForm }: { toggleForm: () => void }) => {
  const [account, setAccount] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };
  console.log(account);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!account.username || !account.password) {
      setError('Both fields are required!');
      return;
    }

    if (account.password !== account.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://192.168.188.71:5555/auth/register', {
        username: account.username,
        password: account.password,
        confirmPassword: account.confirmPassword,
      });
      toggleForm();
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-w-[500px] flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-gray-700 text-center mb-8">Register </h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="relative mb-5">
                <input
                  type="username"
                  name='username'
                  placeholder="User name"
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>
              <div className="relative mb-5">
                <input
                  type="password"
                  name='password'
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>
              <div className="relative mb-5">
                <input
                  type="password"
                  name='confirmPassword'
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
              >
                Register
              </button>
            </form>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <span onClick={toggleForm} className="text-purple-500 hover:underline cursor-pointer">
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
