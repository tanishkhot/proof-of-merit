// Contract ABI for SkillVerification
export const SKILL_VERIFICATION_ABI = [
  // Read functions
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resolver",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PREDEFINED_STAKE_AMOUNT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "skillClaims",
    "outputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "skillId", "type": "string"},
      {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "claimTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "problemDeadline", "type": "uint256"},
      {"internalType": "uint256", "name": "challengeDeadline", "type": "uint256"},
      {"internalType": "bool", "name": "problemSolved", "type": "bool"},
      {"internalType": "string", "name": "problemStatement", "type": "string"},
      {"internalType": "string", "name": "solution", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_claimId", "type": "uint256"}],
    "name": "getClaim",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "string", "name": "skillId", "type": "string"},
          {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
          {"internalType": "uint8", "name": "status", "type": "uint8"},
          {"internalType": "uint256", "name": "claimTimestamp", "type": "uint256"},
          {"internalType": "uint256", "name": "problemDeadline", "type": "uint256"},
          {"internalType": "uint256", "name": "challengeDeadline", "type": "uint256"},
          {"internalType": "bool", "name": "problemSolved", "type": "bool"},
          {"internalType": "string", "name": "problemStatement", "type": "string"},
          {"internalType": "string", "name": "solution", "type": "string"}
        ],
        "internalType": "struct SkillVerification.SkillClaim",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_claimId", "type": "uint256"}],
    "name": "getChallengeForClaim",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "challenger", "type": "address"},
          {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
          {"internalType": "string", "name": "reason", "type": "string"},
          {"internalType": "uint256", "name": "claimId", "type": "uint256"},
          {"internalType": "uint256", "name": "challengeTimestamp", "type": "uint256"}
        ],
        "internalType": "struct SkillVerification.Challenge",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllSkills",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_skillId", "type": "string"}],
    "name": "getProblemStatement",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_skillId", "type": "string"}],
    "name": "isSkillAvailable",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "string", "name": "_skillId", "type": "string"}],
    "name": "hasUserSkill",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [
      {"internalType": "string", "name": "_skillId", "type": "string"},
      {"internalType": "string", "name": "_problemStatement", "type": "string"}
    ],
    "name": "claimSkill",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_claimId", "type": "uint256"},
      {"internalType": "string", "name": "_solution", "type": "string"}
    ],
    "name": "submitSolution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_skillId", "type": "string"}
    ],
    "name": "stakeClaim",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_claimId", "type": "uint256"},
      {"internalType": "string", "name": "_reason", "type": "string"}
    ],
    "name": "challengeClaim",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_claimId", "type": "uint256"}
    ],
    "name": "checkTimeExpiry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_claimId", "type": "uint256"},
      {"internalType": "bool", "name": "_supportsClaimant", "type": "bool"},
      {"internalType": "string", "name": "_reasoning", "type": "string"}
    ],
    "name": "voteOnChallenge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Owner-only functions
  {
    "inputs": [{"internalType": "address", "name": "_newResolver", "type": "address"}],
    "name": "setResolver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_skillId", "type": "string"},
      {"internalType": "string", "name": "_problemStatement", "type": "string"}
    ],
    "name": "addSkill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_skillId", "type": "string"}],
    "name": "removeSkill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_skillId", "type": "string"},
      {"internalType": "string", "name": "_newProblemStatement", "type": "string"}
    ],
    "name": "updateProblemStatement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string[]", "name": "_skillIds", "type": "string[]"},
      {"internalType": "string[]", "name": "_problemStatements", "type": "string[]"}
    ],
    "name": "addMultipleSkills",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "string", "name": "_skillId", "type": "string"}
    ],
    "name": "directlyAssignSkill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "string[]", "name": "_skillIds", "type": "string[]"}
    ],
    "name": "directlyAssignMultipleSkills",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_claimId", "type": "uint256"}],
    "name": "resolveChallenge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingClaims",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingClaimsDetails",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "string", "name": "skillId", "type": "string"},
          {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
          {"internalType": "uint8", "name": "status", "type": "uint8"},
          {"internalType": "uint256", "name": "claimTimestamp", "type": "uint256"},
          {"internalType": "uint256", "name": "problemDeadline", "type": "uint256"},
          {"internalType": "uint256", "name": "challengeDeadline", "type": "uint256"},
          {"internalType": "bool", "name": "problemSolved", "type": "bool"},
          {"internalType": "string", "name": "problemStatement", "type": "string"},
          {"internalType": "string", "name": "solution", "type": "string"}
        ],
        "internalType": "struct SkillVerification.SkillClaim[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingClaimIds",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "claimId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "skillId", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "stakeAmount", "type": "uint256"}
    ],
    "name": "SkillClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "claimId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "challenger", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "ClaimChallenged",
    "type": "event"
  }
] as const;

// Contract address - deployed to Flow testnet
export const SKILL_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x680804c33D2fD7935e3B585c26B51419d6a8071F";

// Status enum values
export const SKILL_CLAIM_STATUS = {
  PENDING: 0,
  CHALLENGED: 1,
  VERIFIED: 2,
  REJECTED: 3
} as const;