'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useSkillClaims, useChallengeClaim, useTransactionStatus, useAllChallenges, useCheckTimeExpiry, useUserSkills } from '@/hooks/useSkillVerification';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

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
        <p className="text-sm text-gray-500">
          {isConnected ? 'Connected' : 'Connect Wallet'}
        </p>
      </div>
      <nav className="space-y-4">
        <Link href="/challenges" className="block text-lg font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Feed</Link>
        <Link href="/profile" className="block text-lg font-normal text-gray-600 hover:text-purple-600">Profile</Link>
        <Link href="/resolve" className="block text-lg font-normal text-gray-600 hover:text-purple-600">Resolve Conflicts</Link>
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
                Please connect your wallet to view and challenge skill claims.
              </p>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex space-x-8">
        <Sidebar />
        <div className="w-3/4">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Skill Claims & Challenges</h1>
            </div>
            
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Loading skill claims...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                Error loading skill claims: {error.message}
              </div>
            )}

            {challengeError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                Error challenging claim: {challengeError.message}
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
                Challenge submitted successfully! Transaction hash: {hash}
              </div>
            )}

            {isExpirySuccess && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">
                Time expiry checked successfully! Transaction hash: {expiryHash}
              </div>
            )}

            {expiryError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                Error checking expiry: {expiryError.message}
              </div>
            )}

            {skillClaims && skillClaims.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skillClaims.map((claim: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${claim.user.slice(0, 6)}...${claim.user.slice(-4)}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{claim.skillId}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(claim.status)}`}>
                          {getStatusText(claim.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Number(claim.stakeAmount) / 1e18} ETH</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {claim.solution ? (
                            <a href={claim.solution} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              View Solution
                            </a>
                          ) : (
                            <span className="text-gray-400">No solution</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {canChallenge(claim) && (
                              <button 
                                onClick={() => handleChallenge(index + 1)}
                                disabled={isPending || isConfirming}
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-300"
                              >
                                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Challenge (0.01 ETH)'}
                              </button>
                            )}
                            {claim.status === SKILL_CLAIM_STATUS.PENDING && (
                              <button 
                                onClick={() => handleCheckExpiry(index + 1)}
                                disabled={isExpiryPending || isExpiryConfirming}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-300"
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
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No skill claims found</p>
              </div>
            )}

            {/* Challenges Section */}
            {challenges && challenges.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-light text-center mb-8">Active Challenges</h2>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stake</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {challenges.map((challenge: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${challenge.challenger.slice(0, 6)}...${challenge.challenger.slice(-4)}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{Number(challenge.claimId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{challenge.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Number(challenge.stakeAmount) / 1e18} ETH</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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