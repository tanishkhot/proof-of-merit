'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAvailableSkills, useSkillClaim, useChallengeClaim, useTransactionStatus, useHasUserSkill, usePendingClaimsDetails } from '@/hooks/useSkillVerification';
import { AddTestClaim } from '@/components/add-test-claim';
import { SKILL_CLAIM_STATUS, SKILL_VERIFICATION_ADDRESS } from '@/lib/contracts';

const ClaimsPage = () => {
  const { isConnected, address } = useAccount();
  const { data: availableSkills } = useAvailableSkills();
  const { challengeClaim, hash, error: challengeError, isPending } = useChallengeClaim();
  const { isLoading: isConfirming, isSuccess } = useTransactionStatus(hash);
  const { data: claims, isLoading: loading, error } = usePendingClaimsDetails();

  // Debug: Log the claims data
  useEffect(() => {
    console.log('Claims data:', claims);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [claims, loading, error]);

  // Claims are now loaded from the useContractEvents hook

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

  const canChallenge = (claim: any) => {
    // Can challenge if:
    // 1. Claim is pending
    // 2. Problem is solved (or time expired)
    // 3. Still within challenge window
    // 4. Not your own claim
    const now = Date.now();
    const isOwnClaim = claim.user.toLowerCase() === address?.toLowerCase();
    const isWithinChallengeWindow = now < claim.challengeDeadline;
    const canChallengeNow = claim.problemSolved || now > claim.problemDeadline;
    
    return claim.status === SKILL_CLAIM_STATUS.PENDING && 
           !isOwnClaim && 
           isWithinChallengeWindow && 
           canChallengeNow;
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

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff < 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isProblemExpired = (claim: any) => {
    return Date.now() > claim.problemDeadline;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Please connect your wallet to view and challenge claims
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Open Claims</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and challenge skill claims that are open for verification
          </p>
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            📡 Loading real data from Flow Testnet contract: {SKILL_VERIFICATION_ADDRESS}
          </div>
        </div>

        {/* Add Test Claim Component (Development Only) */}
        <AddTestClaim />

        {/* Success/Error Messages */}
        {isSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Challenge submitted successfully! Transaction hash: {hash}
          </div>
        )}

        {challengeError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error challenging claim: {challengeError.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {claims?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Claims</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {claims?.filter(claim => canChallenge(claim)).length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Challengeable</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {availableSkills?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Skills</div>
          </div>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading claims: {error}
          </div>
        ) : !claims || claims.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No claims found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Claim #{index + 1} - {claim.skillId}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      by {claim.user.slice(0, 6)}...{claim.user.slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusText(claim.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Number(claim.stakeAmount) / 1e18} ETH
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Problem Statement</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {claim.problemStatement}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Solution</h4>
                    {claim.solution ? (
                      <a 
                        href={claim.solution} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Solution
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No solution provided</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Problem Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      claim.problemSolved 
                        ? 'bg-green-100 text-green-800' 
                        : isProblemExpired(claim)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {claim.problemSolved ? 'Solved' : isProblemExpired(claim) ? 'Expired' : 'In Progress'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Time Left:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {formatTime(claim.challengeDeadline)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Claimed:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {new Date(claim.claimTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {canChallenge(claim) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleChallenge(index + 1)}
                      disabled={isPending || isConfirming}
                      className="bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                      {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Challenge Claim (0.01 ETH)'}
                    </button>
                  </div>
                )}

                {!canChallenge(claim) && claim.status === SKILL_CLAIM_STATUS.PENDING && (
                  <div className="text-sm text-gray-500">
                    {claim.user.toLowerCase() === address?.toLowerCase() 
                      ? 'This is your own claim'
                      : Date.now() > claim.challengeDeadline
                      ? 'Challenge window has expired'
                      : !claim.problemSolved && !isProblemExpired(claim)
                      ? 'Waiting for problem to be solved or time to expire'
                      : 'Cannot challenge this claim'
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Note about real data */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Live Data</h3>
          <div className="text-green-700 dark:text-green-300 space-y-2">
            <p>This page now shows real data from the smart contract using the new <code>getPendingClaimsDetails()</code> function.</p>
            <p>Data is fetched directly from the deployed contract on Flow Testnet:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Contract Address: {SKILL_VERIFICATION_ADDRESS}</li>
              <li>Function: getPendingClaimsDetails()</li>
              <li>Network: Flow Testnet (Chain ID: 545)</li>
            </ul>
            <p>Only claims that are currently pending and within the 72-hour challenge window are displayed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsPage;