import { GraphQLClient } from 'graphql-request';

export const SUBGRAPH_URL =
  'https://api.studio.thegraph.com/query/103746/run-judge/version/latest';

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
  query GetUserChallenges($address: String!) {
    participants(where: { address: $address }) {
      challenge {
        id
        startTime
        distance
        entryFee
        isActive
        winner
      }
      hasSubmitted
      stravaActivityId
    }
  }
`;
