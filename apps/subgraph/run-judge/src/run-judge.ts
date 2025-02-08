import {
  ChallengeCreated as ChallengeCreatedEvent,
  ChallengeJoined as ChallengeJoinedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ParticipantSlashed as ParticipantSlashedEvent,
  ResultSubmitted as ResultSubmittedEvent,
  WinnerDeclared as WinnerDeclaredEvent
} from "../generated/RunJudge/RunJudge"
import {
  ChallengeCreated,
  ChallengeJoined,
  OwnershipTransferred,
  ParticipantSlashed,
  ResultSubmitted,
  WinnerDeclared
} from "../generated/schema"

export function handleChallengeCreated(event: ChallengeCreatedEvent): void {
  let entity = new ChallengeCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.startTime = event.params.startTime
  entity.distance = event.params.distance
  entity.entryFee = event.params.entryFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleChallengeJoined(event: ChallengeJoinedEvent): void {
  let entity = new ChallengeJoined(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.participant = event.params.participant

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleParticipantSlashed(event: ParticipantSlashedEvent): void {
  let entity = new ParticipantSlashed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.participant = event.params.participant

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResultSubmitted(event: ResultSubmittedEvent): void {
  let entity = new ResultSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.participant = event.params.participant
  entity.stravaActivityId = event.params.stravaActivityId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWinnerDeclared(event: WinnerDeclaredEvent): void {
  let entity = new WinnerDeclared(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.winner = event.params.winner
  entity.prize = event.params.prize

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
