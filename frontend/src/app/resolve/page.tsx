'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoteOnChallenge, useTransactionStatus } from '@/hooks/useSkillVerification';
import { useContractEvents, useContractChallenges } from '@/hooks/useContractEvents';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

const ResolvePage = () => {
  const { isConnected, address } = useAccount();
  const { data: skillClaims, isLoading: claimsLoading } = useContractEvents();
  const { data: challenges, isLoading: challengesLoading } = useContractChallenges();
  const { voteOnChallenge, hash, error, isPending } = useVoteOnChallenge();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);

  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [supportsClaimant, setSupportsClaimant] = useState<boolean>(true);
  const [reasoning, setReasoning] = useState('');

  const handleVote = async (challengeId: number, claimId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!reasoning.trim()) {
      alert('Please provide reasoning for your vote');
      return;
    }

    try {
      await voteOnChallenge(claimId, supportsClaimant, reasoning);
      setSelectedChallenge(null);
      setReasoning('');
    } catch (err) {
      console.error('Error voting on challenge:', err);
    }
  };

  const getClaimById = (claimId: number) => {
    return skillClaims?.find((_: any, index: number) => index + 1 === claimId);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case SKILL_CLAIM_STATUS.PENDING: return 'Pending';
      case SKILL_CLAIM_STATUS.CHALLENGED: return 'Challenged';
      case SKILL_CLAIM_STATUS.VERIFIED: return 'Verified';
      case SKILL_CLAIM_STATUS.REJECTED: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case SKILL_CLAIM_STATUS.PENDING: return 'text-yellow-600';
      case SKILL_CLAIM_STATUS.CHALLENGED: return 'text-red-600';
      case SKILL_CLAIM_STATUS.VERIFIED: return 'text-green-600';
      case SKILL_CLAIM_STATUS.REJECTED: return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Please connect your wallet to resolve challenges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resolve Challenges</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Vote submitted successfully! Transaction hash: {hash}
          </div>
        )}

        {challengesLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading challenges...</p>
          </div>
        ) : challenges && challenges.length > 0 ? (
          <div className="space-y-6">
            {challenges.map((challenge: any, index: number) => {
              const claim = getClaimById(Number(challenge.claimId));
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Challenge #{index + 1} - Claim #{challenge.claimId}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Challenged by: {`${challenge.challenger.slice(0, 6)}...${challenge.challenger.slice(-4)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(Number(challenge.challengeTimestamp) * 1000).toLocaleString()}
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Stake: {Number(challenge.stakeAmount) / 1e18} ETH
                      </p>
                    </div>
                  </div>

                  {claim && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Claim Details:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Claimant:</span> {`${claim.user.slice(0, 6)}...${claim.user.slice(-4)}`}
                        </div>
                        <div>
                          <span className="font-medium">Skill:</span> {claim.skillId}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 font-semibold ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Problem Solved:</span> {claim.problemSolved ? 'Yes' : 'No'}
                        </div>
                      </div>
                      {claim.solution && (
                        <div className="mt-2">
                          <span className="font-medium">Solution:</span>
                          <a href={claim.solution} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                            View Solution
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Challenge Reason:</h4>
                    <p className="text-red-700 dark:text-red-300">{challenge.reason}</p>
                  </div>

                  {selectedChallenge === index ? (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Cast Your Vote:</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vote:
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={supportsClaimant}
                                onChange={() => setSupportsClaimant(true)}
                                className="mr-2"
                              />
                              Support Claimant
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                checked={!supportsClaimant}
                                onChange={() => setSupportsClaimant(false)}
                                className="mr-2"
                              />
                              Support Challenger
                            </label>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reasoning:
                          </label>
                          <textarea
                            id="reasoning"
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Explain your reasoning for this vote..."
                          />
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleVote(index + 1, Number(challenge.claimId))}
                            disabled={isPending || isConfirming}
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                          >
                            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Submit Vote'}
                          </button>
                          <button
                            onClick={() => setSelectedChallenge(null)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(index)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Vote on Challenge
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No active challenges found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolvePage;