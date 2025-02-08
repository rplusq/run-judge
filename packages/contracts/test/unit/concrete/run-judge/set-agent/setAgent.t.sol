// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SetAgent_RunJudge_Unit_Concrete_Test is Base_Test {
    function setUp() public override {
        super.setUp();
    }

    function test_RevertWhen_CallerIsNotOwner() external {
        vm.prank(users.alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, users.alice));
        runJudge.setAgent(users.bob);
    }

    function test_WhenCallerIsOwner() external {
        vm.prank(users.admin);
        runJudge.setAgent(users.bob);
        assertEq(runJudge.agent(), users.bob, "Agent should be updated");
    }
} 