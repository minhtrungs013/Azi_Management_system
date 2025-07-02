// app/components/Counter.tsx
'use client';
import { logout } from '@/lib/store/features/counterSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { notification } from '@/types/notification';
import { Bell, LogIn, Moon, Power, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../Modal/Modal';
import NotificationListener from '../Notification/NotificationListener';
import SignInForm from '../signIn/SignInForm';
import SignUpForm from '../signUp/SignUpForm';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Profile from '../user/profile';
import { refreshNotification } from '@/lib/store/features/notificationSlice';
import { hideAnswer } from '@/lib/store/features/socialSlice';
import { AvatarUser } from '../common/AvatarUser';
import AnswerCall from '../media/answerCall';
import { useRouter } from 'next/navigation';

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState, AppDispatch } from '../lib/store/store';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [showModalByStatus, setShowModalByStatus] = useState<string>('');
  const authState = useSelector((state: RootState) => state.auth);
  const socialState = useSelector((state: RootState) => state.social);
  // const notifications = notificationState.notification || [];
  const refreshNotificationSlice = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // 👈 thêm hook router
  const toggleForm = () => {
    if (showModalByStatus === "signIn") {
      setShowModalByStatus("signUp")
    }
    if (showModalByStatus === "signUp") {
      setShowModalByStatus("signIn")
    }
  };
  const openModal = (status: string) => {
    if (status === 'profile') {
      setShowModalByStatus("profile")
    }
    if (status === 'answerCall') {
      setShowModalByStatus("answerCall")
    }
    if (status === 'signUp') {
      setShowModalByStatus("signUp")
    }
    if (status === 'signIn') {
      setShowModalByStatus("signIn")
    }
    dispatch(refreshNotification(false));
    setModalOpen(true);
  }

  const closeModal = () => {
    setModalOpen(false);
    dispatch(refreshNotification(false));
    dispatch(hideAnswer());
  }

  useEffect(() => {
    if (!isModalOpen) {
    }
  }, [isModalOpen])

  const { setTheme } = useTheme()

  const logOut = () => {
    dispatch(logout());
    router.push('/');
    toast.success("Logout successful!", {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // dispatch(refreshNotification(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (socialState.isAnwer) {
      openModal('answerCall')
    }
  }, [socialState.isAnwer]);



  const handleCloseNotification = () => {
    setIsOpen(false); // Đặt trạng thái isOpen về false để đóng thông báo
  };
  const handleCheckNotification = (notifications: notification[]) => {
    // Kiểm tra nếu có ít nhất một thông báo mà userId chưa đọc
    const hasUnreadForUser = notifications.some(notification =>
      notification.notificationRecipients.some(nr =>
        nr.isRead === false && nr.userId === authState.userId
      )
    );

    return hasUnreadForUser;
  };

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
                  {/* <Link href="/members" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Members
                  </Link>
                  <Link href="/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                    Settings
                  </Link> */}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center mr-5 ">
              <div className="relative mr-3" ref={dropdownRef}>
                <div
                  className="relative cursor-pointer p-[3px] rounded-md hover:text-orange-500"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <Bell className="w-6 h-6 font-light" />
                  {refreshNotificationSlice.refresh && (
                    <div className="absolute top-0 right-0">
                      {/* Dấu chấm đỏ thông báo */}
                      <div className="bg-red-500 rounded-full w-2 h-2 animate-ping"></div>
                    </div>
                  )}
                </div>

                {isOpen && <NotificationListener closeNotifitation={handleCloseNotification} />}
              </div>
              <DropdownMenu >
                <DropdownMenuTrigger asChild className='w-8 h-8 mr-3 border-none hover:bg-white hover:text-orange-500'>
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
                <button onClick={() => openModal('signIn')} className="px-4 py-2 bg-purple-600 text-white shadow-md border rounded-md flex mr-2 items-center text-sm font-medium"><LogIn className='h-5 w-5 mr-2' />Sign in</button>
                :
                <div className="flex items-center">
                  <button onClick={logOut} className=" p-[5px]  flex items-center text-sm font-medium hover:text-red-500"><Power className='h-5 w-5 ' /></button>
                  <button className="flex items-center w-full text-sm font-medium p-2  mr-3 hover:text-red-500" onClick={() => openModal('profile')}>
                    {authState.firstname && authState.lastname ? authState.firstname + " " + authState.lastname : authState.username}
                    {authState.avatar_url && authState.firstname && authState.lastname && <AvatarUser url={authState.avatar_url} name={authState.firstname + " " + authState.lastname} className='ml-2' />
                    }
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </nav >
      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} >
        {showModalByStatus === "profile" && <Profile closeModal={closeModal} />}
        {showModalByStatus === "signIn" && <SignInForm closeModal={closeModal} toggleForm={toggleForm} />}
        {showModalByStatus === "signUp" && <SignUpForm toggleForm={toggleForm} />}
        {showModalByStatus === "answerCall" && <AnswerCall closeModal={closeModal} />}
      </Modal >
    </div >
  );
}
