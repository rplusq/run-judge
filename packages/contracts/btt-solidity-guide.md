# Guide to Branching Tree Technique (BTT) for Solidity Testing

## Table of Contents

1. [Introduction to BTT](#introduction-to-btt)
2. [Steps to Implement BTT](#steps-to-implement-btt)
3. [Example: Implementing BTT for a Token Transfer Function](#example-implementing-btt-for-a-token-transfer-function)
4. [Benefits of BTT](#benefits-of-btt)
5. [Best Practices](#best-practices)
6. [Given vs When](#given-vs-when)
7. [Conclusion](#conclusion)

## Introduction to BTT

The Branching Tree Technique (BTT) is a structured approach to testing smart contracts in Solidity. It helps developers consider all possible execution paths and create comprehensive test cases. BTT is particularly useful for complex smart contracts where multiple conditions and state changes need to be tested thoroughly.

## Steps to Implement BTT

1. **Target a function**: Choose the Solidity function you want to test.
2. **Create a ".tree" file**: This file will contain the structure of your test cases.
3. **Consider all possible execution paths**: Think through every possible way the function could be executed.
4. **Consider what contract state leads to what paths**: Analyze how different contract states affect execution paths.
5. **Consider what function params lead to what paths**: Examine how different input parameters influence execution.
6. **Define "given state is x" nodes**: Specify the initial conditions for each test case.
7. **Define "when parameter is x" nodes**: Outline the input parameters for each scenario.
8. **Define final "it should" tests**: Describe the expected outcomes for each test case.

## Example: Implementing BTT for a Token Transfer Function

Let's apply BTT to a simple token transfer function:

```solidity
function transfer(address to, uint256 amount) public returns (bool) {
    if (balances[msg.sender] < amount) {
        return false;
    }

    if (to == address(0)) {
        return false;
    }

    balances[msg.sender] -= amount;
    balances[to] += amount;
    return true;
}
```

### Step 1: Create the transfer.tree file

It's important to use # for identation. On every branching, you should have one branch per state, for example: "when stake amount is zero" and "when stake amount is gt zero". Start the file with the function to test .t.sol

```
updateMinStakeAmount.t.sol
# when caller is not owner
## it should revert
# when caller is owner
## when new value is the same as the old value
### it should revert
## when new value is different from the old value
### it should set the new value
### it should emit a {MinStakeAmountUpdated} event
```

### Step 2: Implement Test Cases

Use modifiers to make the tests more readable on the branches that branch further.
Name the contract with function_contract_unit|integration|invariant_concrete|fuzz_test

```solidity
// SPDX-License-Identifier: MIT

import { Staking } from "src/Staking.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Base_Test } from "../../../../Base.t.sol";

pragma solidity >=0.8.25 <0.9.0;

contract UpdateMinStakeAmount_Staking_Unit_Concrete_Test is Base_Test {
    function setUp() public override {
        super.setUp();
        deployCoreConditionally();
    }

    function test_RevertWhen_CallerIsNotOwner() external {
        vm.startPrank(users.attacker);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, users.attacker));
        staking.updateMinStakeAmount(UINT256_MAX);
    }

    modifier whenCallerIsOwner() {
        vm.startPrank(users.admin);
        _;
    }

    function test_RevertWhen_NewMinStakeAmountIsSameAsOld() external whenCallerIsOwner {
        uint256 oldMinStakeAmount = staking.minStakeAmount();
        vm.expectRevert(Staking.UnchangedState.selector);
        staking.updateMinStakeAmount(oldMinStakeAmount);
    }

    function test_WhenNewMinStakeAmountIsDifferentFromOld() external whenCallerIsOwner {
        uint256 oldMinStakeAmount = staking.minStakeAmount();
        uint256 newMinStakeAmount = oldMinStakeAmount + 1;
        vm.expectEmit({ emitter: address(staking) });
        emit MinStakeAmountUpdated({ oldMinStakeAmount: oldMinStakeAmount, newMinStakeAmount: newMinStakeAmount });
        staking.updateMinStakeAmount(newMinStakeAmount);
        assertEq(staking.minStakeAmount(), newMinStakeAmount);
    }
}
```

## Benefits of BTT

1. **Plain English**: Easy to understand for both technical and non-technical team members.
2. **Easy to learn and teach**: Simple concept that can be quickly adopted.
3. **Doubles as a test structuring approach**: Provides a clear structure for organizing tests.
4. **Can be shared with non-technical team members**: Improves communication across the team.
5. **Potentially automatable**: The structured format can be used to generate test cases automatically.

## Best Practices

1. **Start with the happy path**: Begin by mapping out the expected successful execution path.
2. **Consider edge cases**: Think about boundary conditions and unexpected inputs.
3. **Use descriptive node names**: Make your `.tree` file easy to read and understand.
4. **Keep it DRY**: Use modifiers or helper functions to avoid repetitive setup code in your tests.
5. **Update the tree as you code**: As you implement or modify your contract, update your `.tree` file to reflect changes.

## Given vs When

This document serves as a quick reference to understand when to use "Given" or "When" based on different programming
scenarios.

###### Table of Decisions

| Scenario                                                                          | Answer |
| --------------------------------------------------------------------------------- | ------ |
| Is it a contract state that is prepared in advance?                               | Given  |
| Is it a mode of execution, e.g., call vs delegatecall?                            | When   |
| Is it a function parameter that the user is in control when calling the function? | When   |

## Conclusion

The Branching Tree Technique offers a systematic approach to testing Solidity smart contracts. By considering all possible execution paths, contract states, and function parameters, developers can create more comprehensive and reliable test suites. The `.tree` file serves as a clear, readable representation of test cases, making it easier to collaborate with team members and ensure thorough coverage of the smart contract's functionality.

Remember, while BTT is a powerful tool, it should be used in conjunction with other testing methodologies and best practices in smart contract development to ensure the highest level of security and reliability.
