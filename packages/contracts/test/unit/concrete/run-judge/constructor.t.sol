// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Base_Test} from "test/Base.t.sol";
import {RunJudge} from "src/RunJudge.sol";
import {MockERC20} from "test/mocks/MockERC20.sol";
contract Constructor_RunJudge_Unit_Concrete_Test is Base_Test {
    function setUp() public override {
        // Don't call super.setUp() since we want to test constructor directly
        users = Users({
            admin: createUser("Admin"),
            agent: createUser("Agent"), 
            alice: createUser("Alice"),
            bob: createUser("Bob"),
            carol: createUser("Carol"),
            charlie: createUser("Charlie"),
            attacker: createUser("Attacker")
        });

        usdc = new MockERC20("USD Coin", "USDC", USDC_DECIMALS);
    }

    function test_RevertWhen_UsdcAddressIsZero() external {
        vm.startPrank(users.admin);
        vm.expectRevert(RunJudge.InvalidAddress.selector);
        new RunJudge(address(0), users.agent);
    }

    function test_RevertWhen_AgentAddressIsZero() external {
        vm.startPrank(users.admin);
        vm.expectRevert(RunJudge.InvalidAddress.selector);
        new RunJudge(address(usdc), address(0));
    }

    modifier whenAddressesAreValid() {
        _;
    }

    function test_WhenAddressesAreValid() external whenAddressesAreValid {
        vm.startPrank(users.admin);
        runJudge = new RunJudge(address(usdc), users.agent);

        assertEq(address(runJudge.usdc()), address(usdc), "USDC address should be set");
        assertEq(runJudge.agent(), users.agent, "Agent address should be set");
        assertEq(runJudge.owner(), users.admin, "Owner should be set to deployer");
    }
}
