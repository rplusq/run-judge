import { BigInt } from '@graphprotocol/graph-ts';
import {
  ChallengeCreated,
  ChallengeJoined,
  ResultSubmitted,
  WinnerDeclared,
  ParticipantSlashed,
} from '../generated/RunJudge/RunJudge';
import { Challenge, Participant } from '../generated/schema';

export function handleChallengeCreated(event: ChallengeCreated): void {
  const challenge = new Challenge(event.params.challengeId.toString());
  challenge.startTime = event.params.startTime;
  challenge.distance = event.params.distance;
  challenge.entryFee = event.params.entryFee;
  challenge.isActive = true;
  challenge.totalPrize = BigInt.fromI32(0);
  challenge.createdAt = event.block.timestamp;
  challenge.save();
}

export function handleChallengeJoined(event: ChallengeJoined): void {
  const id =
    event.params.challengeId.toString() +
    '-' +
    event.params.participant.toHexString();
  let participant = new Participant(id);
  participant.challenge = event.params.challengeId.toString();
  participant.participant = event.params.participant;
  participant.hasJoined = true;
  participant.hasSubmitted = false;
  participant.isWinner = false;
  participant.joinedAt = event.block.timestamp;
  participant.save();

  // Update challenge total prize
  const challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge.totalPrize = challenge.totalPrize.plus(challenge.entryFee);
    challenge.save();
  }
}

export function handleResultSubmitted(event: ResultSubmitted): void {
  const id =
    event.params.challengeId.toString() +
    '-' +
    event.params.participant.toHexString();
  let participant = Participant.load(id);
  if (participant) {
    participant.hasSubmitted = true;
    participant.stravaActivityId = event.params.stravaActivityId;
    participant.submittedAt = event.block.timestamp;
    participant.save();
  }
}

export function handleWinnerDeclared(event: WinnerDeclared): void {
  const challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge.isActive = false;
    challenge.winner = event.params.winner;
    challenge.save();
  }

  const id =
    event.params.challengeId.toString() +
    '-' +
    event.params.winner.toHexString();
  let participant = Participant.load(id);
  if (participant) {
    participant.isWinner = true;
    participant.save();
  }
}

export function handleParticipantSlashed(event: ParticipantSlashed): void {
  const id =
    event.params.challengeId.toString() +
    '-' +
    event.params.participant.toHexString();
  let participant = Participant.load(id);
  if (participant) {
    participant.hasSubmitted = false;
    participant.save();
  }
}
