// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";

contract CreateChallenge_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC

    function setUp() public override {
        super.setUp();
    }

    function test_RevertWhen_StartTimeIsInPast() external {
        uint40 startTime = uint40(block.timestamp - 1);
        vm.expectRevert(RunJudge.StartTimeInPast.selector);
        runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
    }

    modifier whenStartTimeIsInFuture() {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        _;
    }

    function test_WhenStartTimeIsInFuture() external whenStartTimeIsInFuture {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        uint256 expectedChallengeId = runJudge.nextChallengeId();

        vm.expectEmit({emitter: address(runJudge)});
        emit ChallengeCreated({
            challengeId: expectedChallengeId,
            startTime: startTime,
            distance: DISTANCE,
            entryFee: ENTRY_FEE
        });

        runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);

        // Verify challenge was created with correct values
        (
            uint40 actualStartTime,
            uint32 actualDistance,
            uint256 actualEntryFee,
            bool isActive,
            address winner,
            uint256 totalPrize
        ) = runJudge.challenges(expectedChallengeId);

        assertEq(actualStartTime, startTime, "Start time should match");
        assertEq(actualDistance, DISTANCE, "Distance should match");
        assertEq(actualEntryFee, ENTRY_FEE, "Entry fee should match");
        assertTrue(isActive, "Challenge should be active");
        assertEq(winner, address(0), "Winner should be zero address");
        assertEq(totalPrize, 0, "Total prize should be zero");

        // Verify nextChallengeId was incremented
        assertEq(
            runJudge.nextChallengeId(),
            expectedChallengeId + 1,
            "Next challenge ID should increment"
        );
    }
}
