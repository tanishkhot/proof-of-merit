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

    /**
     * @dev Set the resolver address (owner only)
     * @param _newResolver The new resolver address
     */
    function setResolver(address _newResolver) public onlyOwner {
        require(_newResolver != address(0), "Resolver cannot be zero address");
        address oldResolver = resolver;
        resolver = _newResolver;
        emit ResolverUpdated(oldResolver, _newResolver);
    }

    /**
     * @dev Add a new skill with its problem statement (owner only)
     * @param _skillId The skill to add (e.g., "React", "Next.js")
     * @param _problemStatement The problem statement for this skill
     */
    function addSkill(string memory _skillId, string memory _problemStatement) public onlyOwner {
        require(bytes(_skillId).length > 0, "Skill ID cannot be empty");
        require(bytes(_problemStatement).length > 0, "Problem statement cannot be empty");
        require(!availableSkills[_skillId], "Skill already exists");

        availableSkills[_skillId] = true;
        skillProblemStatements[_skillId] = _problemStatement;
        skillList.push(_skillId);

        emit SkillAdded(_skillId, _problemStatement);
    }

    /**
     * @dev Remove a skill from the available list (owner only)
     * @param _skillId The skill to remove
     */
    function removeSkill(string memory _skillId) public onlyOwner {
        require(availableSkills[_skillId], "Skill does not exist");

        availableSkills[_skillId] = false;
        delete skillProblemStatements[_skillId];

        // Remove from skillList array
        for (uint256 i = 0; i < skillList.length; i++) {
            if (keccak256(bytes(skillList[i])) == keccak256(bytes(_skillId))) {
                skillList[i] = skillList[skillList.length - 1];
                skillList.pop();
                break;
            }
        }

        emit SkillRemoved(_skillId);
    }

    /**
     * @dev Update problem statement for an existing skill (owner only)
     * @param _skillId The skill to update
     * @param _newProblemStatement The new problem statement
     */
    function updateProblemStatement(string memory _skillId, string memory _newProblemStatement) public onlyOwner {
        require(availableSkills[_skillId], "Skill does not exist");
        require(bytes(_newProblemStatement).length > 0, "Problem statement cannot be empty");
        
        skillProblemStatements[_skillId] = _newProblemStatement;
    }

    /**
     * @dev Add multiple skills at once (owner only)
     * @param _skillIds Array of skills to add
     * @param _problemStatements Array of problem statements for each skill
     */
    function addMultipleSkills(string[] memory _skillIds, string[] memory _problemStatements) public onlyOwner {
        require(_skillIds.length == _problemStatements.length, "Arrays must have same length");
        
        for (uint256 i = 0; i < _skillIds.length; i++) {
            if (bytes(_skillIds[i]).length > 0 && bytes(_problemStatements[i]).length > 0 && !availableSkills[_skillIds[i]]) {
                availableSkills[_skillIds[i]] = true;
                skillProblemStatements[_skillIds[i]] = _problemStatements[i];
                skillList.push(_skillIds[i]);
                emit SkillAdded(_skillIds[i], _problemStatements[i]);
            }
        }
    }

    /**
     * @dev Directly assign a skill to a user instantly (owner only)
     * @param _user The user to assign the skill to
     * @param _skillId The skill to assign
     */
    function directlyAssignSkill(address _user, string memory _skillId) public onlyOwner {
        require(_user != address(0), "User address cannot be zero");
        require(bytes(_skillId).length > 0, "Skill ID cannot be empty");
        require(availableSkills[_skillId], "Skill does not exist");
        require(!userSkills[_user][_skillId], "User already has this skill");

        // Add to verified skills registry
        _addVerifiedSkill(_user, _skillId);

        emit SkillDirectlyAssigned(_user, _skillId, msg.sender);
    }

    /**
     * @dev Directly assign multiple skills to a user instantly (owner only)
     * @param _user The user to assign the skills to
     * @param _skillIds Array of skills to assign
     */
    function directlyAssignMultipleSkills(address _user, string[] memory _skillIds) public onlyOwner {
        require(_user != address(0), "User address cannot be zero");
        
        for (uint256 i = 0; i < _skillIds.length; i++) {
            if (bytes(_skillIds[i]).length > 0 && availableSkills[_skillIds[i]] && !userSkills[_user][_skillIds[i]]) {
                _addVerifiedSkill(_user, _skillIds[i]);
                emit SkillDirectlyAssigned(_user, _skillIds[i], msg.sender);
            }
        }
    }
