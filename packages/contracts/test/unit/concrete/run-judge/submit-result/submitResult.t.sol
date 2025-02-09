// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";

contract submitActivity_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;
    uint256 constant STRAVA_ACTIVITY_ID = 13550360546;

    function setUp() public override {
        super.setUp();
        startTime = uint40(block.timestamp + 1 hours);
        vm.prank(users.bob);
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
        vm.prank(users.alice);
        runJudge.joinChallenge(challengeId);
    }

    function test_RevertWhen_ParticipantHasNotJoined() external {
        vm.warp(startTime + 1);
        vm.prank(users.carol);
        vm.expectRevert(RunJudge.NotJoined.selector);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_ParticipantHasAlreadySubmitted() external {
        vm.warp(startTime + 1);
        vm.startPrank(users.alice);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);
        
        vm.expectRevert(RunJudge.AlreadySubmitted.selector);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);
        vm.stopPrank();
    }

    function test_RevertWhen_ChallengeHasNotStarted() external {
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.ChallengeNotStarted.selector);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);
    }

    function test_RevertWhen_StravaActivityIdIsZero() external {
        vm.warp(startTime + 1);
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.InvalidActivityId.selector);
        runJudge.submitActivity(challengeId, 0);
    }

    function test_WhenAllConditionsAreMet() external {
        vm.warp(startTime + 1);

        // Verify event emission
        vm.expectEmit({emitter: address(runJudge)});
        emit ActivitySubmitted(challengeId, users.alice, STRAVA_ACTIVITY_ID);

        vm.prank(users.alice);
        runJudge.submitActivity(challengeId, STRAVA_ACTIVITY_ID);

        // Verify participant is marked as submitted
        (bool hasJoined, bool hasSubmitted, uint256 stravaActivityId) = runJudge.participants(challengeId, users.alice);
        assertTrue(hasJoined, "Participant should be marked as joined");
        assertTrue(hasSubmitted, "Participant should be marked as submitted");
        assertEq(stravaActivityId, STRAVA_ACTIVITY_ID, "Strava activity ID should be stored");
    }
} 