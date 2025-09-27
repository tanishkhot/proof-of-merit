'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useStakeClaim, useTransactionStatus } from '@/hooks/useSkillVerification';
import { useAvailableSkills } from '@/hooks/useSkillVerification';

export function AddTestClaim() {
  const { isConnected } = useAccount();
  const { data: availableSkills } = useAvailableSkills();
  const { stakeClaim, hash, error, isPending } = useStakeClaim();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);
  
  const [selectedSkill, setSelectedSkill] = useState('');

  const handleStakeClaim = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!selectedSkill) {
      alert('Please select a skill');
      return;
    }

    try {
      await stakeClaim(selectedSkill);
    } catch (err) {
      console.error('Error staking claim:', err);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Add Test Claim</h3>
      <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
        This is a development tool to quickly add test claims for demonstration purposes.
      </p>
      
      <div className="flex items-center space-x-4">
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select a skill...</option>
          {availableSkills?.map((skill: string) => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
        
        <button
          onClick={handleStakeClaim}
          disabled={!selectedSkill || isPending || isConfirming}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Add Test Claim (0.01 ETH)'}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-red-600 text-sm">
          Error: {error.message}
        </div>
      )}

      {isSuccess && (
        <div className="mt-3 text-green-600 text-sm">
          Test claim added successfully! Transaction hash: {hash}
        </div>
      )}
    </div>
  );
}