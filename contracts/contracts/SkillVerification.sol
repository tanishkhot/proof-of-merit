// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SkillVerification {
    address public owner;
    address public resolver;

    // Predefined stake amount: 0.01 ETH
    uint256 public constant PREDEFINED_STAKE_AMOUNT = 0.01 ether;

    // Time constants
    uint256 public constant PROBLEM_SOLVING_TIME = 2 hours;
    uint256 public constant CHALLENGE_WINDOW = 72 hours;

    // Status: 0=Pending, 1=Challenged, 2=Verified, 3=Rejected
    enum Status {
        PENDING,
        CHALLENGED,
        VERIFIED,
        REJECTED
    }

    struct SkillClaim {
        address user;
        string skillId; // e.g., "React", "Solidity"
        uint256 stakeAmount;
        Status status;
        uint256 claimTimestamp;
        uint256 problemDeadline; // When the problem solving period ends
        uint256 challengeDeadline; // When the challenge window ends
        bool problemSolved; // Whether the claimant solved the problem
        string problemStatement; // The problem they need to solve (provided by platform)
        string solution; // The claimant's solution
    }

    struct Challenge {
        address challenger;
        uint256 stakeAmount;
        string reason;
        uint256 claimId;
        uint256 challengeTimestamp;
    }

    struct ResolverVote {
        address resolver;
        bool supportsClaimant; // true = claimant wins, false = challenger wins
        string reasoning;
        uint256 timestamp;
    }

    // Events
    event ClaimStaked(address indexed user, uint256 indexed claimId, string skillId, uint256 stakeAmount, string problemStatement);
    event ProblemSolved(uint256 indexed claimId, string solution);
    event ClaimChallenged(address indexed challenger, uint256 indexed claimId, string reason, uint256 stakeAmount);
    event ResolverVoted(address indexed resolver, uint256 indexed claimId, bool supportsClaimant, string reasoning);
    event ChallengeResolved(uint256 indexed claimId, bool claimantWon, address winner, uint256 totalAmount);
    event SkillVerified(address indexed user, string skillId);
    event SkillAdded(string skillId, string problemStatement);
    event SkillRemoved(string skillId);
    event ResolverUpdated(address indexed oldResolver, address indexed newResolver);
    event StakeDistributed(uint256 indexed claimId, address indexed winner, uint256 winnerAmount, uint256 platformAmount, uint256 resolverAmount);
    event SkillDirectlyAssigned(address indexed user, string skillId, address indexed assignedBy);

    // State Variables
    mapping(uint256 => SkillClaim) public claims;
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => ResolverVote[]) public resolverVotes; // claimId => votes
    mapping(string => address[]) public verifiedSkills; // skillId => userAddress[]
    mapping(string => bool) public availableSkills; // skillId => isAvailable
    mapping(string => string) public skillProblemStatements; // skillId => problemStatement
    mapping(address => mapping(string => bool)) public userSkills; // user => skillId => hasSkill
    string[] public skillList; // Array to iterate over all skills

    uint256 public nextClaimId;
    uint256 public nextChallengeId;

    constructor() {
        owner = msg.sender;
        resolver = msg.sender; // Default resolver is the owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyVerifiedUser(string memory _skillId) {
        require(userSkills[msg.sender][_skillId], "You must have this skill verified to perform this action");
        _;
    }
}
