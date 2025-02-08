// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice A contract for managing running challenges with USDC stakes
contract RunJudge is Ownable {
    using SafeERC20 for IERC20;

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                         ERRORS                           */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    error OnlyAgent();
    error StartTimeInPast();
    error ChallengeNotActive();
    error ChallengeStarted();
    error AlreadyJoined();
    error USDCTransferFailed();
    error NotJoined();
    error AlreadySubmitted();
    error ChallengeNotStarted();
    error WinnerNotSubmitted();
    error PrizeTransferFailed();
    error NotSubmitted();
    error InvalidAddress();
    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                         STORAGE                           */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    IERC20 public usdc;
    address public agent;

    /// @notice Data for a running challenge
    struct Challenge {
        /// @dev When run starts
        uint40 startTime;
        /// @dev Distance in meters
        uint32 distance;
        /// @dev Entry fee in USDC
        uint256 entryFee;
        /// @dev Whether challenge is still active
        bool isActive;
        /// @dev Address of winner once declared
        address winner;
        /// @dev Total USDC staked
        uint256 totalPrize;
    }

    /// @notice Data for a challenge participant
    struct Participant {
        /// @dev Whether participant has joined challenge
        bool hasJoined;
        /// @dev Whether participant has submitted result
        bool hasSubmitted;
        /// @dev Strava activity URL for verification
        string stravaUrl;
    }

    /// @dev challengeId => Challenge
    mapping(uint256 challengeId => Challenge) public challenges;
    /// @dev challengeId => participant address => Participant
    mapping(uint256 challengeId => mapping(address participant => Participant)) public participants;
    /// @dev challengeId => participant addresses
    mapping(uint256 challengeId => address[]) public challengeParticipants;

    uint256 public nextChallengeId;

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                         EVENTS                            */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    event ChallengeCreated(uint256 indexed challengeId, uint40 startTime, uint32 distance, uint256 entryFee);
    event ChallengeJoined(uint256 indexed challengeId, address indexed participant);
    event ResultSubmitted(uint256 indexed challengeId, address indexed participant, string stravaUrl);
    event WinnerDeclared(uint256 indexed challengeId, address indexed winner, uint256 prize);
    event ParticipantSlashed(uint256 indexed challengeId, address indexed participant);

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                       CONSTRUCTOR                         */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
    /// @notice Initializes the contract with USDC token and agent addresses
    /// @param _usdc The USDC token contract address
    /// @param _agent The address authorized to declare winners and slash cheaters
    constructor(address _usdc, address _agent) Ownable(msg.sender) {
        if (_usdc == address(0)) revert InvalidAddress();
        if (_agent == address(0)) revert InvalidAddress();
        usdc = IERC20(_usdc);
        agent = _agent;
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                      MODIFIERS                           */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /// @notice Restricts function to agent only
    modifier onlyAgent() {
        if (msg.sender != agent) revert OnlyAgent();
        _;
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                    EXTERNAL FUNCTIONS                     */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /// @notice Creates a new running challenge
    /// @param startTime When the challenge starts
    /// @param distance Distance in meters
    /// @param entryFee Entry fee in USDC
    /// @return challengeId The ID of the created challenge
    function createChallenge(uint40 startTime, uint32 distance, uint256 entryFee) external returns (uint256) {
        if (startTime <= uint40(block.timestamp)) revert StartTimeInPast();
        
        uint256 challengeId = nextChallengeId++;
        challenges[challengeId] = Challenge({
            startTime: startTime,
            distance: distance,
            entryFee: entryFee,
            isActive: true,
            winner: address(0),
            totalPrize: 0
        });

        emit ChallengeCreated(challengeId, startTime, distance, entryFee);
        return challengeId;
    }

    /// @notice Join a challenge by staking USDC
    /// @param challengeId The ID of the challenge to join
    function joinChallenge(uint256 challengeId) external {
        Challenge storage challenge = challenges[challengeId];
        if (!challenge.isActive) revert ChallengeNotActive();
        if (block.timestamp >= challenge.startTime) revert ChallengeStarted();
        if (participants[challengeId][msg.sender].hasJoined) revert AlreadyJoined();

        usdc.safeTransferFrom(msg.sender, address(this), challenge.entryFee);
        
        participants[challengeId][msg.sender].hasJoined = true;
        challengeParticipants[challengeId].push(msg.sender);
        challenge.totalPrize += challenge.entryFee;

        emit ChallengeJoined(challengeId, msg.sender);
    }

    /// @notice Submit Strava activity URL as proof of completion
    /// @param challengeId The ID of the challenge
    /// @param stravaUrl URL of the Strava activity
    function submitResult(uint256 challengeId, string calldata stravaUrl) external {
        if (!participants[challengeId][msg.sender].hasJoined) revert NotJoined();
        if (participants[challengeId][msg.sender].hasSubmitted) revert AlreadySubmitted();
        if (block.timestamp <= challenges[challengeId].startTime) revert ChallengeNotStarted();

        participants[challengeId][msg.sender].hasSubmitted = true;
        participants[challengeId][msg.sender].stravaUrl = stravaUrl;

        emit ResultSubmitted(challengeId, msg.sender, stravaUrl);
    }

    /// @notice Declare winner and distribute prize
    /// @param challengeId The ID of the challenge
    /// @param winner Address of the winner
    function declareWinner(uint256 challengeId, address winner) external onlyAgent {
        Challenge storage challenge = challenges[challengeId];
        if (!challenge.isActive) revert ChallengeNotActive();
        if (!participants[challengeId][winner].hasSubmitted) revert WinnerNotSubmitted();

        challenge.isActive = false;
        challenge.winner = winner;

        usdc.safeTransfer(winner, challenge.totalPrize);

        emit WinnerDeclared(challengeId, winner, challenge.totalPrize);
    }

    /// @notice Slash a participant for cheating
    /// @param challengeId The ID of the challenge
    /// @param cheater Address of the cheating participant
    function slash(uint256 challengeId, address cheater) external onlyAgent {
        if (!participants[challengeId][cheater].hasSubmitted) revert NotSubmitted();
        
        participants[challengeId][cheater].hasSubmitted = false;
        emit ParticipantSlashed(challengeId, cheater);
    }

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                     ADMIN FUNCTIONS                       */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /// @notice Update the agent address
    /// @param _agent New agent address
    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
    }
}