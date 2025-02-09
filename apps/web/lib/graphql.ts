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
  winner: string | null;
  totalPrize: string;
  participants: {
    address: string;
    hasSubmitted: boolean;
    stravaActivityId: string | null;
  }[];
};

export type UserChallenge = {
  challenge: {
    id: string;
    startTime: string;
    distance: string;
    entryFee: string;
    isActive: boolean;
    winner: string | null;
    totalPrize: string;
    participants: {
      address: string;
      hasSubmitted: boolean;
      stravaActivityId: string | null;
    }[];
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
      winner
      totalPrize
      participants {
        address
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
        winner
        participants {
          hasSubmitted
          stravaActivityId
        }
      }
      hasSubmitted
      stravaActivityId
    }
  }
`;
