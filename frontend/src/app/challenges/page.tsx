'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useSkillClaims, useChallengeClaim, useTransactionStatus, useAllChallenges, useCheckTimeExpiry, useUserSkills } from '@/hooks/useSkillVerification';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

const challenges = [
  {
    user: 'Alice',
    skill: 'JavaScript',
    level: 'Intermediate',
    github_submission_url: 'https://github.com/alice/project',
    time: '2 hours ago',
  },
  {
    user: 'Bob',
    skill: 'Solidity',
    level: 'Advanced',
    github_submission_url: 'https://github.com/bob/project',
    time: '5 hours ago',
  },
  {
    user: 'Charlie',
    skill: 'React',
    level: 'Beginner',
    github_submission_url: 'https://github.com/charlie/project',
    time: '1 day ago',
  },
];

const Sidebar = () => {
  const { address, isConnected } = useAccount();
  
  return (
    <div className="w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-400 dark:bg-gray-600 mx-auto mb-4 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/128x128')" }}></div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not Connected'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isConnected ? 'Connected' : 'Connect Wallet'}
        </p>
      </div>
      <nav className="space-y-4">
        <Link href="/challenges" className="block text-lg font-semibold text-blue-500 hover:underline">Feed</Link>
        <Link href="/profile" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 hover:underline">Profile</Link>
        <Link href="/resolve" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 hover:underline">Resolve Conflicts</Link>
      </nav>
    </div>
  );
};

const ChallengesPage = () => {
  const { isConnected, address } = useAccount();
  const { data: skillClaims, isLoading, error } = useSkillClaims();
  const { data: challenges, isLoading: challengesLoading } = useAllChallenges();
  const { data: userSkills } = useUserSkills(address);
  const { challengeClaim, hash, error: challengeError, isPending } = useChallengeClaim();
  const { checkTimeExpiry, hash: expiryHash, error: expiryError, isPending: isExpiryPending } = useCheckTimeExpiry();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);
  const { isLoading: isExpiryConfirming, isSuccess: isExpirySuccess } = useTransactionStatus(expiryHash);

  const handleChallenge = async (claimId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    const reason = prompt('Please provide a reason for challenging this claim:');
    if (!reason) return;

    try {
      await challengeClaim(claimId, reason);
    } catch (err) {
      console.error('Error challenging claim:', err);
    }
  };

  const handleCheckExpiry = async (claimId: number) => {
    try {
      await checkTimeExpiry(claimId);
    } catch (err) {
      console.error('Error checking expiry:', err);
    }
  };

  const canChallenge = (claim: any) => {
    // For now, allow anyone to challenge pending claims with solutions
    // In a real implementation, you'd check if the user has the skill
    return claim.status === SKILL_CLAIM_STATUS.PENDING && claim.problemSolved;
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
                Please connect your wallet to view and challenge skill claims
              </p>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen p-8 flex space-x-8">
        <Sidebar />
        <div className="w-3/4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Skill Claims & Challenges</h1>
            </div>

            {/* User Skills Display - Temporarily disabled until we implement proper skill checking */}
            {/* {userSkills && userSkills.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Verified Skills:</h3>
                <div className="flex flex-wrap gap-2">
                  {userSkills.map((skill: string) => (
                    <span key={skill} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
            
            {isLoading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading skill claims...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error loading skill claims: {error.message}
              </div>
            )}

            {challengeError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error challenging claim: {challengeError.message}
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Challenge submitted successfully! Transaction hash: {hash}
              </div>
            )}

            {isExpirySuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Time expiry checked successfully! Transaction hash: {expiryHash}
              </div>
            )}

            {expiryError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                Error checking expiry: {expiryError.message}
              </div>
            )}

            {skillClaims && skillClaims.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Skill</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Stake</th>
                      <th className="px-4 py-2 text-left">Solution</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillClaims.map((claim: any, index: number) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">{`${claim.user.slice(0, 6)}...${claim.user.slice(-4)}`}</td>
                        <td className="px-4 py-2">{claim.skillId}</td>
                        <td className={`px-4 py-2 font-semibold ${getStatusColor(claim.status)}`}>
                          {getStatusText(claim.status)}
                        </td>
                        <td className="px-4 py-2">{Number(claim.stakeAmount) / 1e18} ETH</td>
                        <td className="px-4 py-2">
                          {claim.solution ? (
                            <a href={claim.solution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              View Solution
                            </a>
                          ) : (
                            <span className="text-gray-400">No solution</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            {canChallenge(claim) && (
                              <button 
                                onClick={() => handleChallenge(index + 1)}
                                disabled={isPending || isConfirming}
                                className="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                              >
                                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Challenge (0.01 ETH)'}
                              </button>
                            )}
                            {claim.status === SKILL_CLAIM_STATUS.PENDING && (
                              <button 
                                onClick={() => handleCheckExpiry(index + 1)}
                                disabled={isExpiryPending || isExpiryConfirming}
                                className="bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                              >
                                {isExpiryPending ? 'Confirming...' : isExpiryConfirming ? 'Processing...' : 'Check Expiry'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No skill claims found</p>
              </div>
            )}

            {/* Challenges Section */}
            {challenges && challenges.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Active Challenges</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left">Challenger</th>
                        <th className="px-4 py-2 text-left">Claim ID</th>
                        <th className="px-4 py-2 text-left">Reason</th>
                        <th className="px-4 py-2 text-left">Stake</th>
                        <th className="px-4 py-2 text-left">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challenges.map((challenge: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2">{`${challenge.challenger.slice(0, 6)}...${challenge.challenger.slice(-4)}`}</td>
                          <td className="px-4 py-2">{Number(challenge.claimId)}</td>
                          <td className="px-4 py-2">{challenge.reason}</td>
                          <td className="px-4 py-2">{Number(challenge.stakeAmount) / 1e18} ETH</td>
                          <td className="px-4 py-2">
                            {new Date(Number(challenge.challengeTimestamp) * 1000).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default ChallengesPage;