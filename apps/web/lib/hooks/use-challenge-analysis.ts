import { useQuery } from '@tanstack/react-query';

async function getChallengeAnalysis(challengeId: string) {
  const response = await fetch(`/api/challenge/${challengeId}/analysis`);
  if (!response.ok) {
    throw new Error('Failed to fetch challenge analysis');
  }
  return response.json();
}

export function useChallengeAnalysis(challengeId: string) {
  return useQuery({
    queryKey: ['challenge-analysis', challengeId],
    queryFn: () => getChallengeAnalysis(challengeId),
    enabled: !!challengeId,
  });
}
