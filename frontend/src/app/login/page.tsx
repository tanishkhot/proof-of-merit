export default function LoginPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
            Welcome Back
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Connect your wallet to sign in.
          </p>
        </div>
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
