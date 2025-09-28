'use client';

import { useAccount } from 'wagmi';
import { useAvailableSkills, useStakeAmount } from '@/hooks/useSkillVerification';

const TestPage = () => {
  const { isConnected, address } = useAccount();
  const { data: availableSkills, isLoading: skillsLoading, error: skillsError } = useAvailableSkills();
  const { data: stakeAmount, isLoading: stakeLoading, error: stakeError } = useStakeAmount();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Contract Connection Test</h1>
        
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Connection Status</h2>
            <div className="space-y-2">
              <div>Connected: {isConnected ? '✅ Yes' : '❌ No'}</div>
              <div>Address: {address || 'Not connected'}</div>
            </div>
          </div>

          {/* Available Skills Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Available Skills Test</h2>
            {skillsLoading && <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>}
            {skillsError && (
              <div className="text-red-500">
                <p>Error: {skillsError.message}</p>
                <p className="text-sm mt-2">This might indicate:</p>
                <ul className="text-sm list-disc list-inside mt-1">
                  <li>Wrong network (should be Flow Testnet - Chain ID 545)</li>
                  <li>Contract not deployed</li>
                  <li>RPC connection issues</li>
                  <li>ABI mismatch</li>
                </ul>
              </div>
            )}
            {availableSkills && (
              <div>
                <p className="text-green-600">✅ Contract connection successful!</p>
                <p>Available skills: {availableSkills.length}</p>
                {availableSkills.length > 0 && (
                  <div className="mt-2">
                    <p>Skills:</p>
                    <ul className="list-disc list-inside">
                      {availableSkills.map((skill: string, index: number) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stake Amount Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Stake Amount Test</h2>
            {stakeLoading && <p className="text-gray-600 dark:text-gray-400">Loading stake amount...</p>}
            {stakeError && (
              <div className="text-red-500">
                <p>Error: {stakeError.message}</p>
              </div>
            )}
            {stakeAmount && (
              <div>
                <p className="text-green-600">✅ Stake amount read successful!</p>
                <p>Predefined stake amount: {Number(stakeAmount) / 1e18} ETH</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Troubleshooting</h2>
            <div className="text-blue-700 dark:text-blue-300 space-y-2">
              <p>If you see errors above, try these steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Make sure you&apos;re connected to Flow Testnet (Chain ID: 545)</li>
                <li>Get testnet FLOW tokens from a faucet</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Check the browser console for more detailed errors</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;