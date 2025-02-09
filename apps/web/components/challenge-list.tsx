'use client';

import { useAccount } from 'wagmi';
import { useUserChallenges } from '@/lib/hooks/use-subgraph';
import { ChallengeCard } from '@/components/challenge-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WalletConnect } from '@/components/wallet-connect';

export function ChallengeList() {
  const { address } = useAccount();
  const { data: challenges, isLoading } = useUserChallenges(address);

  if (!address) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">Connect Wallet</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connect your wallet to view your challenges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletConnect />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!challenges?.length) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">No Challenges</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            You haven&apos;t joined any challenges yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.challenge.id}
          startTime={challenge.challenge.startTime}
          distance={challenge.challenge.distance}
          entryFee={challenge.challenge.entryFee}
          participants={0} // TODO: Get from subgraph
          status={
            challenge.challenge.winner
              ? 'completed'
              : new Date(parseInt(challenge.challenge.startTime) * 1000) >
                  new Date()
                ? 'open'
                : 'active'
          }
          winner={challenge.challenge.winner || undefined}
        />
      ))}
    </div>
  );
}
