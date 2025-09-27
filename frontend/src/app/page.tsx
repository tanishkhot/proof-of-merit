import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      <main className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Welcome to Crucible
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
          A decentralized platform for developers to prove their skills and for recruiters to find top talent with verified credentials.
        </p>
        <div className="flex justify-center items-center space-x-8">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">I am a...</p>
            <div className="flex space-x-4">
                <Link href="/recruit">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                        Recruiter
                    </button>
                </Link>
                <Link href="/challenges">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                        Developer
                    </button>
                </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}