'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChallenge as useSubgraphChallenge } from '@/lib/hooks/use-subgraph';
import { WalletButton } from '@/components/wallet-button';
import { JoinChallengeButton } from '@/components/join-challenge-button';
import { useAccount } from 'wagmi';
import {
  useReadRunJudgeChallenges as useContractChallenge,
  useWriteRunJudgeSubmitActivity,
} from '@/lib/wagmi/generated';
import {
  Trophy,
  Timer,
  Ban,
  Users,
  DollarSign,
  Crown,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Check,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeDetailsProps {
  challengeId: string;
}

const getStatusConfig = (challenge: {
  isCancelled: boolean;
  winner: string | null;
  startTime: string;
}) => {
  if (challenge.isCancelled) {
    return {
      label: 'Cancelled',
      Icon: Ban,
      variant: 'destructive' as const,
      iconClass: 'text-destructive',
    };
  }
  if (challenge.winner) {
    return {
      label: 'Completed',
      Icon: Trophy,
      variant: 'secondary' as const,
      iconClass: 'text-green-500',
    };
  }
  return new Date(parseInt(challenge.startTime) * 1000) > new Date()
    ? {
        label: 'Open',
        Icon: Timer,
        variant: 'outline' as const,
        iconClass: 'text-primary',
      }
    : {
        label: 'Active',
        Icon: Timer,
        variant: 'default' as const,
        iconClass: 'text-yellow-500',
      };
};

export function ChallengeDetails({ challengeId }: ChallengeDetailsProps) {
  const { address } = useAccount();
  const { data: challenge } = useSubgraphChallenge(challengeId);
  const { data: contractChallenge } = useContractChallenge({
    args: [BigInt(challengeId)],
  });
  const { writeContractAsync: submitResult, isPending: isSubmitting } =
    useWriteRunJudgeSubmitActivity();

  const [stravaActivityId, setStravaActivityId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);

  if (!challenge || !contractChallenge) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Loading Challenge...</CardTitle>
          <CardDescription>
            Please wait while we fetch the challenge details
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const startTime = new Date(parseInt(challenge.startTime) * 1000);
  const distanceKm = parseInt(challenge.distance) / 1000;
  const entryFeeUSD = parseFloat(formatUnits(BigInt(challenge.entryFee), 6));
  const hasStarted = Date.now() > startTime.getTime();
  const userParticipant = challenge.participants.find(
    (p) => p.participant.toLowerCase() === address?.toLowerCase()
  );
  const statusConfig = getStatusConfig(challenge);

  // Extract activity ID from Strava URL or raw input
  const extractActivityId = (input: string) => {
    // Try to extract ID from URL first
    const urlMatch = input.match(/strava\.com\/activities\/(\d+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    // If not URL, check if it's a valid number
    if (/^\d+$/.test(input)) {
      return input;
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStravaActivityId(value);
    setError(null);
  };

  const handleSubmitClick = () => {
    const activityId = extractActivityId(stravaActivityId);
    if (!activityId) {
      setError('Please enter a valid Strava activity ID or URL');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    const activityId = extractActivityId(stravaActivityId);
    if (!activityId) return;

    try {
      await submitResult({
        args: [BigInt(challengeId), BigInt(activityId)],
      });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to submit result:', error);
      setError('Failed to submit activity. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to interact with this challenge
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {distanceKm}km Challenge
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShare}
                >
                  {isShared ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Share Challenge</span>
                </Button>
              </div>
              <CardDescription className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {startTime.toLocaleDateString()} at{' '}
                {startTime.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge
              variant={statusConfig.variant}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium',
                challenge.isCancelled && 'bg-destructive/10 text-destructive',
                challenge.winner && 'bg-green-500/10 text-green-500'
              )}
            >
              <statusConfig.Icon className="h-3 w-3 shrink-0" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Challenge Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Entry Fee
                </CardTitle>
                <CardDescription className="text-xl font-bold">
                  ${entryFeeUSD}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-primary" />
                  Total Prize
                </CardTitle>
                <CardDescription className="text-xl font-bold">
                  ${parseFloat(formatUnits(BigInt(challenge.totalPrize), 6))}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Participants
                </CardTitle>
                <CardDescription className="text-xl font-bold">
                  {challenge.participants.length}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Participants List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Participants</h3>
            <div className="space-y-3">
              {challenge.participants.map((participant) => (
                <div
                  key={participant.participant}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm">
                      {participant.participant.slice(0, 6)}...
                      {participant.participant.slice(-4)}
                    </div>
                    {participant.participant.toLowerCase() ===
                      address.toLowerCase() && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.hasSubmitted ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Submitted
                      </Badge>
                    ) : hasStarted ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Timer className="h-3 w-3" />
                        Not Started
                      </Badge>
                    )}
                    {participant.stravaActivityId && (
                      <a
                        href={`https://www.strava.com/activities/${participant.stravaActivityId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div className="space-y-4">
            {!userParticipant && !hasStarted && (
              <JoinChallengeButton
                challengeId={challengeId}
                entryFee={challenge.entryFee}
              />
            )}

            {userParticipant && !userParticipant.hasSubmitted && hasStarted && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stravaActivityId">Strava Activity</Label>
                  <Input
                    id="stravaActivityId"
                    value={stravaActivityId}
                    onChange={handleInputChange}
                    placeholder="Paste Strava activity URL or ID"
                    className={error ? 'border-destructive' : ''}
                  />
                  <p className="text-sm text-muted-foreground break-words">
                    Enter either the full Strava activity URL or just the ID
                    number (e.g., strava.com/activities/13577490538)
                  </p>
                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {error}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleSubmitClick}
                  disabled={isSubmitting || !stravaActivityId}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Run'}
                </Button>
              </div>
            )}

            {userParticipant?.hasSubmitted && (
              <div className="text-center p-4 rounded-lg bg-muted">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  You have submitted your run
                </p>
                <p className="text-sm text-muted-foreground">
                  {challenge.participants.length === 1
                    ? 'Waiting for other participants to join...'
                    : 'Waiting for verification...'}
                </p>
              </div>
            )}
          </div>

          {/* Winner Section */}
          {challenge.winner && (
            <div className="text-center p-6 rounded-lg bg-green-500/10 space-y-2">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto" />
              <div className="font-semibold">Winner</div>
              <div className="font-mono text-sm">
                {challenge.winner.slice(0, 6)}...{challenge.winner.slice(-4)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Run Submission</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  You are about to submit your Strava activity for verification.
                  Please note:
                </div>
                <div className="space-y-4">
                  <ul className="list-disc pl-4 space-y-2">
                    <li>This action cannot be undone once submitted</li>
                    <li>
                      <div className="space-y-2">
                        <div>
                          A Run Judge will verify that your activity meets the
                          challenge requirements:
                        </div>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Minimum distance of {distanceKm}km</li>
                          <li>
                            Run must be completed after the challenge start time
                          </li>
                          <li>
                            Activity must be a running activity (not walking or
                            cycling)
                          </li>
                          <li>GPS data must be valid and continuous</li>
                        </ul>
                      </div>
                    </li>
                    <li>
                      Submitting false or manipulated data will result in your
                      entry fee being awarded to other participants
                    </li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Submit Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
