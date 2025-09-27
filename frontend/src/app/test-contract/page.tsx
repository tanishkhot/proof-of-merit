'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { SKILL_VERIFICATION_ADDRESS, SKILL_VERIFICATION_ABI } from '@/lib/contracts';
import { useReadContract } from 'wagmi';

export default function TestContractPage() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const [contractInfo, setContractInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test reading contract data
  const { data: availableSkills, isLoading: skillsLoading, error: skillsError } = useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getAllSkills',
  });

  const { data: owner, isLoading: ownerLoading, error: ownerError } = useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'owner',
  });

  const { data: stakeAmount, isLoading: stakeLoading, error: stakeError } = useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getPredefinedStakeAmount',
  });

  useEffect(() => {
    const testContractConnection = async () => {
      if (!publicClient) {
        setError('No public client available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Test basic contract interaction
        const code = await publicClient.getCode({
          address: SKILL_VERIFICATION_ADDRESS as `0x${string}`
        });

        setContractInfo({
          address: SKILL_VERIFICATION_ADDRESS,
          hasCode: code !== '0x',
          codeLength: code.length,
          chainId: publicClient.chain?.id,
          chainName: publicClient.chain?.name,
        });

      } catch (err) {
        console.error('Error testing contract connection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testContractConnection();
  }, [publicClient]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Contract Connection Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Connection Status
          </h2>
          <div className="space-y-2">
            <p><strong>Wallet Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Address:</strong> {address || 'Not connected'}</p>
            <p><strong>Public Client:</strong> {publicClient ? '✅ Available' : '❌ Not available'}</p>
            <p><strong>Chain ID:</strong> {publicClient?.chain?.id || 'Unknown'}</p>
            <p><strong>Chain Name:</strong> {publicClient?.chain?.name || 'Unknown'}</p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Contract Information
          </h2>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading contract info...</p>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400">
              <p><strong>Error:</strong> {error}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Contract Address:</strong> {contractInfo.address}</p>
              <p><strong>Has Code:</strong> {contractInfo.hasCode ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Code Length:</strong> {contractInfo.codeLength} characters</p>
              <p><strong>Chain ID:</strong> {contractInfo.chainId}</p>
              <p><strong>Chain Name:</strong> {contractInfo.chainName}</p>
            </div>
          )}
        </div>

        {/* Contract Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Contract Data
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Available Skills:</h3>
              {skillsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              ) : skillsError ? (
                <p className="text-red-600 dark:text-red-400">Error: {skillsError.message}</p>
              ) : (
                <div>
                  {availableSkills && availableSkills.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {availableSkills.map((skill: string, index: number) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">{skill}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No skills available</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Contract Owner:</h3>
              {ownerLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              ) : ownerError ? (
                <p className="text-red-600 dark:text-red-400">Error: {ownerError.message}</p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{owner || 'Unknown'}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Stake Amount:</h3>
              {stakeLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              ) : stakeError ? (
                <p className="text-red-600 dark:text-red-400">Error: {stakeError.message}</p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  {stakeAmount ? `${Number(stakeAmount) / 1e18} ETH` : 'Unknown'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event Fetching Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Event Fetching Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Check the browser console for event fetching logs from the useContractEvents hook.
          </p>
        </div>
      </div>
    </div>
  );
}