// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test} from "forge-std/Test.sol";
import {RunJudge} from "src/RunJudge.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {Events} from "./utils/Events.sol";

/// @notice Base test contract with common logic needed by all tests
abstract contract Base_Test is Test, Events {
    /*//////////////////////////////////////////////////////////////////////////
                                     VARIABLES
    //////////////////////////////////////////////////////////////////////////*/

    Users internal users;
    uint8 internal constant USDC_DECIMALS = 6;
    uint256 internal constant INITIAL_BALANCE = 1_000_000 * 10**USDC_DECIMALS;

    /*//////////////////////////////////////////////////////////////////////////
                                   TEST CONTRACTS
    //////////////////////////////////////////////////////////////////////////*/

    RunJudge internal runJudge;
    MockERC20 internal usdc;

    /*//////////////////////////////////////////////////////////////////////////
                                     STRUCTS
    //////////////////////////////////////////////////////////////////////////*/

    struct Users {
        address payable admin;
        address payable agent;
        address payable alice;
        address payable bob;
        address payable carol;
        address payable charlie;
        address payable attacker;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                  SET-UP FUNCTION
    //////////////////////////////////////////////////////////////////////////*/

    function setUp() public virtual {
        // Create users for testing
        users = Users({
            admin: createUser("Admin"),
            agent: createUser("Agent"),
            alice: createUser("Alice"),
            bob: createUser("Bob"),
            carol: createUser("Carol"),
            charlie: createUser("Charlie"),
            attacker: createUser("Attacker")
        });

        // Deploy mock USDC
        usdc = new MockERC20("USD Coin", "USDC", USDC_DECIMALS);

        // Deploy RunJudge
        vm.startPrank(users.admin);
        runJudge = new RunJudge(address(usdc), users.agent);
        vm.stopPrank();

        // Mint initial USDC to users and approve RunJudge
        mintUsdcAndApprove(users.alice);
        mintUsdcAndApprove(users.bob);
        mintUsdcAndApprove(users.carol);

    }

    /*//////////////////////////////////////////////////////////////////////////
                                      HELPERS
    //////////////////////////////////////////////////////////////////////////*/

    /// @dev Generates a user, labels its address, and funds it with test assets
    function createUser(string memory name) internal returns (address payable) {
        address payable user = payable(makeAddr(name));
        vm.deal({account: user, newBalance: 100 ether});
        vm.label({account: user, newLabel: name});
        return user;
    }

    /// @dev Mints initial USDC balance to a user and approves RunJudge to spend it
    function mintUsdcAndApprove(address user) internal {
        usdc.mint(user, INITIAL_BALANCE);
        vm.prank(user);
        usdc.approve(address(runJudge), type(uint256).max);
    }
}
