import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-white font-sans">
      <main className="text-center">
        <h1 className="text-6xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          Proof of Merit
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl font-light">
          A decentralized platform for developers to prove their skills and for recruiters to find top talent with verified credentials.
        </p>
        <div className="flex justify-center items-center space-x-8">
          <div className="text-center">
            <p className="text-2xl font-light text-gray-800 mb-6">I am a...</p>
            <div className="flex space-x-4">
                <Link href="/recruit">
                    <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-4 px-12 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                        Recruiter
                    </button>
                </Link>
                <Link href="/challenges">
                    <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-4 px-12 rounded-2xl text-xl shadow-lg transition-all duration-300 transform hover:scale-105">
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