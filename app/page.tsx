import Link from "next/link";


export default function Index() {
  return (
      <div>
      <div className="flex items-center justify-center pt-10">
        <p className="text-8xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-green-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
          Welcome to Azi system
        </p>
      </div>
      <div className="flex items-center justify-center pt-8">
        <div className="bg-white px-6 py-4 rounded-xl shadow-md border border-gray-200">
          <p className="text-lg text-gray-800">
            Start your project:&nbsp;
            <Link
              href="/projects"
              className="inline-block text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1.5 rounded-md shadow hover:brightness-110 transition-all duration-300"
            >
              Go to page →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
