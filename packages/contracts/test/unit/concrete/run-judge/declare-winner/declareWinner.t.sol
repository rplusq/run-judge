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
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
        
        // Setup Alice as participant
        usdc.mint(users.alice, ENTRY_FEE);
        vm.startPrank(users.alice);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(challengeId);
        vm.stopPrank();
        
        // Warp to after start time and submit result
        vm.warp(startTime + 1);
        vm.prank(users.alice);
        runJudge.submitResult(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_CallerIsNotAgent() external {
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.OnlyAgent.selector);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    modifier whenCallerIsAgent() {
        vm.startPrank(users.agent);
        _;
    }

    function test_RevertWhen_ChallengeNotActive() external whenCallerIsAgent {
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
        
        vm.expectRevert(RunJudge.ChallengeNotActive.selector);
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_ActivityIdDoesNotMatchAnySubmission() external whenCallerIsAgent {
        vm.expectRevert(RunJudge.WinnerNotSubmitted.selector);
        runJudge.declareWinner(challengeId, INVALID_ACTIVITY_ID);
    }

    function test_RevertWhen_USDCTransferFails() external whenCallerIsAgent {
        // Make USDC transfer fail by removing all USDC from contract
        vm.stopPrank();
        vm.prank(address(runJudge));
        usdc.transfer(users.bob, ENTRY_FEE);
        vm.startPrank(users.agent);
        
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(runJudge), 0, ENTRY_FEE));
        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_WhenAllConditionsAreMet() external whenCallerIsAgent {
        uint256 aliceBalanceBefore = usdc.balanceOf(users.alice);

        // Verify event emission with activity ID
        vm.expectEmit({emitter: address(runJudge)});
        emit WinnerDeclared(challengeId, STRAVA_ACTIVITY_ID, users.alice, ENTRY_FEE);

        runJudge.declareWinner(challengeId, STRAVA_ACTIVITY_ID);

        // Verify challenge is marked as inactive
        (,,,bool isActive, address winner, uint256 totalPrize) = runJudge.challenges(challengeId);
        assertFalse(isActive, "Challenge should be inactive");
        assertEq(winner, users.alice, "Winner should be set based on activity ID");
        assertEq(totalPrize, ENTRY_FEE, "Total prize should be unchanged");

        // Verify activity owner received prize
        assertEq(usdc.balanceOf(users.alice), aliceBalanceBefore + ENTRY_FEE, "Activity owner should receive prize");
    }
} 