'use client'; // This needs to be a client component to use state and effects

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeClaim, useSubmitSolution, useTransactionStatus, useAvailableSkills, useSkillProblemStatement, useClaimIdFromTransaction } from '@/hooks/useSkillVerification';

const AttestPage = () => {
  const { isConnected } = useAccount();
  const { stakeClaim, hash: stakeHash, error: stakeError, isPending: isStakePending } = useStakeClaim();
  const { submitSolution, hash: solutionHash, error: solutionError, isPending: isSolutionPending } = useSubmitSolution();
  const { isLoading: isStakeConfirming, isSuccess: isStakeSuccess } = useTransactionStatus(stakeHash);
  const { isLoading: isSolutionConfirming, isSuccess: isSolutionSuccess } = useTransactionStatus(solutionHash);
  const extractedClaimId = useClaimIdFromTransaction(stakeHash);
  
  const { data: availableSkills, isLoading: skillsLoading } = useAvailableSkills();
  const [selectedSkill, setSelectedSkill] = useState('');
  const { data: problemStatement } = useSkillProblemStatement(selectedSkill);
  
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds
  const [timeUp, setTimeUp] = useState(false);
  const [solution, setSolution] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'solve' | 'submit'>('select');
  const [currentClaimId, setCurrentClaimId] = useState<number | null>(null);

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

  // Handle successful stake transaction and claim ID extraction
  useEffect(() => {
    if (isStakeSuccess && extractedClaimId) {
      console.log('Stake successful, moving to solve step with claim ID:', extractedClaimId);
      setCurrentClaimId(extractedClaimId);
      setCurrentStep('solve');
    }
  }, [isStakeSuccess, extractedClaimId]);

  // Handle successful solution submission
  useEffect(() => {
    if (isSolutionSuccess) {
      console.log('Solution submitted successfully');
      setCurrentStep('submit');
    }
  }, [isSolutionSuccess]);

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
      // Don't set step here - wait for transaction success and claim ID extraction
    } catch (err) {
      console.error('Error staking claim:', err);
    }
  };

  const handleSubmitSolution = async () => {
    if (!solution.trim()) {
      alert('Please provide a solution URL');
      return;
    }

    if (!currentClaimId) {
      alert('No claim ID available. Please try staking the claim again.');
      return;
    }

    try {
      console.log('Submitting solution for claim ID:', currentClaimId);
      await submitSolution(currentClaimId, solution);
      // Don't set step here - wait for transaction success
    } catch (err) {
      console.error('Error submitting solution:', err);
    }
  };

      if (!isConnected) {
        return (
          <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Connect Your Wallet</h1>
              <p className="text-xl text-gray-600 font-light mb-8">
                Please connect your wallet to claim skill attestations.
              </p>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Claim Skill Attestation</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
          {/* Step 1: Select Skill */}
          {currentStep === 'select' && (
            <>
              <h2 className="text-3xl font-light text-gray-800 mb-6">Select Skill to Claim</h2>
              
              {skillsLoading ? (
                <p className="text-gray-600">Loading available skills...</p>
              ) : (
                <div className="space-y-6">
                  <label htmlFor="skill-select" className="block text-lg font-normal text-gray-700">
                    Choose a skill to claim:
                  </label>
                  <select
                    id="skill-select"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-lg"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  
                  {selectedSkill && problemStatement && (
                    <div className="mt-4 p-5 bg-purple-50 rounded-xl">
                      <h3 className="font-semibold text-purple-800">Problem Statement:</h3>
                      <p className="text-purple-700 mt-2">{problemStatement}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-8">
                    <button 
                      onClick={handleStakeClaim}
                      className={`text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${
                        !selectedSkill || isStakePending || isStakeConfirming
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
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
                <h2 className="text-3xl font-light text-gray-800">Solve the Problem</h2>
                <div className="text-3xl font-bold text-purple-500">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-normal text-gray-800 mb-2">Skill: {selectedSkill}</h3>
                {currentClaimId && (
                  <p className="text-sm text-purple-600 mb-2">Claim ID: {currentClaimId}</p>
                )}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <p className="text-gray-700">{problemStatement}</p>
                </div>
              </div>

              <div>
                <label htmlFor="github-url" className="block text-lg font-normal text-gray-700">
                  Solution (GitHub URL)
                </label>
                <input
                  type="text"
                  id="github-url"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-lg"
                  placeholder="https://github.com/your-username/your-repo"
                />
              </div>

              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleSubmitSolution}
                  className={`text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${
                    timeUp || isSolutionPending || isSolutionConfirming
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
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
            <div className="text-center py-10">
              <h2 className="text-3xl font-light text-green-600 mb-4">Solution Submitted!</h2>
              <p className="text-lg text-gray-600 font-light mb-8">
                Your solution has been submitted. Now wait for the challenge period to end or for someone to challenge your claim.
              </p>
              <button 
                onClick={() => {
                  setCurrentStep('select');
                  setCurrentClaimId(null);
                  setSelectedSkill('');
                  setSolution('');
                  setTimeLeft(2 * 60 * 60);
                  setTimeUp(false);
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Claim Another Skill
              </button>
            </div>
          )}

          {/* Error Messages */}
          {(stakeError || solutionError) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-xl">
              Error: {(stakeError || solutionError)?.message}
            </div>
          )}

          {/* Success Messages */}
          {isStakeSuccess && (
            <div className="mt-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-xl">
              Claim staked successfully! Transaction hash: {stakeHash}
            </div>
          )}

          {isSolutionSuccess && (
            <div className="mt-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-xl">
              Solution submitted successfully! Transaction hash: {solutionHash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttestPage;