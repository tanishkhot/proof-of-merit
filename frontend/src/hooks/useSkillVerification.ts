'use client';

import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { SKILL_VERIFICATION_ABI, SKILL_VERIFICATION_ADDRESS, SKILL_CLAIM_STATUS } from '@/lib/contracts';

export function useSkillClaim(claimId: number) {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getClaim',
    args: [BigInt(claimId)],
    query: {
      retry: 1,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });
}

// For now, we'll return empty array since we can't get all claims efficiently
export function useSkillClaims() {
  return {
    data: [] as any[],
    isLoading: false,
    error: null,
  };
}

export function useStakeAmount() {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'PREDEFINED_STAKE_AMOUNT',
  });
}

export function useStakeClaim() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const stakeClaim = async (skillId: string) => {
    const stakeAmount = parseEther('0.01'); // 0.01 ETH
    
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'stakeClaim',
      args: [skillId],
      value: stakeAmount,
    });
  };

  return {
    stakeClaim,
    hash,
    error,
    isPending,
  };
}

export function useSubmitSolution() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const submitSolution = async (claimId: number, solution: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'submitSolution',
      args: [BigInt(claimId), solution],
    });
  };

  return {
    submitSolution,
    hash,
    error,
    isPending,
  };
}

export function useChallengeClaim() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const challengeClaim = async (claimId: number, reason: string) => {
    const stakeAmount = parseEther('0.01'); // 0.01 ETH
    
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'challengeClaim',
      args: [BigInt(claimId), reason],
      value: stakeAmount,
    });
  };

  return {
    challengeClaim,
    hash,
    error,
    isPending,
  };
}

export function useVoteOnChallenge() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const voteOnChallenge = async (claimId: number, supportsClaimant: boolean, reasoning: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'voteOnChallenge',
      args: [BigInt(claimId), supportsClaimant, reasoning],
    });
  };

  return {
    voteOnChallenge,
    hash,
    error,
    isPending,
  };
}

export function useChallengeForClaim(claimId: number) {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getChallengeForClaim',
    args: [BigInt(claimId)],
  });
}

// For now, we'll return empty array since we can't get all challenges efficiently
export function useAllChallenges() {
  return {
    data: [] as any[],
    isLoading: false,
    error: null,
  };
}

export function useHasUserSkill(userAddress: `0x${string}` | undefined, skillId: string) {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'hasUserSkill',
    args: userAddress && skillId ? [userAddress, skillId] : undefined,
  });
}

// Custom hook to get all user skills by checking each available skill
export function useUserSkills(userAddress: `0x${string}` | undefined) {
  const { data: availableSkills, isLoading: skillsLoading } = useAvailableSkills();
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const checkUserSkills = async () => {
      if (!userAddress || !availableSkills || availableSkills.length === 0 || !publicClient) {
        setUserSkills([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check each available skill to see if the user has it
        const skillChecks = availableSkills.map(async (skill: string) => {
          try {
            const result = await publicClient.readContract({
              address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
              abi: SKILL_VERIFICATION_ABI,
              functionName: 'hasUserSkill',
              args: [userAddress, skill],
            });
            return result ? skill : null;
          } catch (err) {
            console.error(`Error checking skill ${skill}:`, err);
            return null;
          }
        });

        const results = await Promise.all(skillChecks);
        const verifiedSkills = results.filter((skill): skill is string => skill !== null);
        
        setUserSkills(verifiedSkills);
      } catch (err) {
        console.error('Error checking user skills:', err);
        setError(err as Error);
        setUserSkills([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSkills();
    
    // Refresh user skills every 30 seconds to catch new assignments
    const interval = setInterval(checkUserSkills, 30000);
    
    return () => clearInterval(interval);
  }, [userAddress, availableSkills, publicClient]);

  return {
    data: userSkills,
    isLoading: isLoading || skillsLoading,
    error,
  };
}

export function useAvailableSkills() {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getAllSkills',
    query: {
      retry: 1,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });
}

export function useSkillProblemStatement(skillId: string) {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getProblemStatement',
    args: [skillId],
  });
}

export function useCheckTimeExpiry() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const checkTimeExpiry = async (claimId: number) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'checkTimeExpiry',
      args: [BigInt(claimId)],
    });
  };

  return {
    checkTimeExpiry,
    hash,
    error,
    isPending,
  };
}

// Owner-only hooks
export function useSetResolver() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const setResolver = async (newResolver: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'setResolver',
      args: [newResolver as `0x${string}`],
    });
  };

  return {
    setResolver,
    hash,
    error,
    isPending,
  };
}

export function useAddSkill() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const addSkill = async (skillId: string, problemStatement: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'addSkill',
      args: [skillId, problemStatement],
    });
  };

  return {
    addSkill,
    hash,
    error,
    isPending,
  };
}

export function useRemoveSkill() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const removeSkill = async (skillId: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'removeSkill',
      args: [skillId],
    });
  };

  return {
    removeSkill,
    hash,
    error,
    isPending,
  };
}

export function useUpdateProblemStatement() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const updateProblemStatement = async (skillId: string, newProblemStatement: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'updateProblemStatement',
      args: [skillId, newProblemStatement],
    });
  };

  return {
    updateProblemStatement,
    hash,
    error,
    isPending,
  };
}

export function useAddMultipleSkills() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const addMultipleSkills = async (skillIds: string[], problemStatements: string[]) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'addMultipleSkills',
      args: [skillIds, problemStatements],
    });
  };

  return {
    addMultipleSkills,
    hash,
    error,
    isPending,
  };
}

export function useDirectlyAssignSkill() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const directlyAssignSkill = async (user: string, skillId: string) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'directlyAssignSkill',
      args: [user as `0x${string}`, skillId],
    });
  };

  return {
    directlyAssignSkill,
    hash,
    error,
    isPending,
  };
}

export function useDirectlyAssignMultipleSkills() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const directlyAssignMultipleSkills = async (user: string, skillIds: string[]) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'directlyAssignMultipleSkills',
      args: [user as `0x${string}`, skillIds],
    });
  };

  return {
    directlyAssignMultipleSkills,
    hash,
    error,
    isPending,
  };
}

export function useResolveChallenge() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const resolveChallenge = async (claimId: number) => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'resolveChallenge',
      args: [BigInt(claimId)],
    });
  };

  return {
    resolveChallenge,
    hash,
    error,
    isPending,
  };
}

export function useEmergencyWithdraw() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const emergencyWithdraw = async () => {
    writeContract({
      address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
      abi: SKILL_VERIFICATION_ABI,
      functionName: 'emergencyWithdraw',
      args: [],
    });
  };

  return {
    emergencyWithdraw,
    hash,
    error,
    isPending,
  };
}

export function useTransactionStatus(hash: `0x${string}` | undefined) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

// New pending claims hooks
export function usePendingClaims() {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getPendingClaims',
    query: {
      retry: 1,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });
}

export function usePendingClaimsDetails() {
  const result = useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getPendingClaimsDetails',
    query: {
      retry: 1,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Add error logging
  if (result.error) {
    console.error('Error fetching pending claims details:', result.error);
  }

  return result;
}

export function usePendingClaimIds() {
  return useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getPendingClaimIds',
    query: {
      retry: 1,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });
}

export function useAllChallengeDetails() {
  const result = useReadContract({
    address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
    abi: SKILL_VERIFICATION_ABI,
    functionName: 'getAllChallengeDetails',
    query: {
      retry: 1,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Add detailed error logging
  if (result.error) {
    console.error('Error fetching challenge details:', {
      error: result.error,
      message: result.error.message,
      cause: result.error.cause,
      details: result.error.details,
    });
  }

  return result;
}