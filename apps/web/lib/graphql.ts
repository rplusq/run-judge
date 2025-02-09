import { GraphQLClient } from 'graphql-request';

export const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

if (!SUBGRAPH_URL) {
  throw new Error('NEXT_PUBLIC_SUBGRAPH_URL is not set');
}

export const graphqlClient = new GraphQLClient(SUBGRAPH_URL);

export type Challenge = {
  id: string;
  startTime: string;
  distance: string;
  entryFee: string;
  isActive: boolean;
  isCancelled: boolean;
  winner: string | null;
  totalPrize: string;
  participantsLength: string;
  participants: {
    participant: string;
    hasSubmitted: boolean;
    stravaActivityId: string | null;
  }[];
  cancelledAt: string | null;
};

export type UserChallenge = {
  challenge: {
    id: string;
    startTime: string;
    distance: string;
    entryFee: string;
    isActive: boolean;
    isCancelled: boolean;
    winner: string | null;
    totalPrize: string;
    participantsLength: string;
    participants: {
      participant: string;
      hasSubmitted: boolean;
      stravaActivityId: string | null;
    }[];
    cancelledAt: string | null;
  };
  hasSubmitted: boolean;
  stravaActivityId: string | null;
};

export const GET_CHALLENGE = `
  query GetChallenge($id: ID!) {
    challenge(id: $id) {
      id
      startTime
      distance
      entryFee
      isActive
      isCancelled
      winner
      totalPrize
      participantsLength
      cancelledAt
      participants {
        participant
        hasSubmitted
        stravaActivityId
      }
    }
  }
`;

export const GET_USER_CHALLENGES = `
  query GetUserChallenges($addresses: [Bytes!]) {
    participants(where: { participant_in: $addresses }) {
      challenge {
        id
        startTime
        distance
        entryFee
        isActive
        isCancelled
        winner
        cancelledAt
        participantsLength
        participants {
          participant
          hasSubmitted
          stravaActivityId
        }
      }
      hasSubmitted
      stravaActivityId
    }
  }
`;

export const GET_AVAILABLE_CHALLENGES = `
  query GetAvailableChallenges($address: Bytes!) {
    challenges(
      where: {
        isCancelled: false,
        winner: null,
        participantsLength: "1",
        participants_: {
          participant_not: $address
        }
      }
      orderBy: startTime
      orderDirection: desc
    ) {
      id
      startTime
      distance
      entryFee
      isActive
      isCancelled
      winner
      totalPrize
      participantsLength
      participants {
        participant
        hasSubmitted
        stravaActivityId
      }
    }
  }
`;
