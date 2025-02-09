// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";

contract CancelChallenge_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;

    function setUp() public override {
        super.setUp();
        startTime = uint40(block.timestamp + 1 hours);
        vm.prank(users.alice);
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
    }

    function test_RevertWhen_CallerIsNotChallengeCreator() external {
        vm.prank(users.bob);
        vm.expectRevert(RunJudge.NotChallengeCreator.selector);
        runJudge.cancelChallenge(challengeId);
    }

    function test_RevertWhen_ChallengeHasMoreThanOneParticipant() external {
        // Have Bob join the challenge
        vm.startPrank(users.bob);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(challengeId);
        vm.stopPrank();

        // Try to cancel with two participants
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.ChallengeFull.selector);
        runJudge.cancelChallenge(challengeId);
    }

    function test_WhenAllConditionsAreMet() external {
        // Get initial state
        (,,,,, uint256 initialTotalPrize,) = runJudge.challenges(challengeId);
        
        // Verify event emission
        vm.expectEmit({emitter: address(runJudge)});
        emit ChallengeCancelled(challengeId, users.alice, initialTotalPrize);

        // Balance before
        uint256 aliceBalanceBefore = usdc.balanceOf(users.alice);
        uint256 runJudgeBalanceBefore = usdc.balanceOf(address(runJudge));

        // Cancel challenge
        vm.prank(users.alice);
        runJudge.cancelChallenge(challengeId);

        // Verify challenge is inactive
        (,,,bool isActive,,uint256 totalPrize,) = runJudge.challenges(challengeId);
        assertFalse(isActive, "Challenge should be inactive");
        assertEq(totalPrize, 0, "Total prize should be zero");

        // Verify USDC balance is updated
        assertEq(usdc.balanceOf(users.alice), aliceBalanceBefore + initialTotalPrize, "Creator should receive refund");
        assertEq(usdc.balanceOf(address(runJudge)), runJudgeBalanceBefore - initialTotalPrize, "Contract should have no USDC left");
    }
} 