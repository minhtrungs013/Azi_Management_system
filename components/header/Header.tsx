// app/components/Counter.tsx
'use client';
import { logout } from '@/lib/store/features/counterSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { CircleUserRound, LogIn, Moon, Power, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../Modal/Modal';
import SignInForm from '../signIn/SignInForm';
import SignUpForm from '../signUp/SignUpForm';
import { toast, ToastContainer } from 'react-toastify';
import Profile from '../user/profile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../lib/store/store';

export function Header() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const authState = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const toggleForm = () => setShowSignUp(!showSignUp);
  const openModal = (status: string) => {
    if (status === 'profile') {
      setShowProfile(true)
    }
    setModalOpen(true);
  }

  const closeModal = () => {
    setShowProfile(false)
    setModalOpen(false);
  }


  useEffect(() => {
    if (!isModalOpen) {
      setShowSignUp(false)
    }
  }, [isModalOpen])

  const { setTheme } = useTheme()

  const logOut = () => {
    dispatch(logout());
    toast.success("Logout successful!", {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
  // const [openUser, setOpenItemId] = useState<number | null>(null);
  // const toggleOption = (id: number) => {
  //   setOpenItemId(openItemId === id ? null : id);
  // };

  return (
    <div>
      <ToastContainer />
      <nav className="bg-white dark:bg-[#020817] shadow-md">
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
            <div className="hidden md:flex items-center mr-5 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {!authState.isLogged ?
                <button onClick={() => openModal('sign')} className="px-4 py-2 bg-purple-600 text-white shadow-md border rounded-md flex mr-2 items-center text-sm font-medium"><LogIn className='h-5 w-5 mr-2' />Sign in</button>
                :
                <div className="flex items-center">
                  <button className="flex items-center w-full text-sm font-medium p-2  mr-3 hover:text-red-500" onClick={() => openModal('profile')}>
                    {authState.avatar_url ?
                      <img src={authState.avatar_url} alt="Avatar 2" className="h-10 w-10 rounded-full  border-gray-100 mr-2" />
                      : <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_s87zYsrB1nvFfUvNPUJm6KlFP5wIYz0Nxg&s" alt="Avatar 2" className="h-10 w-10 rounded-full border-2 border-gray-100 mr-2" />
                    }
                    {authState.name ? authState.name : authState.username}
                  </button>
                  <button onClick={logOut} className="px-4 py-3 bg-gray-50  shadow-md border-gray-50  rounded-md flex items-center text-sm font-medium hover:text-red-500"><Power className='h-5 w-5 mr-2 ' />Logout</button>
                </div>
              }
            </div>
          </div>
        </div>
      </nav >
      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        {showProfile && <Profile closeModal={closeModal} />}
        {!showProfile && !showSignUp && <SignInForm closeModal={closeModal} toggleForm={toggleForm} />}
        {!showProfile && showSignUp && <SignUpForm toggleForm={toggleForm} />}
      </Modal>
    </div >
  );
}
