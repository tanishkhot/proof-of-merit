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
        /**
     * @dev A user calls this to make a new skill claim
     * @param _skillId The skill being claimed (e.g., "React", "Solidity")
     */
    function stakeClaim(string memory _skillId) public payable {
        require(msg.value == PREDEFINED_STAKE_AMOUNT, "Stake amount must be exactly 0.01 ETH");
        require(bytes(_skillId).length > 0, "Skill ID cannot be empty");
        require(availableSkills[_skillId], "Skill is not available for claiming");
        require(!userSkills[msg.sender][_skillId], "You already have this skill verified");

        string memory problemStatement = skillProblemStatements[_skillId];
        require(bytes(problemStatement).length > 0, "Problem statement not set for this skill");

        nextClaimId++;
        
        claims[nextClaimId] = SkillClaim({
            user: msg.sender,
            skillId: _skillId,
            stakeAmount: msg.value,
            status: Status.PENDING,
            claimTimestamp: block.timestamp,
            problemDeadline: block.timestamp + PROBLEM_SOLVING_TIME,
            challengeDeadline: block.timestamp + PROBLEM_SOLVING_TIME + CHALLENGE_WINDOW,
            problemSolved: false,
            problemStatement: problemStatement,
            solution: ""
        });

        emit ClaimStaked(msg.sender, nextClaimId, _skillId, msg.value, problemStatement);
    }

    /**
     * @dev Claimant submits their solution to the problem
     * @param _claimId The ID of the claim
     * @param _solution The solution to the problem
     */
    function submitSolution(uint256 _claimId, string memory _solution) public {
        require(_claimId > 0 && _claimId <= nextClaimId, "Invalid claim ID");
        require(claims[_claimId].user == msg.sender, "Only the claimant can submit solution");
        require(claims[_claimId].status == Status.PENDING, "Claim is not in pending state");
        require(block.timestamp <= claims[_claimId].problemDeadline, "Problem solving time has expired");
        require(!claims[_claimId].problemSolved, "Solution already submitted");
        require(bytes(_solution).length > 0, "Solution cannot be empty");

        claims[_claimId].problemSolved = true;
        claims[_claimId].solution = _solution;

        emit ProblemSolved(_claimId, _solution);
    }
        /**
     * @dev Check if a claim should be auto-rejected due to time expiry
     * @param _claimId The claim ID to check
     */
    function checkTimeExpiry(uint256 _claimId) public {
        require(_claimId > 0 && _claimId <= nextClaimId, "Invalid claim ID");
        
        SkillClaim storage claim = claims[_claimId];
        
        // If problem solving time expired and no solution submitted
        if (block.timestamp > claim.problemDeadline && !claim.problemSolved && claim.status == Status.PENDING) {
            claim.status = Status.REJECTED;
            
            // Return stake to claimant
            (bool success, ) = claim.user.call{value: claim.stakeAmount}("");
            require(success, "Stake return failed");
        }
        
        // If challenge window expired and no challenge was made
        if (block.timestamp > claim.challengeDeadline && claim.status == Status.PENDING && claim.problemSolved) {
            claim.status = Status.VERIFIED;
            _addVerifiedSkill(claim.user, claim.skillId);
            emit SkillVerified(claim.user, claim.skillId);
        }
    }

    /**
     * @dev Another user calls this to challenge an existing claim
     * @param _claimId The ID of the claim to challenge
     * @param _reason The reason for the challenge
     */
    function challengeClaim(uint256 _claimId, string memory _reason) public payable onlyVerifiedUser(claims[_claimId].skillId) {
        require(_claimId > 0 && _claimId <= nextClaimId, "Invalid claim ID");
        require(claims[_claimId].status == Status.PENDING, "Claim is not pending");
        require(claims[_claimId].user != msg.sender, "Cannot challenge your own claim");
        require(msg.value == PREDEFINED_STAKE_AMOUNT, "Challenge stake must be exactly 0.01 ETH");
        require(bytes(_reason).length > 0, "Reason cannot be empty");
        require(claims[_claimId].problemSolved, "Claimant must solve the problem first");
        require(block.timestamp <= claims[_claimId].challengeDeadline, "Challenge window has expired");

        nextChallengeId++;
        
        challenges[nextChallengeId] = Challenge({
            challenger: msg.sender,
            stakeAmount: msg.value,
            reason: _reason,
            claimId: _claimId,
            challengeTimestamp: block.timestamp
        });

        // Update claim status to challenged
        claims[_claimId].status = Status.CHALLENGED;

        emit ClaimChallenged(msg.sender, _claimId, _reason, msg.value);
    }
        /**
     * @dev Resolver votes on a challenged claim
     * @param _claimId The ID of the claim to vote on
     * @param _supportsClaimant Whether the resolver supports the claimant
     * @param _reasoning The reasoning for the vote
     */
    function voteOnChallenge(uint256 _claimId, bool _supportsClaimant, string memory _reasoning) public onlyVerifiedUser(claims[_claimId].skillId) {
        require(_claimId > 0 && _claimId <= nextClaimId, "Invalid claim ID");
        require(claims[_claimId].status == Status.CHALLENGED, "Claim is not challenged");
        require(bytes(_reasoning).length > 0, "Reasoning cannot be empty");
        require(msg.sender != claims[_claimId].user, "Claimant cannot vote on their own claim");
        
        // Check if resolver already voted
        ResolverVote[] storage votes = resolverVotes[_claimId];
        for (uint256 i = 0; i < votes.length; i++) {
            require(votes[i].resolver != msg.sender, "You have already voted on this challenge");
        }

        // Add the vote
        votes.push(ResolverVote({
            resolver: msg.sender,
            supportsClaimant: _supportsClaimant,
            reasoning: _reasoning,
            timestamp: block.timestamp
        }));

        emit ResolverVoted(msg.sender, _claimId, _supportsClaimant, _reasoning);
    }

    /**
     * @dev Owner resolves a challenge based on resolver votes (for demo purposes)
     * @param _claimId The ID of the claim to resolve
     */
    function resolveChallenge(uint256 _claimId) public onlyOwner {
        require(_claimId > 0 && _claimId <= nextClaimId, "Invalid claim ID");
        require(claims[_claimId].status == Status.CHALLENGED, "Claim is not challenged");

        SkillClaim storage claim = claims[_claimId];
        ResolverVote[] storage votes = resolverVotes[_claimId];
        
        require(votes.length > 0, "No votes cast yet");

        // Count votes
        uint256 claimantVotes = 0;
        uint256 challengerVotes = 0;
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].supportsClaimant) {
                claimantVotes++;
            } else {
                challengerVotes++;
            }
        }

        bool claimantWon = claimantVotes > challengerVotes;
        address winner;
        uint256 winnerAmount;
        uint256 platformAmount;
        uint256 resolverAmount;

        // Find the challenger
        address challenger;
        for (uint256 i = 1; i <= nextChallengeId; i++) {
            if (challenges[i].claimId == _claimId) {
                challenger = challenges[i].challenger;
                break;
            }
        }

        if (claimantWon) {
            winner = claim.user;
            claim.status = Status.VERIFIED;
            
            // Add to verified skills registry
            _addVerifiedSkill(claim.user, claim.skillId);
            
            emit SkillVerified(claim.user, claim.skillId);

            // Claimant gets: their own stake + 25% of challenger's stake
            winnerAmount = claim.stakeAmount + (PREDEFINED_STAKE_AMOUNT * 25) / 100;
            
            // Platform gets: 25% of challenger's stake
            platformAmount = (PREDEFINED_STAKE_AMOUNT * 25) / 100;
            
            // Resolver gets: 50% of challenger's stake
            resolverAmount = (PREDEFINED_STAKE_AMOUNT * 50) / 100;
        } else {
            winner = challenger;
            claim.status = Status.REJECTED;
            
            // Challenger gets: their own stake + 25% of claimant's stake
            winnerAmount = PREDEFINED_STAKE_AMOUNT + (claim.stakeAmount * 25) / 100;
            
            // Platform gets: 25% of claimant's stake
            platformAmount = (claim.stakeAmount * 25) / 100;
            
            // Resolver gets: 50% of claimant's stake
            resolverAmount = (claim.stakeAmount * 50) / 100;
        }

        // Distribute the stakes
        if (winnerAmount > 0) {
            (bool success1, ) = winner.call{value: winnerAmount}("");
            require(success1, "Winner transfer failed");
        }

        if (platformAmount > 0) {
            (bool success2, ) = owner.call{value: platformAmount}("");
            require(success2, "Platform transfer failed");
        }

        if (resolverAmount > 0) {
            (bool success3, ) = resolver.call{value: resolverAmount}("");
            require(success3, "Resolver transfer failed");
        }

        uint256 totalDistributed = winnerAmount + platformAmount + resolverAmount;
        emit ChallengeResolved(_claimId, claimantWon, winner, totalDistributed);
        emit StakeDistributed(_claimId, winner, winnerAmount, platformAmount, resolverAmount);
    }

