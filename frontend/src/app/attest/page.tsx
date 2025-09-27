'use client'; // This needs to be a client component to use state and effects

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeClaim, useSubmitSolution, useTransactionStatus, useAvailableSkills, useSkillProblemStatement } from '@/hooks/useSkillVerification';

const AttestPage = () => {
  const { isConnected, address } = useAccount();
  const { stakeClaim, hash: stakeHash, error: stakeError, isPending: isStakePending } = useStakeClaim();
  const { submitSolution, hash: solutionHash, error: solutionError, isPending: isSolutionPending } = useSubmitSolution();
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useTransactionStatus(stakeHash);
  const { isLoading: isSolutionConfirming, isSuccess: isSolutionSuccess } = useTransactionStatus(solutionHash);
  
  const { data: availableSkills, isLoading: skillsLoading } = useAvailableSkills();
  const [selectedSkill, setSelectedSkill] = useState('');
  const { data: problemStatement } = useSkillProblemStatement(selectedSkill);
  
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds
  const [timeUp, setTimeUp] = useState(false);
  const [solution, setSolution] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'solve' | 'submit'>('select');

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeUp(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

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
      setCurrentStep('solve');
    } catch (err) {
      console.error('Error staking claim:', err);
    }
  };

  const handleSubmitSolution = async () => {
    if (!solution.trim()) {
      alert('Please provide a solution URL');
      return;
    }

    try {
      // Note: In a real implementation, you'd need to get the claim ID from the stake transaction
      // For now, we'll use a placeholder
      await submitSolution(1, solution);
      setCurrentStep('submit');
    } catch (err) {
      console.error('Error submitting solution:', err);
    }
  };

      if (!isConnected) {
        return (
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Connect Your Wallet</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Please connect your wallet to claim skill attestations
              </p>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Claim Skill Attestation</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Step 1: Select Skill */}
          {currentStep === 'select' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Select Skill to Claim</h2>
              
              {skillsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading available skills...</p>
              ) : (
                <div className="space-y-4">
                  <label htmlFor="skill-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose a skill to claim:
                  </label>
                  <select
                    id="skill-select"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  
                  {selectedSkill && problemStatement && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">Problem Statement:</h3>
                      <p className="text-blue-700 dark:text-blue-300 mt-2">{problemStatement}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleStakeClaim}
                      className={`text-white font-bold py-2 px-4 rounded ${
                        !selectedSkill || isStakePending || isStakeConfirming
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-700'
                      }`}
                      disabled={!selectedSkill || isStakePending || isStakeConfirming}
                    >
                      {isStakePending ? 'Confirming...' : isStakeConfirming ? 'Processing...' : 'Stake Claim (0.01 ETH)'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Solve Problem */}
          {currentStep === 'solve' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Solve the Problem</h2>
                <div className="text-2xl font-bold text-red-500">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Skill: {selectedSkill}</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{problemStatement}</p>
                </div>
              </div>

              <div>
                <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Solution (GitHub URL)
                </label>
                <input
                  type="text"
                  id="github-url"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://github.com/your-username/your-repo"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  onClick={handleSubmitSolution}
                  className={`text-white font-bold py-2 px-4 rounded ${
                    timeUp || isSolutionPending || isSolutionConfirming
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-700'
                  }`}
                  disabled={timeUp || isSolutionPending || isSolutionConfirming}
                >
                  {isSolutionPending ? 'Confirming...' : isSolutionConfirming ? 'Processing...' : 'Submit Solution'}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {currentStep === 'submit' && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">Solution Submitted!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your solution has been submitted. Now wait for the challenge period to end or for someone to challenge your claim.
              </p>
              <button 
                onClick={() => setCurrentStep('select')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Claim Another Skill
              </button>
            </div>
          )}

          {/* Error Messages */}
          {(stakeError || solutionError) && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {(stakeError || solutionError)?.message}
            </div>
          )}

          {/* Success Messages */}
          {isStakeSuccess && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Claim staked successfully! Transaction hash: {stakeHash}
            </div>
          )}

          {isSolutionSuccess && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Solution submitted successfully! Transaction hash: {solutionHash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttestPage;