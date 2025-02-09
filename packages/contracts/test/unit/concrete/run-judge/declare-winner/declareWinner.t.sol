// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract DeclareWinner_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;
    uint256 constant STRAVA_ACTIVITY_ID = 13550360546;
    uint256 constant INVALID_ACTIVITY_ID = 99999999999;

    function setUp() public override {
        super.setUp();
        startTime = uint40(block.timestamp + 1 hours);
        
        // Setup creator (Bob) and Alice as participants
        vm.prank(users.bob);
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
        
        // Setup Alice as participant
        usdc.mint(users.alice, ENTRY_FEE);
        vm.startPrank(users.alice);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(challengeId);
        vm.stopPrank();
        
        // Warp to after start time and submit result for Alice
        vm.warp(startTime + 1);
        vm.prank(users.alice);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);

        // Submit result for creator (Bob)
        vm.prank(users.bob);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID + 1);
    }

    function test_RevertWhen_CallerIsNotAgent() external {
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.OnlyAgent.selector);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    modifier whenCallerIsAgent() {
        _;
    }

    function test_RevertWhen_ChallengeNotActive() external whenCallerIsAgent {
        vm.startPrank(users.agent);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
        
        vm.expectRevert(RunJudge.ChallengeNotActive.selector);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_ChallengeIsCancelled() external whenCallerIsAgent {
        // Create a new challenge that only Bob joins
        vm.prank(users.bob);
        uint256 newChallengeId = runJudge.createChallenge(startTime + 2 hours, DISTANCE, ENTRY_FEE);

        // Have creator (Bob) cancel the challenge
        vm.prank(users.bob);
        runJudge.cancelChallenge(newChallengeId);

        // Try to declare winner on cancelled challenge
        vm.expectRevert(RunJudge.ChallengeNotActive.selector);
        vm.prank(users.agent);
        runJudge.declareWinner(newChallengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_ActivityIdDoesNotMatchAnySubmission() external whenCallerIsAgent {
        vm.expectRevert(RunJudge.WinnerNotSubmitted.selector);
        vm.prank(users.agent);
        runJudge.declareWinner(challengeId, INVALID_ACTIVITY_ID);
    }

    function test_RevertWhen_NotAllParticipantsHaveSubmitted() external whenCallerIsAgent {
        // Create a new challenge with Alice and Bob
        vm.prank(users.bob);
        uint256 newChallengeId = runJudge.createChallenge(startTime + 2 hours, DISTANCE, ENTRY_FEE);
        
        // Have Alice join and submit
        usdc.mint(users.alice, ENTRY_FEE);
        vm.startPrank(users.alice);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(newChallengeId);
        vm.warp(startTime + 2 hours + 1);
        runJudge.submitActivity(newChallengeId, STRAVA_ACTIVITY_ID);
        vm.stopPrank();

        vm.expectRevert(RunJudge.ParticipantsNotSubmitted.selector);
        vm.prank(users.agent);
        runJudge.declareWinner(newChallengeId, STRAVA_ACTIVITY_ID);
    }

    function test_WhenMultipleParticipantsHaveSameActivityId() external whenCallerIsAgent {
        // Create a new challenge with Alice and Bob
        vm.prank(users.bob);
        uint256 newChallengeId = runJudge.createChallenge(startTime + 2 hours, DISTANCE, ENTRY_FEE);
        
        // Have Alice join and submit
        usdc.mint(users.alice, ENTRY_FEE);
        vm.startPrank(users.alice);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(newChallengeId);
        vm.warp(startTime + 2 hours + 1);
        runJudge.submitActivity(newChallengeId, STRAVA_ACTIVITY_ID);
        vm.stopPrank();

        // Submit same activity ID for creator (Bob)
        vm.prank(users.bob);
        runJudge.submitActivity(newChallengeId, STRAVA_ACTIVITY_ID);

        // Declare winner - should pick first submitter (Alice)
        vm.prank(users.agent);
        runJudge.declareWinner(newChallengeId, STRAVA_ACTIVITY_ID);

        (,,,, address winner,,) = runJudge.challenges(newChallengeId);
        assertEq(winner, users.bob, "First participant in array should be winner");
    }

    function test_RevertWhen_USDCTransferFails() external whenCallerIsAgent {
        // Make USDC transfer fail by removing all USDC from contract
        vm.prank(address(runJudge));
        usdc.transfer(users.carol, ENTRY_FEE * 2);
        
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(runJudge), 0, ENTRY_FEE * 2));
        vm.prank(users.agent);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_WhenAllConditionsAreMet() external whenCallerIsAgent {
        uint256 aliceBalanceBefore = usdc.balanceOf(users.alice);
        uint256 expectedPrize = ENTRY_FEE * 2; // Alice + Creator

        // Verify event emission with activity ID
        vm.expectEmit({emitter: address(runJudge)});
        emit WinnerDeclared(challengeId, STRAVA_ACTIVITY_ID, users.alice, expectedPrize);

        vm.prank(users.agent);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);

        // Verify challenge is marked as inactive
        (,,,bool isActive, address winner, uint256 totalPrize,) = runJudge.challenges(challengeId);
        assertFalse(isActive, "Challenge should be inactive");
        assertEq(winner, users.alice, "Winner should be set based on activity ID");
        assertEq(totalPrize, expectedPrize, "Total prize should be unchanged");

        // Verify activity owner received prize
        assertEq(usdc.balanceOf(users.alice), aliceBalanceBefore + expectedPrize, "Activity owner should receive prize");
    }
} 