// app/components/Counter.tsx
'use client';
import { logout } from '@/lib/store/features/counterSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { LogIn, Power } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../Modal/Modal';
import SignInForm from '../signIn/SignInForm';
import SignUpForm from '../signUp/SignUpForm';
import { toast, ToastContainer } from 'react-toastify';

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../lib/store/store';

export function Header() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const toggleForm = () => setShowSignUp(!showSignUp);
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);


  useEffect(() => {
    if (!isModalOpen) {
      setShowSignUp(false)
    }
  }, [isModalOpen])


  const logOut = () => {
    dispatch(logout());
    toast.success("Logout successful!", {
      position: "bottom-right",
      autoClose: 5000,
    });
  }

  return (
    <div>
      <ToastContainer />
      <nav className="bg-white shadow-md">
        <div className="">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {/* Left Menu */}
              <div className="">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link href="/home" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </Link>
                  <Link href="/tasks" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Tasks
                  </Link>
                  <Link href="/members" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Members
                  </Link>
                  <Link href="/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Settings
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center mr-5">
              {!authState.isLogged ?
                <button onClick={openModal} className="px-4 py-2 bg-purple-600 text-white shadow-md border rounded-md flex mr-2 items-center text-sm font-medium"><LogIn className='h-5 w-5 mr-2' />Sign in</button>
                :
                <button onClick={logOut} className="px-4 py-2 bg-gray-50  shadow-md border-gray-50  rounded-md flex items-center text-sm font-medium hover:text-red-500"><Power className='h-5 w-5 mr-2 ' />Logout</button>
              }
            </div>
          </div>
        </div>
      </nav >
      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {showSignUp ? (
          <SignUpForm toggleForm={toggleForm} />
        ) : (
          <SignInForm closeModal={closeModal} toggleForm={toggleForm} />
        )}
      </Modal>
    </div >
  );
}
