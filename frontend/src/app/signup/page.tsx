export default function LoginPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
            Welcome Back
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Sign in to continue to your account.
          </p>
        </div>
        <div className="w-full max-w-md">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-black/[.05]">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="walletAddress">
                Wallet Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                id="walletAddress"
                type="text"
                placeholder="Wallet Address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-ray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="githubUsername">
                GitHub Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                id="githubUsername"
                type="text"
                placeholder="GitHub Username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="ensName">
                ENS Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                id="ensName"
                type="text"
                placeholder="ENS Name"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
