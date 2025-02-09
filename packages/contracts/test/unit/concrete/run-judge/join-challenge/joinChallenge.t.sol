// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract JoinChallenge_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;
    uint256 constant STRAVA_ACTIVITY_ID = 13550360546;

    function setUp() public override {
        super.setUp();
        startTime = uint40(block.timestamp + 1 hours);
        vm.prank(users.alice);
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
    }

    function test_RevertWhen_ChallengeNotActive() external {
        // First make challenge inactive by having agent declare a winner
        vm.startPrank(users.bob);
        runJudge.joinChallenge(challengeId);
        vm.warp(startTime + 1);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);
        vm.stopPrank();

        // Have Alice submit
        vm.prank(users.alice);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID + 1);
        
        // Declare winner to make challenge inactive
        vm.prank(users.agent);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
        
        // Try to join inactive challenge
        usdc.mint(users.charlie, ENTRY_FEE);
        vm.startPrank(users.charlie);
        usdc.approve(address(runJudge), ENTRY_FEE);
        vm.expectRevert(RunJudge.ChallengeNotActive.selector);
        runJudge.joinChallenge(challengeId);
        vm.stopPrank();
    }

    function test_RevertWhen_ChallengeStarted() external {
        vm.warp(startTime + 1);
        
        vm.prank(users.bob);
        vm.expectRevert(RunJudge.ChallengeStarted.selector);
        runJudge.joinChallenge(challengeId);
    }

    function test_RevertWhen_ChallengeIsCancelled() external {
        // Cancel the challenge
        vm.prank(users.alice);
        runJudge.cancelChallenge(challengeId);
        
        // Try to join cancelled challenge
        vm.prank(users.bob);
        vm.expectRevert(RunJudge.ChallengeNotActive.selector);
        runJudge.joinChallenge(challengeId);
    }

    function test_RevertWhen_AlreadyJoined() external {
        vm.expectRevert(RunJudge.AlreadyJoined.selector);
        vm.prank(users.alice);
        runJudge.joinChallenge(challengeId);
    }

    function test_RevertWhen_USDCTransferFails() external {
        vm.startPrank(users.bob);
        usdc.approve(address(runJudge), 0); // Remove approval
        
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, address(runJudge), 0, ENTRY_FEE));
        runJudge.joinChallenge(challengeId);
    }

    function test_WhenAllConditionsAreMet() external {
        // Verify event emission
        vm.expectEmit({emitter: address(runJudge)});
        emit ChallengeJoined(challengeId, users.bob);

        vm.prank(users.bob);
        runJudge.joinChallenge(challengeId);

        // Verify participant is marked as joined
        (bool hasJoined,,) = runJudge.participants(challengeId, users.bob);
        assertTrue(hasJoined, "Participant should be marked as joined");

        // Verify participant is added to challengeParticipants array
        address participant = runJudge.challengeParticipants(challengeId, 1); // Index 1 since creator is at 0
        assertEq(participant, users.bob, "Participant should be added to array");

        // Verify challenge totalPrize is increased
        (,,,,, uint256 totalPrize, uint8 participantCount) = runJudge.challenges(challengeId);
        assertEq(totalPrize, ENTRY_FEE * participantCount, "Total prize should be increased by entry fee");
    }
} 