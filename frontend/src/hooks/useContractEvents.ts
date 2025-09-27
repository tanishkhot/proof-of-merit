import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { SKILL_VERIFICATION_ADDRESS, SKILL_VERIFICATION_ABI } from '@/lib/contracts';
import { parseAbiItem } from 'viem';

// Real implementation using viem to fetch contract events
export function useContractEvents() {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching contract events from:', SKILL_VERIFICATION_ADDRESS);

        // Fetch all relevant events from the contract
        const [claimStakedLogs, solutionSubmittedLogs, claimChallengedLogs, challengeResolvedLogs] = await Promise.all([
          // ClaimStaked events
          publicClient.getLogs({
            address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
            event: parseAbiItem('event ClaimStaked(uint256 indexed claimId, address indexed user, string skillId, uint256 stakeAmount, uint256 timestamp)'),
            fromBlock: 'earliest',
            toBlock: 'latest'
          }).catch(err => {
            console.log('No ClaimStaked events found:', err.message);
            return [];
          }),
          // SolutionSubmitted events
          publicClient.getLogs({
            address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
            event: parseAbiItem('event SolutionSubmitted(uint256 indexed claimId, string solution, uint256 timestamp)'),
            fromBlock: 'earliest',
            toBlock: 'latest'
          }).catch(err => {
            console.log('No SolutionSubmitted events found:', err.message);
            return [];
          }),
          // ClaimChallenged events
          publicClient.getLogs({
            address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
            event: parseAbiItem('event ClaimChallenged(uint256 indexed claimId, address indexed challenger, string reason, uint256 stakeAmount, uint256 timestamp)'),
            fromBlock: 'earliest',
            toBlock: 'latest'
          }).catch(err => {
            console.log('No ClaimChallenged events found:', err.message);
            return [];
          }),
          // ChallengeResolved events
          publicClient.getLogs({
            address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
            event: parseAbiItem('event ChallengeResolved(uint256 indexed claimId, bool claimantWon, address winner, uint256 totalDistributed)'),
            fromBlock: 'earliest',
            toBlock: 'latest'
          }).catch(err => {
            console.log('No ChallengeResolved events found:', err.message);
            return [];
          })
        ]);

        console.log('Fetched events:', {
          claimStaked: claimStakedLogs.length,
          solutionSubmitted: solutionSubmittedLogs.length,
          claimChallenged: claimChallengedLogs.length,
          challengeResolved: challengeResolvedLogs.length
        });

        // Combine all events and sort by block number
        const allEvents = [
          ...claimStakedLogs.map(log => ({ ...log, eventName: 'ClaimStaked' })),
          ...solutionSubmittedLogs.map(log => ({ ...log, eventName: 'SolutionSubmitted' })),
          ...claimChallengedLogs.map(log => ({ ...log, eventName: 'ClaimChallenged' })),
          ...challengeResolvedLogs.map(log => ({ ...log, eventName: 'ChallengeResolved' }))
        ].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

        setEvents(allEvents);
      } catch (err) {
        console.error('Error fetching contract events:', err);
        setError(err as Error);
        // Fallback to empty array if there's an error
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [publicClient]);

  // Process events to create claims data
  const processEvents = (events: any[]) => {
    const claimsMap = new Map();
    
    events.forEach(event => {
      const { eventName, args } = event;
      
      if (eventName === 'ClaimStaked') {
        const claimId = Number(args.claimId);
        claimsMap.set(claimId, {
          claimId,
          user: args.user,
          skillId: args.skillId,
          stakeAmount: args.stakeAmount.toString(),
          status: 0, // PENDING
          claimTimestamp: Number(args.timestamp),
          problemDeadline: Number(args.timestamp) + (2 * 60 * 60), // 2 hours
          challengeDeadline: Number(args.timestamp) + (7 * 24 * 60 * 60), // 7 days
          problemSolved: false,
          problemStatement: getProblemStatement(args.skillId),
          solution: ''
        });
      } else if (eventName === 'SolutionSubmitted') {
        const claimId = Number(args.claimId);
        const claim = claimsMap.get(claimId);
        if (claim) {
          claim.solution = args.solution;
          claim.problemSolved = true;
        }
      } else if (eventName === 'ClaimChallenged') {
        const claimId = Number(args.claimId);
        const claim = claimsMap.get(claimId);
        if (claim) {
          claim.status = 1; // CHALLENGED
        }
      } else if (eventName === 'ChallengeResolved') {
        const claimId = Number(args.claimId);
        const claim = claimsMap.get(claimId);
        if (claim) {
          claim.status = args.claimantWon ? 2 : 3; // VERIFIED or REJECTED
        }
      }
    });
    
    return Array.from(claimsMap.values());
  };

  return {
    data: processEvents(events),
    isLoading,
    error
  };
}

// Helper function to get problem statements
function getProblemStatement(skillId: string): string {
  const problemStatements: { [key: string]: string } = {
    'React': 'Build a React component that displays a list of users with search functionality. The component should include filtering, sorting, and pagination.',
    'Solidity': 'Create a smart contract for a simple voting system where users can propose options and vote on them. Include access control and vote counting.',
    'JavaScript': 'Implement a function that finds the longest common subsequence between two strings. Optimize for both time and space complexity.',
    'Python': 'Create a REST API using Flask or FastAPI that manages a todo list with CRUD operations, user authentication, and data validation.',
    'Node.js': 'Build a real-time chat application using Socket.io with rooms, private messaging, and message history.',
    'TypeScript': 'Create a type-safe state management system similar to Redux but with better TypeScript integration and middleware support.',
    'Web3': 'Build a DApp that allows users to mint NFTs with custom metadata and view their collection with a clean interface.',
    'Blockchain': 'Create a simple blockchain implementation with proof-of-work, transaction validation, and a basic wallet system.'
  };
  
  return problemStatements[skillId] || `Complete a ${skillId} project that demonstrates your skills.`;
}

// Hook to get challenges from events
export function useContractChallenges() {
  const publicClient = usePublicClient();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const challengeLogs = await publicClient.getLogs({
          address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
          event: parseAbiItem('event ClaimChallenged(uint256 indexed claimId, address indexed challenger, string reason, uint256 stakeAmount, uint256 timestamp)'),
          fromBlock: 'earliest',
          toBlock: 'latest'
        }).catch(err => {
          console.log('No ClaimChallenged events found:', err.message);
          return [];
        });

        const processedChallenges = challengeLogs.map(log => ({
          claimId: Number(log.args.claimId),
          challenger: log.args.challenger,
          reason: log.args.reason,
          stakeAmount: log.args.stakeAmount.toString(),
          challengeTimestamp: Number(log.args.timestamp)
        }));

        setChallenges(processedChallenges);
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError(err as Error);
        setChallenges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [publicClient]);

  return {
    data: challenges,
    isLoading,
    error
  };
}

// Hook to listen for skill assignment events
export function useSkillAssignmentEvents() {
  const publicClient = usePublicClient();
  const [skillAssignments, setSkillAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSkillAssignments = async () => {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const assignmentLogs = await publicClient.getLogs({
          address: SKILL_VERIFICATION_ADDRESS as `0x${string}`,
          event: parseAbiItem('event SkillAssigned(address indexed user, string skillId, uint256 timestamp)'),
          fromBlock: 'earliest',
          toBlock: 'latest'
        }).catch(err => {
          console.log('No SkillAssigned events found:', err.message);
          return [];
        });

        const processedAssignments = assignmentLogs.map(log => ({
          user: log.args.user,
          skillId: log.args.skillId,
          timestamp: Number(log.args.timestamp)
        }));

        setSkillAssignments(processedAssignments);
      } catch (err) {
        console.error('Error fetching skill assignments:', err);
        setError(err as Error);
        setSkillAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillAssignments();
  }, [publicClient]);

  return {
    data: skillAssignments,
    isLoading,
    error
  };
}