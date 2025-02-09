// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract CreateChallenge_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC


    function test_RevertWhen_StartTimeIsInPast() external {
        uint40 startTime = uint40(block.timestamp - 1);
        vm.expectRevert(RunJudge.StartTimeInPast.selector);
        vm.prank(users.alice);
        runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
    }

    function test_RevertWhen_DistanceIsZero() external {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        vm.expectRevert(RunJudge.InvalidDistance.selector);
        vm.prank(users.alice);
        runJudge.createChallenge(startTime, 0, ENTRY_FEE);
    }

    function test_RevertWhen_EntryFeeIsMaxUint() external {
        uint256 uint256Max = type(uint256).max;
        uint40 startTime = uint40(block.timestamp + 1 hours);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(users.alice), INITIAL_BALANCE, uint256Max));
        vm.prank(users.alice);
        runJudge.createChallenge(startTime, DISTANCE, uint256Max);
    }

    modifier whenStartTimeIsInFuture() {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        _;
    }

    function test_RevertWhen_EntryFeeIsZero() external whenStartTimeIsInFuture {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        vm.expectRevert(RunJudge.InvalidEntryFee.selector);
        vm.prank(users.alice);
        runJudge.createChallenge(startTime, DISTANCE, 0);
    }

    function test_WhenAllValuesAreValid() external whenStartTimeIsInFuture {
        uint40 startTime = uint40(block.timestamp + 1 hours);
        uint256 expectedChallengeId = runJudge.nextChallengeId();

        vm.expectEmit({emitter: address(runJudge)});
        emit ChallengeCreated({
            challengeId: expectedChallengeId,
            startTime: startTime,
            distance: DISTANCE,
            entryFee: ENTRY_FEE
        });

        vm.expectEmit({emitter: address(runJudge)});
        emit ChallengeJoined({
            challengeId: expectedChallengeId,
            participant: users.alice
        });

        vm.prank(users.alice);
        runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);

        // Verify challenge was created with correct values
        (
            uint40 actualStartTime,
            uint32 actualDistance,
            uint256 actualEntryFee,
            bool isActive,
            address winner,
            uint256 totalPrize,
            uint8 participantCount
        ) = runJudge.challenges(expectedChallengeId);

        assertEq(actualStartTime, startTime, "Start time should match");
        assertEq(actualDistance, DISTANCE, "Distance should match");
        assertEq(actualEntryFee, ENTRY_FEE, "Entry fee should match");
        assertTrue(isActive, "Challenge should be active");
        assertEq(winner, address(0), "Winner should be zero address");
        assertEq(totalPrize, ENTRY_FEE, "Total prize should be entry fee");
        assertEq(participantCount, 1, "Participant count should be 1");
        
        // Verify nextChallengeId was incremented
        assertEq(
            runJudge.nextChallengeId(),
            expectedChallengeId + 1,
            "Next challenge ID should increment"
        );

        // Verify creator was added as participant
        (bool hasJoined,,) = runJudge.participants(expectedChallengeId, users.alice);
        assertTrue(hasJoined, "Creator should be marked as joined");
        assertEq(runJudge.challengeParticipants(expectedChallengeId, 0), users.alice, "Creator should be in participants array");
    }
}
