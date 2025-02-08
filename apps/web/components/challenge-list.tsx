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
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function ChallengeList() {
  const { address } = useAccount();
  const { data: challenges, isLoading } = useUserChallenges(address);

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to view your challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectWallet />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!challenges?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Challenges</CardTitle>
          <CardDescription>
            You haven't joined any challenges yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
