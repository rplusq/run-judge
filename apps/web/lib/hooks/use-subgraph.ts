import { useQuery } from '@tanstack/react-query';
import {
  graphqlClient,
  GET_CHALLENGE,
  GET_USER_CHALLENGES,
  type Challenge,
  type UserChallenge,
} from '../graphql';

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const { challenge } = await graphqlClient.request<{
        challenge: Challenge;
      }>(GET_CHALLENGE, {
        id,
      });
      return challenge;
    },
  });
}

export function useUserChallenges(address: string | undefined) {
  return useQuery({
    queryKey: ['userChallenges', address],
    queryFn: async () => {
      if (!address) return [];
      const { participants } = await graphqlClient.request<{
        participants: UserChallenge[];
      }>(GET_USER_CHALLENGES, {
        address: address.toLowerCase(),
      });
      return participants;
    },
    enabled: !!address,
  });
}
