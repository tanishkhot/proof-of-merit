'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useVoteOnChallenge, useTransactionStatus, useAllChallengeDetails, useResolveChallenge, usePendingClaimsDetails } from '@/hooks/useSkillVerification';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

const ResolvePageContent = () => {
  const { isConnected, address } = useAccount();
  const { data: challengeDetails, isLoading: challengesLoading, error: challengesError } = useAllChallengeDetails();
  
  // Fallback to usePendingClaimsDetails if getAllChallengeDetails fails
  const { data: fallbackClaims, isLoading: fallbackLoading, error: fallbackError } = usePendingClaimsDetails();
  const { voteOnChallenge, hash, error, isPending } = useVoteOnChallenge();
  const { resolveChallenge, hash: resolveHash, error: resolveError, isPending: isResolvePending } = useResolveChallenge();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);
  const { isLoading: isResolveConfirming, isSuccess: isResolveSuccess } = useTransactionStatus(resolveHash);

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

  const handleResolveChallenge = async (claimId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await resolveChallenge(claimId);
    } catch (err) {
      console.error('Error resolving challenge:', err);
    }
  };

  // Use fallback data if getAllChallengeDetails fails
  const useFallback = challengesError && !challengesLoading;
  const currentData = useFallback ? fallbackClaims : challengeDetails;
  const currentLoading = useFallback ? fallbackLoading : challengesLoading;
  const currentError = useFallback ? fallbackError : challengesError;

  // Filter to get only challenged claims (status 1 = CHALLENGED)
  // If using fallback, we need to transform the data structure
  let challengedClaims: any[] = [];
  
  if (useFallback && currentData) {
    // Transform fallback data to match challenge structure
    challengedClaims = currentData
      .filter((claim: any) => claim.status === SKILL_CLAIM_STATUS.CHALLENGED)
      .map((claim: any, index: number) => ({
        challengeId: index + 1,
        challenger: '0x0000000000000000000000000000000000000000', // Unknown challenger
        stakeAmount: claim.stakeAmount,
        reason: 'Challenge details not available',
        claimId: index + 1,
        challengeTimestamp: claim.claimTimestamp,
        claimant: claim.user,
        skillId: claim.skillId,
        claimStatus: claim.status,
        problemSolved: claim.problemSolved,
        problemStatement: claim.problemStatement,
        solution: claim.solution
      }));
  } else if (currentData) {
    challengedClaims = currentData.filter((challenge: any) => challenge.claimStatus === SKILL_CLAIM_STATUS.CHALLENGED) || [];
  }

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
      case SKILL_CLAIM_STATUS.PENDING: return 'text-yellow-500';
      case SKILL_CLAIM_STATUS.CHALLENGED: return 'text-red-500';
      case SKILL_CLAIM_STATUS.VERIFIED: return 'text-green-500';
      case SKILL_CLAIM_STATUS.REJECTED: return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Connect Your Wallet</h1>
          <p className="text-xl text-gray-600 font-light mb-8">
            Please connect your wallet to resolve challenges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Resolve Challenges</h1>
        </div>

        {(error || resolveError) && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            Error: {(error || resolveError)?.message}
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
            Vote submitted successfully! Transaction hash: {hash}
          </div>
        )}

        {isResolveSuccess && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
            Challenge resolved successfully! Transaction hash: {resolveHash}
          </div>
        )}

        {currentError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            Error loading challenges: {currentError}
            {useFallback && (
              <div className="mt-2 text-sm text-red-600">
                Note: Using fallback data. The contract may need to be redeployed with the latest getAllChallengeDetails function.
              </div>
            )}
          </div>
        )}

        {currentLoading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Loading challenges...</p>
          </div>
        ) : challengedClaims && challengedClaims.length > 0 ? (
          <div className="space-y-8">
            {challengedClaims.map((challenge: any, index: number) => {
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-light text-gray-800">
                        Challenge #{challenge.challengeId} - Claim #{challenge.claimId}
                      </h3>
                      <p className="text-gray-500">
                        Challenger: {`${challenge.challenger.slice(0, 6)}...${challenge.challenger.slice(-4)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(typeof challenge.challengeTimestamp === 'bigint' ? Number(challenge.challengeTimestamp) : challenge.challengeTimestamp).toLocaleString()}
                      </p>
                      <p className="font-semibold text-gray-800">
                        Challenge Stake: {Number(challenge.stakeAmount) / 1e18} ETH
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 p-6 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">Claim Details:</h4>
                    <div className="grid grid-cols-2 gap-4 text-base">
                      <div>
                        <span className="font-medium text-gray-600">Claimant:</span> {`${challenge.claimant.slice(0, 6)}...${challenge.claimant.slice(-4)}`}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Skill:</span> {challenge.skillId}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span> 
                        <span className={`ml-1 font-semibold ${getStatusColor(challenge.claimStatus)}`}>
                          {getStatusText(challenge.claimStatus)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Problem Solved:</span> {challenge.problemSolved ? 'Yes' : 'No'}
                      </div>
                    </div>
                    {challenge.solution && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-600">Solution:</span>
                        <a href={challenge.solution} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                          View Solution
                        </a>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Problem Statement:</span>
                      <p className="text-gray-700 text-sm mt-1">{challenge.problemStatement}</p>
                    </div>
                  </div>

                  <div className="mb-6 p-6 bg-red-50 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-2">Challenge Information:</h4>
                    <p className="text-red-700 mb-2"><strong>Reason:</strong> {challenge.reason}</p>
                    <p className="text-red-700">This claim has been challenged and is awaiting resolution.</p>
                  </div>

                  {selectedChallenge === index ? (
                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Cast Your Vote:</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            Vote:
                          </label>
                          <div className="flex space-x-6">
                            <label className="flex items-center text-lg">
                              <input
                                type="radio"
                                checked={supportsClaimant}
                                onChange={() => setSupportsClaimant(true)}
                                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                              />
                              Support Claimant
                            </label>
                            <label className="flex items-center text-lg">
                              <input
                                type="radio"
                                checked={!supportsClaimant}
                                onChange={() => setSupportsClaimant(false)}
                                className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                              />
                              Support Challenger
                            </label>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="reasoning" className="block text-base font-medium text-gray-700 mb-2">
                            Reasoning:
                          </label>
                          <textarea
                            id="reasoning"
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-base"
                            placeholder="Explain your reasoning for this vote..."
                          />
                        </div>
                        <div className="flex space-x-4 pt-4">
                                          <button
                                            onClick={() => handleVote(challenge.challengeId, challenge.claimId)}
                                            disabled={isPending || isConfirming}
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                                          >
                                            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Submit Vote'}
                                          </button>
                                          <button
                                            onClick={() => handleResolveChallenge(challenge.claimId)}
                                            disabled={isResolvePending || isResolveConfirming}
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                                          >
                                            {isResolvePending ? 'Confirming...' : isResolveConfirming ? 'Processing...' : 'Resolve Challenge'}
                                          </button>
                          <button
                            onClick={() => setSelectedChallenge(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-normal py-3 px-8 rounded-xl transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(index)}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                      Vote on Challenge
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No active challenges found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolvePageContent;
