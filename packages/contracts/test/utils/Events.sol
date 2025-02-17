// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

/// @notice Abstract contract containing all the events emitted.
abstract contract Events {
    /*//////////////////////////////////////////////////////////////////////////
                                     RunJudge Events
    //////////////////////////////////////////////////////////////////////////*/

    event ChallengeCreated(uint256 indexed challengeId, uint40 startTime, uint32 distance, uint256 entryFee);
    event ChallengeJoined(uint256 indexed challengeId, address indexed participant);
    event ActivitySubmitted(uint256 indexed challengeId, address indexed participant, uint256 stravaActivityId);
    event WinnerDeclared(uint256 indexed challengeId, uint256 indexed stravaActivityId, address winner, uint256 prize);
    event ChallengeCancelled(uint256 indexed challengeId, address indexed creator, uint256 refundAmount);


    /*//////////////////////////////////////////////////////////////////////////
                                     ERC20 Events
    //////////////////////////////////////////////////////////////////////////*/

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
