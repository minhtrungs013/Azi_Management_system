'use client';
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Index() {
  const [hasUser, setHasUser] = useState(true);

  useEffect(() => {
    // const userId = localStorage.getItem('');
    // setHasUser(!!userId); // nếu có userId thì set true
  }, []);
  return (
    <div>
      <div className="flex items-center justify-center pt-10">
        <p className="text-8xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-green-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
          Welcome to Azi system
        </p>
      </div>
      <div className="flex items-center justify-center pt-8">
        <div className="bg-white px-6 py-4 rounded-xl shadow-md border border-gray-200">
          <p className="flex items-center text-lg text-gray-800">
            {hasUser ? (
              <>
                Start your project:&nbsp;
                <Link
                  href="/projects"
                  className=" text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1.5 rounded-md shadow hover:brightness-110 transition-all duration-300"
                >
                  Go to page →
                </Link>
              </>
            ) : (
              <>
                You already have an account:&nbsp;
                <Link
                  href="/login"
                  className="flex items-center text-white bg-gradient-to-r from-purple-400 to-purple-600 px-4 py-1.5 rounded-md shadow hover:brightness-110 transition-all duration-300"
                >
                  <LogIn className='h-5 w-5 mr-2 ' /> Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
