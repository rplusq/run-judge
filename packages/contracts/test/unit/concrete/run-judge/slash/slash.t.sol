// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";

contract Slash_RunJudge_Unit_Concrete_Test is Base_Test {
    uint32 constant DISTANCE = 5_000; // 5km in meters
    uint256 constant ENTRY_FEE = 10e6; // 10 USDC
    uint256 challengeId;
    uint40 startTime;
    string constant STRAVA_URL = "https://strava.com/activities/123";

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
        runJudge.submitResult(challengeId, STRAVA_URL);
    }

    function test_RevertWhen_CallerIsNotAgent() external {
        vm.prank(users.alice);
        vm.expectRevert(RunJudge.OnlyAgent.selector);
        runJudge.slash(challengeId, users.alice);
    }

    modifier whenCallerIsAgent() {
        vm.startPrank(users.agent);
        _;
    }

    function test_RevertWhen_ParticipantHasNotSubmitted() external whenCallerIsAgent {
        vm.expectRevert(RunJudge.NotSubmitted.selector);
        runJudge.slash(challengeId, users.bob);
    }

    function test_WhenAllConditionsAreMet() external whenCallerIsAgent {
        // Verify event emission
        vm.expectEmit({emitter: address(runJudge)});
        emit ParticipantSlashed(challengeId, users.alice);

        runJudge.slash(challengeId, users.alice);

        // Verify participant is marked as not submitted
        (bool hasJoined, bool hasSubmitted, string memory stravaUrl) = runJudge.participants(challengeId, users.alice);
        assertTrue(hasJoined, "Participant should still be marked as joined");
        assertFalse(hasSubmitted, "Participant should be marked as not submitted");
        assertEq(stravaUrl, STRAVA_URL, "Strava URL should remain unchanged");
    }
} 