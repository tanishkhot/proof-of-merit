'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useUserSkills } from '@/hooks/useSkillVerification';
import { useContractEvents, useSkillAssignmentEvents } from '@/hooks/useContractEvents';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

const ProfilePage = () => {
  const { isConnected, address } = useAccount();
  const { data: userSkills, isLoading: skillsLoading } = useUserSkills(address);
  const { data: skillClaims, isLoading: claimsLoading } = useContractEvents();
  const { data: skillAssignments } = useSkillAssignmentEvents();

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

  // Filter claims for current user
  const userClaims = skillClaims?.filter((claim: any) => 
    claim.user.toLowerCase() === address?.toLowerCase()
  ) || [];

  // Filter skill assignments for current user
  const userSkillAssignments = skillAssignments?.filter((assignment: any) => 
    assignment.user.toLowerCase() === address?.toLowerCase()
  ) || [];

      if (!isConnected) {
        return (
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Connect Your Wallet</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Please connect your wallet to view your profile
              </p>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {address?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Blockchain Developer</p>
            </div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Verified Skills</h3>
          {skillsLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
          ) : userSkills && userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill: string) => (
                <span key={skill} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No skills verified yet.</p>
          )}
        </div>

        {/* Directly Assigned Skills */}
        {userSkillAssignments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Directly Assigned Skills</h3>
            <div className="space-y-3">
              {userSkillAssignments.map((assignment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      {assignment.skillId}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned by Admin
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(assignment.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skill Claims History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Skill Claims History</h3>
          {claimsLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading claims...</p>
          ) : userClaims.length > 0 ? (
            <div className="space-y-4">
              {userClaims.map((claim: any, index: number) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{claim.skillId}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Claimed on: {new Date(Number(claim.claimTimestamp) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="font-medium">Stake:</span> {Number(claim.stakeAmount) / 1e18} ETH
                    </div>
                    <div>
                      <span className="font-medium">Problem Solved:</span> {claim.problemSolved ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Problem Deadline:</span> {new Date(Number(claim.problemDeadline) * 1000).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Challenge Deadline:</span> {new Date(Number(claim.challengeDeadline) * 1000).toLocaleDateString()}
                    </div>
                  </div>

                  {claim.solution && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Solution:</span>
                      <a 
                        href={claim.solution} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="ml-2 text-blue-500 hover:underline text-sm"
                      >
                        View Solution
                      </a>
                    </div>
                  )}

                  {claim.problemStatement && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Problem Statement:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {claim.problemStatement}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No skill claims yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;