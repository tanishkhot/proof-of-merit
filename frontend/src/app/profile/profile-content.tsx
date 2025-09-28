'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useUserSkills } from '@/hooks/useSkillVerification';
import { useContractEvents, useSkillAssignmentEvents } from '@/hooks/useContractEvents';
import { SKILL_CLAIM_STATUS } from '@/lib/contracts';

const ProfilePageContent = () => {
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
            Please connect your wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Your Profile</h1>
          <p className="text-xl text-gray-600 font-light mt-4">
            Address: {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </p>
        </div>

        {/* Verified Skills Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-gray-800 mb-6">Verified Skills</h2>
          {skillsLoading ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500">Loading skills...</p>
            </div>
          ) : userSkills && userSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.map((skill: string, index: number) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-gray-800">{skill}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500">No verified skills yet</p>
            </div>
          )}
        </div>

        {/* Skill Claims Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-gray-800 mb-6">Your Skill Claims</h2>
          {claimsLoading ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500">Loading claims...</p>
            </div>
          ) : skillClaims && skillClaims.length > 0 ? (
            <div className="space-y-6">
              {skillClaims
                .filter((claim: any) => claim.user === address)
                .map((claim: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium text-gray-800">{claim.skillId}</h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(typeof claim.claimTimestamp === 'bigint' ? Number(claim.claimTimestamp) : claim.claimTimestamp).toLocaleString()}
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
                    
                    {claim.problemStatement && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Problem Statement:</h4>
                        <p className="text-gray-600 text-sm">{claim.problemStatement}</p>
                      </div>
                    )}
                    
                    {claim.solution && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Solution:</h4>
                        <a 
                          href={claim.solution} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View Solution
                        </a>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500">No skill claims found</p>
            </div>
          )}
        </div>

        {/* Skill Assignments Section */}
        {skillAssignments && skillAssignments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-800 mb-6">Skill Assignments</h2>
            <div className="space-y-4">
              {skillAssignments
                .filter((assignment: any) => assignment.user === address)
                .map((assignment: any, index: number) => (
                  <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-medium text-gray-800">{assignment.skillId}</h3>
                        <p className="text-gray-500 text-sm">
                          Assigned on: {new Date(assignment.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Assigned
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePageContent;
