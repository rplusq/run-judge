'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useChallenge as useSubgraphChallenge } from '@/lib/hooks/use-subgraph';
import { useChallenge as useContractChallenge } from '@/lib/hooks/use-run-judge';
import { useSubmitResult } from '@/lib/hooks/use-run-judge';
import { WalletButton } from '@/components/wallet-button';
import { JoinChallengeButton } from '@/components/join-challenge-button';
import { useAccount } from 'wagmi';

interface ChallengeDetailsProps {
  challengeId: string;
}

export function ChallengeDetails({ challengeId }: ChallengeDetailsProps) {
  const { address } = useAccount();
  const { data: challenge } = useSubgraphChallenge(challengeId);
  const { data: contractChallenge } = useContractChallenge(BigInt(challengeId));
  const { submitResult, isPending: isSubmitting } = useSubmitResult();

  const [stravaActivityId, setStravaActivityId] = useState('');

  if (!challenge || !contractChallenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const startTime = new Date(parseInt(challenge.startTime) * 1000);
  const distanceKm = parseInt(challenge.distance) / 1000;
  const entryFeeUSD = parseFloat(formatEther(BigInt(challenge.entryFee))) * 1;
  const hasStarted = Date.now() > startTime.getTime();
  const userParticipant = challenge.participants.find(
    (p) => p.address.toLowerCase() === address?.toLowerCase()
  );

  const handleSubmit = async () => {
    if (!stravaActivityId) return;
    try {
      await submitResult(BigInt(challengeId), BigInt(stravaActivityId));
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to interact with this challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{distanceKm}km Challenge</CardTitle>
        <CardDescription>
          {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Entry Fee</span>
            <span>${entryFeeUSD}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Prize</span>
            <span>
              ${parseFloat(formatEther(BigInt(challenge.totalPrize))) * 1}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Participants</span>
            <span>{challenge.participants.length}</span>
          </div>
        </div>

        {!userParticipant && !hasStarted && (
          <JoinChallengeButton
            challengeId={challengeId}
            entryFee={challenge.entryFee}
          />
        )}

        {userParticipant && !userParticipant.hasSubmitted && hasStarted && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stravaActivityId">Strava Activity ID</Label>
              <Input
                id="stravaActivityId"
                value={stravaActivityId}
                onChange={(e) => setStravaActivityId(e.target.value)}
                placeholder="Enter your Strava activity ID"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !stravaActivityId}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Run'}
            </Button>
          </div>
        )}

        {userParticipant?.hasSubmitted && (
          <div className="text-center text-sm text-muted-foreground">
            You have submitted your run. Waiting for verification...
          </div>
        )}

        {challenge.winner && (
          <div className="text-center">
            <div className="font-semibold">Winner</div>
            <div className="font-mono text-sm">
              {challenge.winner.slice(0, 6)}...{challenge.winner.slice(-4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
