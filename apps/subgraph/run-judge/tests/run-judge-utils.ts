import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ChallengeCreated,
  ChallengeJoined,
  OwnershipTransferred,
  ParticipantSlashed,
  ResultSubmitted,
  WinnerDeclared
} from "../generated/RunJudge/RunJudge"

export function createChallengeCreatedEvent(
  challengeId: BigInt,
  startTime: BigInt,
  distance: BigInt,
  entryFee: BigInt
): ChallengeCreated {
  let challengeCreatedEvent = changetype<ChallengeCreated>(newMockEvent())

  challengeCreatedEvent.parameters = new Array()

  challengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  challengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  challengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "distance",
      ethereum.Value.fromUnsignedBigInt(distance)
    )
  )
  challengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "entryFee",
      ethereum.Value.fromUnsignedBigInt(entryFee)
    )
  )

  return challengeCreatedEvent
}

export function createChallengeJoinedEvent(
  challengeId: BigInt,
  participant: Address
): ChallengeJoined {
  let challengeJoinedEvent = changetype<ChallengeJoined>(newMockEvent())

  challengeJoinedEvent.parameters = new Array()

  challengeJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  challengeJoinedEvent.parameters.push(
    new ethereum.EventParam(
      "participant",
      ethereum.Value.fromAddress(participant)
    )
  )

  return challengeJoinedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createParticipantSlashedEvent(
  challengeId: BigInt,
  participant: Address
): ParticipantSlashed {
  let participantSlashedEvent = changetype<ParticipantSlashed>(newMockEvent())

  participantSlashedEvent.parameters = new Array()

  participantSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  participantSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "participant",
      ethereum.Value.fromAddress(participant)
    )
  )

  return participantSlashedEvent
}

export function createResultSubmittedEvent(
  challengeId: BigInt,
  participant: Address,
  stravaActivityId: BigInt
): ResultSubmitted {
  let resultSubmittedEvent = changetype<ResultSubmitted>(newMockEvent())

  resultSubmittedEvent.parameters = new Array()

  resultSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  resultSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "participant",
      ethereum.Value.fromAddress(participant)
    )
  )
  resultSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "stravaActivityId",
      ethereum.Value.fromUnsignedBigInt(stravaActivityId)
    )
  )

  return resultSubmittedEvent
}

export function createWinnerDeclaredEvent(
  challengeId: BigInt,
  winner: Address,
  prize: BigInt
): WinnerDeclared {
  let winnerDeclaredEvent = changetype<WinnerDeclared>(newMockEvent())

  winnerDeclaredEvent.parameters = new Array()

  winnerDeclaredEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  winnerDeclaredEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  winnerDeclaredEvent.parameters.push(
    new ethereum.EventParam("prize", ethereum.Value.fromUnsignedBigInt(prize))
  )

  return winnerDeclaredEvent
}
