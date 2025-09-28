'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useChallengeClaim, useTransactionStatus, useCheckTimeExpiry, useUserSkills, usePendingClaimsDetails } from '@/hooks/useSkillVerification';
import { useContractEvents } from '@/hooks/useContractEvents';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

interface SkillClaim {
  claimId: number;
  user: string;
  skillId: string;
  stakeAmount: string;
  status: number;
  claimTimestamp: number;
  problemDeadline: number;
  challengeDeadline: number;
  problemSolved: boolean;
  problemStatement: string;
  solution: string;
}

const Sidebar = () => {
  const { address, isConnected } = useAccount();
  
  return (
    <div className="w-1/4 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-fit">
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mb-4 flex items-center justify-center shadow-md">
          <span className="text-white text-4xl font-light">{address ? address.slice(2, 4) : '?'}</span>
        </div>
        <h2 className="text-xl font-normal text-gray-800">
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}
        </h2>
      </div>
      
      <div className="space-y-4">
        <Link href="/claims" className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
          View Claims
        </Link>
        <Link href="/profile" className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
          My Profile
        </Link>
        <Link href="/resolve" className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
          Resolve Challenges
        </Link>
      </div>
    </div>
  );
};

const ChallengesPageContent = () => {
  const { address, isConnected } = useAccount();
  const { data: pendingClaims, isLoading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingClaimsDetails();
  const { data: allClaims, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useContractEvents();
  // const { data: challenges } = useContractChallenges(); // Unused for now
  const { data: userSkills } = useUserSkills(address);
  const { challengeClaim, hash, error: challengeError, isPending } = useChallengeClaim();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);
  const { checkTimeExpiry } = useCheckTimeExpiry();

  // Combine pending claims with event-based claims for complete view
  const skillClaims = React.useMemo(() => {
    // Use event-based claims if available, fallback to pending claims
    if (allClaims && allClaims.length > 0) {
      return allClaims;
    }
    return pendingClaims || [];
  }, [allClaims, pendingClaims]);

  const isLoading = pendingLoading || eventsLoading;
  const error = pendingError || eventsError;

  // Refetch data when a transaction is successful
  useEffect(() => {
    if (isSuccess) {
      // Refetch both pending claims and events after successful transaction
      refetchPending?.();
      refetchEvents?.();
      
      // Also add a small delay to ensure blockchain state has updated
      setTimeout(() => {
        refetchPending?.();
        refetchEvents?.();
      }, 2000);
    }
  }, [isSuccess, refetchPending, refetchEvents]);

  const handleChallenge = async (claimId: number, reason: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for challenging');
      return;
    }

    try {
      await challengeClaim(claimId, reason);
    } catch (err) {
      console.error('Error challenging claim:', err);
    }
  };

  const handleTimeExpiryCheck = async (claimId: number): Promise<void> => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await checkTimeExpiry(claimId);
    } catch (err) {
      console.error('Error checking time expiry:', err);
    }
  };

  const canChallenge = (claim: SkillClaim) => {
    if (!isConnected || !address) return false;
    if (claim.user.toLowerCase() === address.toLowerCase()) return false;
    if (claim.status !== SKILL_CLAIM_STATUS.PENDING) return false;
    if (!claim.problemSolved) return false;
    
    // Check if user has the required skill to challenge
    const hasRequiredSkill = userSkills && userSkills.includes(claim.skillId);
    if (!hasRequiredSkill) return false;
    
    return true;
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
      case SKILL_CLAIM_STATUS.PENDING: return 'text-yellow-600 bg-yellow-100';
      case SKILL_CLAIM_STATUS.CHALLENGED: return 'text-red-600 bg-red-100';
      case SKILL_CLAIM_STATUS.VERIFIED: return 'text-green-600 bg-green-100';
      case SKILL_CLAIM_STATUS.REJECTED: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Connect Your Wallet</h1>
          <p className="text-xl text-gray-600 font-light mb-8">
            Please connect your wallet to view and challenge claims.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Challenge Claims</h1>
          <p className="text-xl text-gray-600 font-light mt-4">
            Challenge skill claims that you believe are invalid
          </p>
          <button
            onClick={() => {
              refetchPending?.();
              refetchEvents?.();
            }}
            className="mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-normal py-2 px-6 rounded-xl shadow-md transition-all duration-300"
          >
            🔄 Refresh Claims
          </button>
        </div>

        <div className="flex gap-8">
          <Sidebar />
          
          <div className="flex-1">
            {challengeError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                Error: {challengeError.message}
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6">
                Challenge submitted successfully! Transaction hash: {hash}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                Error loading claims: {error}
              </div>
            )}

            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Loading claims...</p>
              </div>
            ) : skillClaims && skillClaims.length > 0 ? (
              <div className="space-y-6">
                {skillClaims.map((claim: SkillClaim, index: number) => {
                  const canChallengeThis = canChallenge(claim);
                  
                  return (
                    <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-light text-gray-800">{claim.skillId}</h3>
                          <p className="text-gray-500">
                            Claimant: {`${claim.user.slice(0, 6)}...${claim.user.slice(-4)}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                          <p className="text-gray-500 text-sm mt-1">
                            Stake: {Number(claim.stakeAmount) / 1e18} ETH
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Claim Details:</h4>
                        <div className="grid grid-cols-2 gap-4 text-base">
                          <div>
                            <span className="font-medium text-gray-600">Claimant:</span> {`${claim.user.slice(0, 6)}...${claim.user.slice(-4)}`}
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Skill:</span> {claim.skillId}
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Status:</span> 
                            <span className={`ml-1 font-semibold ${getStatusColor(claim.status)}`}>
                              {getStatusText(claim.status)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Problem Solved:</span> {claim.problemSolved ? 'Yes' : 'No'}
                          </div>
                        </div>
                        {claim.solution && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-600">Solution:</span>
                            <a href={claim.solution} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                              View Solution
                            </a>
                          </div>
                        )}
                        <div className="mt-3">
                          <span className="font-medium text-gray-600">Problem Statement:</span>
                          <p className="text-gray-700 text-sm mt-1">{claim.problemStatement}</p>
                        </div>
                      </div>

                      {canChallengeThis && (
                        <div className="border-t border-gray-100 pt-6">
                          <h4 className="font-semibold text-gray-800 mb-4">Challenge This Claim:</h4>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor={`reason-${index}`} className="block text-base font-medium text-gray-700 mb-2">
                                Reason for Challenge:
                              </label>
                              <textarea
                                id={`reason-${index}`}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-base"
                                placeholder="Explain why you believe this claim is invalid..."
                              />
                            </div>
                            <div className="flex space-x-4">
                              <button
                                onClick={() => {
                                  const reasonInput = document.getElementById(`reason-${index}`) as HTMLTextAreaElement;
                                  const reason = reasonInput?.value || '';
                                  handleChallenge(index + 1, reason);
                                }}
                                disabled={isPending || isConfirming}
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                              >
                                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Challenge Claim'}
                              </button>
                              <button
                                onClick={() => handleTimeExpiryCheck(index + 1)}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300"
                              >
                                Check Time Expiry
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!canChallengeThis && claim.status === SKILL_CLAIM_STATUS.PENDING && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-500 text-sm">
                            {claim.user.toLowerCase() === address.toLowerCase() 
                              ? "You cannot challenge your own claim"
                              : !claim.problemSolved 
                                ? "Claimant must solve the problem first"
                                : !userSkills || !userSkills.includes(claim.skillId)
                                  ? "You must have this skill verified to challenge"
                                  : "Cannot challenge this claim"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No claims available to challenge</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPageContent;
