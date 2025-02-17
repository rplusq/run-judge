'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { formatUnits, type Hash } from 'viem';
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
  useSimulateRunJudgeSubmitActivity,
  useWriteRunJudgeCancelChallenge,
  useSimulateRunJudgeCancelChallenge,
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
  Brain,
  Loader2,
  Microscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompactIdentity, WinnerIdentity } from '@/components/identity-display';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { baseSepolia } from 'viem/chains';
import { triggerRunJudgeAgent } from '@/app/actions';
import { useChallengeAnalysis } from '@/lib/hooks/use-challenge-analysis';

interface ChallengeDetailsProps {
  challengeId: string;
}

interface ActivityResult {
  id: number;
  activityId: number;
  valid: boolean;
  message: string;
  challengeAnalysisId: number;
  createdAt: string;
  updatedAt: string;
}

interface Analysis {
  id: number;
  challengeId: number;
  winnerActivityId: number;
  analysisOutcome: string;
  activityResults: ActivityResult[];
  createdAt: string;
  updatedAt: string;
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

const RunJudgeStatus = ({
  challengeId,
  participants,
  distanceMeters,
}: {
  challengeId: string;
  participants: any[];
  distanceMeters: number;
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingCount, setPingCount] = useState(0);

  const handlePing = useCallback(async () => {
    setIsPinging(true);
    setPingCount((prev) => prev + 1);
    try {
      await triggerRunJudgeAgent(
        challengeId,
        participants.map((p) => ({
          address: p.participant,
          activityId: p.stravaActivityId,
        })),
        distanceMeters
      );
      toast.success('RunJudge has been pinged! 🏃‍♂️');
    } catch (error) {
      console.error('Error pinging RunJudge:', error);
      toast.error('RunJudge is too tired to respond 😴');
    } finally {
      setIsPinging(false);
    }
  }, [challengeId, participants, distanceMeters]);

  const getPingMessage = () => {
    if (pingCount === 0) return 'Ping me if I missed something!';
    if (pingCount === 1) return 'Ouch! Once was enough!';
    if (pingCount === 2) return "Hey, I'm working here! 🏃‍♂️";
    if (pingCount === 3) return "Stop it, I'm analyzing! 🧠";
    return "Ok, now you're just being mean! 😤";
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <span className="font-semibold">RunJudge is Analyzing</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying activities and determining the winner...
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePing}
            disabled={isPinging}
            className="mt-2"
          >
            {isPinging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pinging RunJudge...
              </>
            ) : (
              getPingMessage()
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalysisResults = ({ challengeId }: { challengeId: string }) => {
  const { data: analysis, isLoading } = useChallengeAnalysis(challengeId) as {
    data: Analysis | null;
    isLoading: boolean;
  };

  if (isLoading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-semibold">Loading Analysis...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            <span className="font-semibold">Analysis Results</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {analysis.analysisOutcome}
          </p>
        </div>

        <div className="space-y-4">
          {analysis.activityResults.map((result: ActivityResult) => (
            <Card key={result.activityId}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.valid ? 'secondary' : 'destructive'}
                      >
                        {result.valid ? 'Valid' : 'Invalid'}
                      </Badge>
                      <a
                        href={`https://www.strava.com/activities/${result.activityId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Activity {result.activityId}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-sm">{result.message}</p>
                  </div>
                  {analysis.winnerActivityId === result.activityId && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function ChallengeDetails({ challengeId }: ChallengeDetailsProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: challenge } = useSubgraphChallenge(challengeId);
  const { data: contractChallenge } = useContractChallenge({
    args: [BigInt(challengeId)],
  });
  const { writeContractAsync: submitResult, isPending: isSubmitting } =
    useWriteRunJudgeSubmitActivity();
  const { writeContractAsync: cancelChallenge, isPending: isCancelling } =
    useWriteRunJudgeCancelChallenge();

  // Initialize all state variables
  const [stravaActivityId, setStravaActivityId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [submitTxHash, setSubmitTxHash] = useState<Hash>();
  const [cancelTxHash, setCancelTxHash] = useState<Hash>();
  const [toastId, setToastId] = useState<string>();

  // Transaction receipt hooks
  const { isSuccess: isSubmitSuccess, isError: isSubmitError } =
    useWaitForTransactionReceipt({
      hash: submitTxHash,
      chainId: baseSepolia.id,
    });

  const { isSuccess: isCancelSuccess, isError: isCancelError } =
    useWaitForTransactionReceipt({
      hash: cancelTxHash,
      chainId: baseSepolia.id,
    });

  // Compute derived values from challenge data
  const startTime = challenge
    ? new Date(parseInt(challenge.startTime) * 1000)
    : new Date();
  const distanceMeters = challenge ? parseInt(challenge.distance) : 0;
  const distanceKm = distanceMeters / 1000;
  const entryFeeUSD = challenge
    ? parseFloat(formatUnits(BigInt(challenge.entryFee), 6))
    : 0;
  const hasStarted = challenge
    ? Math.floor(Date.now() / 1000) >= parseInt(challenge.startTime)
    : false;
  const userParticipant = challenge?.participants.find(
    (p) => p.participant.toLowerCase() === address?.toLowerCase()
  );
  const status = challenge
    ? getStatusConfig(challenge)
    : {
        label: 'Loading',
        Icon: Timer,
        variant: 'outline' as const,
        iconClass: '',
      };

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

  // Get validated activity ID
  const validatedActivityId = useMemo(() => {
    return extractActivityId(stravaActivityId);
  }, [stravaActivityId]);

  // Add simulation hooks
  const { data: submitSimulation } = useSimulateRunJudgeSubmitActivity({
    args: validatedActivityId
      ? [BigInt(challengeId), BigInt(validatedActivityId)]
      : undefined,
    chainId: baseSepolia.id,
  });

  const { data: cancelSimulation } = useSimulateRunJudgeCancelChallenge({
    args: [BigInt(challengeId)],
    chainId: baseSepolia.id,
  });

  // Handle transaction states
  useEffect(() => {
    if (submitTxHash) {
      if (isSubmitSuccess) {
        toast.success('Activity submitted successfully!', { id: toastId });
        setTimeout(async () => {
          queryClient.invalidateQueries({
            queryKey: ['readRunJudgeChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['userChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['challenge', challengeId],
          });

          if (
            challenge?.participants.length === 2 &&
            challenge.participants.every((p) => p.stravaActivityId)
          ) {
            try {
              await triggerRunJudgeAgent(
                challengeId,
                challenge.participants.map((p) => ({
                  address: p.participant,
                  activityId: p.stravaActivityId,
                })),
                distanceMeters
              );
            } catch (error) {
              console.error('Error triggering run judge agent:', error);
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to trigger run judge agent. Please try again later.'
              );
            }
          }

          setShowConfirmation(false);
        }, 3000);
        setSubmitTxHash(undefined);
      } else if (isSubmitError) {
        toast.error('Failed to submit activity', { id: toastId });
        setSubmitTxHash(undefined);
      }
    }
  }, [
    isSubmitSuccess,
    isSubmitError,
    submitTxHash,
    queryClient,
    toastId,
    challengeId,
    challenge?.participants,
    distanceMeters,
  ]);

  useEffect(() => {
    if (cancelTxHash) {
      if (isCancelSuccess) {
        toast.success('Challenge cancelled successfully!', { id: toastId });
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['readRunJudgeChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['userChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['available-challenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['challenge', challengeId],
          });
        }, 3000);
        setShowCancelConfirmation(false);
        setCancelTxHash(undefined);
      } else if (isCancelError) {
        toast.error('Failed to cancel challenge', { id: toastId });
        setCancelTxHash(undefined);
      }
    }
  }, [
    isCancelSuccess,
    isCancelError,
    cancelTxHash,
    queryClient,
    toastId,
    challengeId,
  ]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStravaActivityId(value);
    setError(null);
  };

  const handleSubmitClick = () => {
    if (!validatedActivityId) {
      setError('Please enter a valid Strava activity ID or URL');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    if (!validatedActivityId) {
      setError('Please enter a valid Strava activity ID or URL');
      return;
    }

    try {
      // Simulate submission first
      if (!submitSimulation?.request) {
        toast.error('Failed to simulate activity submission');
        return;
      }

      const txHash = await submitResult({
        args: [BigInt(challengeId), BigInt(validatedActivityId)],
        chainId: baseSepolia.id,
      });

      const id = toast.loading('Submitting activity...').toString();
      setToastId(id);
      setSubmitTxHash(txHash as Hash);
    } catch (error) {
      console.error('Failed to submit result:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit activity'
      );
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

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmedCancel = async () => {
    try {
      // Simulate cancellation first
      if (!cancelSimulation?.request) {
        toast.error('Failed to simulate challenge cancellation');
        return;
      }

      const txHash = await cancelChallenge({
        args: [BigInt(challengeId)],
        chainId: baseSepolia.id,
      });

      const id = toast.loading('Cancelling challenge...').toString();
      setToastId(id);
      setCancelTxHash(txHash as Hash);
    } catch (error) {
      console.error('Failed to cancel challenge:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel challenge'
      );
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
        <CardContent className="flex flex-col items-center gap-4">
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
              variant={status.variant}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium',
                challenge?.isCancelled && 'bg-destructive/10 text-destructive',
                challenge?.winner && 'bg-green-500/10 text-green-500'
              )}
            >
              {status.Icon && <status.Icon className="h-3 w-3 shrink-0" />}
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Challenge Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-baseSepolia">
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
                <CardTitle className="flex items-center gap-2 text-baseSepolia">
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
                <CardTitle className="flex items-center gap-2 text-baseSepolia">
                  <Users className="h-4 w-4 text-primary" />
                  Participants
                </CardTitle>
                <CardDescription className="text-xl font-bold">
                  {challenge.participantsLength}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Participants List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Participants</h3>
            <div className="space-y-3">
              {challenge.participants.map((participant) => {
                return (
                  <div
                    key={participant.participant}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <CompactIdentity
                        address={participant.participant as `0x${string}`}
                      />
                      {participant.participant.toLowerCase() ===
                        address?.toLowerCase() && (
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
                );
              })}
            </div>
          </div>

          {/* Analysis Status */}
          {challenge.participants.length === 2 &&
            challenge.participants.every((p) => p.stravaActivityId) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analysis Status</h3>
                {!challenge.winner ? (
                  <RunJudgeStatus
                    challengeId={challengeId}
                    participants={challenge.participants}
                    distanceMeters={distanceMeters}
                  />
                ) : (
                  <AnalysisResults challengeId={challengeId} />
                )}
              </div>
            )}

          {/* Action Section */}
          <div className="space-y-4">
            {!userParticipant &&
              challenge.isActive &&
              !hasStarted &&
              !challenge.isCancelled &&
              challenge.participants.length < 2 && (
                <JoinChallengeButton
                  challengeId={challengeId}
                  entryFee={formatUnits(BigInt(challenge.entryFee), 6)}
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

            {/* Add Cancel Button */}
            {address?.toLowerCase() ===
              challenge.participants[0]?.participant.toLowerCase() &&
              challenge.isActive &&
              !challenge.isCancelled &&
              parseInt(challenge.participantsLength) === 1 && (
                <Button
                  onClick={handleCancelClick}
                  variant="destructive"
                  disabled={isCancelling}
                  className="w-full"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Challenge'}
                </Button>
              )}
          </div>

          {/* Winner Section */}
          {challenge.winner && (
            <div className="text-center p-6 rounded-lg bg-green-500/10 space-y-2">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto" />
              <div className="font-semibold">Winner</div>

              <WinnerIdentity
                address={challenge.winner as `0x${string}`}
                prize={parseFloat(
                  formatUnits(BigInt(challenge.totalPrize), 6)
                ).toString()}
              />
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

      {/* Add Cancel Confirmation Dialog */}
      <AlertDialog
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this challenge? This action cannot
              be undone. Your entry fee will be refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Challenge</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Cancel Challenge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
