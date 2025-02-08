// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";

contract SubmitResult_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;
    string constant STRAVA_URL = "https://strava.com/activities/123";

    function setUp() public override {
        super.setUp();
        startTime = uint40(block.timestamp + 1 hours);
        challengeId = runJudge.createChallenge(startTime, DISTANCE, ENTRY_FEE);
        usdc.mint(users.alice, ENTRY_FEE);
        vm.startPrank(users.alice);
        usdc.approve(address(runJudge), ENTRY_FEE);
        runJudge.joinChallenge(challengeId);
        vm.stopPrank();
    }

    function test_RevertWhen_ParticipantHasNotJoined() external {
        vm.warp(startTime + 1);
        vm.prank(users.bob);
        vm.expectRevert(RunJudge.NotJoined.selector);
        runJudge.submitResult(challengeId, STRAVA_URL);
    }

    function test_RevertWhen_ParticipantHasAlreadySubmitted() external {
        vm.warp(startTime + 1);
        vm.startPrank(users.alice);
        runJudge.submitResult(challengeId, STRAVA_URL);
        
        vm.expectRevert(RunJudge.AlreadySubmitted.selector);
        runJudge.submitResult(challengeId, STRAVA_URL);
        vm.stopPrank();
    }

    function test_RevertWhen_ChallengeHasNotStarted() external {
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.ChallengeNotStarted.selector);
        runJudge.submitResult(challengeId, STRAVA_URL);
    }

    function test_WhenAllConditionsAreMet() external {
        vm.warp(startTime + 1);

        // Verify event emission
        vm.expectEmit({emitter: address(runJudge)});
        emit ResultSubmitted(challengeId, users.alice, STRAVA_URL);

        vm.prank(users.alice);
        runJudge.submitResult(challengeId, STRAVA_URL);

        // Verify participant is marked as submitted
        (bool hasJoined, bool hasSubmitted, string memory stravaUrl) = runJudge.participants(challengeId, users.alice);
        assertTrue(hasJoined, "Participant should be marked as joined");
        assertTrue(hasSubmitted, "Participant should be marked as submitted");
        assertEq(stravaUrl, STRAVA_URL, "Strava URL should be stored");
    }
} 