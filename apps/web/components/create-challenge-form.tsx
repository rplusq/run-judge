'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseUnits, formatUnits, type Hash } from 'viem';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useWriteRunJudgeCreateChallenge,
  useWriteErc20Approve,
  useReadErc20Allowance,
  useReadErc20BalanceOf,
  runJudgeAddress,
  useSimulateRunJudgeCreateChallenge,
  useSimulateErc20Approve,
} from '@/lib/wagmi/generated';
import { WalletConnect } from '@/components/wallet-connect';
import { baseSepolia } from 'viem/chains';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FundCard } from '@coinbase/onchainkit/fund';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const PRESET_DISTANCES = [
  { value: '1000', label: '1K', emoji: '🚶' },
  { value: '2000', label: '2K', emoji: '🏃‍♂️' },
  { value: '3000', label: '3K', emoji: '🏃‍♂️' },
  { value: '5000', label: '5K', emoji: '🏃‍♂️' },
  { value: '10000', label: '10K', emoji: '🏆' },
  { value: '21097', label: 'Half Marathon', emoji: '🌟' },
];

const RELATIVE_TIME_OPTIONS = [
  { value: '1m', label: 'In 1 minute' },
  { value: '5m', label: 'In 5 minutes' },
  { value: '15m', label: 'In 15 minutes' },
  { value: '1h', label: 'In 1 hour' },
  { value: '3h', label: 'In 3 hours' },
  { value: '24h', label: 'Tomorrow' },
];

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date();
  const isoString = today.toISOString();
  return isoString.substring(0, 10);
}

// Convert relative time to unix timestamp
function getRelativeTime(value: string): number {
  const now = Math.floor(Date.now() / 1000);
  const unit = value.slice(-1);
  const amount = parseInt(value.slice(0, -1));

  switch (unit) {
    case 'm':
      return now + amount * 60;
    case 'h':
      return now + amount * 60 * 60;
    default:
      return now;
  }
}

export function CreateChallengeForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { writeContractAsync: createChallenge, isPending: isCreatePending } =
    useWriteRunJudgeCreateChallenge();
  const { writeContractAsync: approve, isPending: isApprovePending } =
    useWriteErc20Approve();
  const { data: allowance } = useReadErc20Allowance({
    args: address && [address, runJudgeAddress[baseSepolia.id]],
  });
  const { data: usdcBalance } = useReadErc20BalanceOf({
    args: address && [address],
  });

  const [timeMode, setTimeMode] = useState<'specific' | 'relative'>('relative');
  const [date, setDate] = useState<string>(getTodayDate());
  const [relativeTime, setRelativeTime] = useState<string>('1h');
  const [distance, setDistance] = useState<string>('2000');
  const [entryFee, setEntryFee] = useState<string>('10');
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<Hash>();
  const [createTxHash, setCreateTxHash] = useState<Hash>();
  const [toastId, setToastId] = useState<string>();

  // Add simulation hooks
  const { data: createSimulation } = useSimulateRunJudgeCreateChallenge({
    args: address
      ? [
          getRelativeTime(relativeTime),
          parseInt(distance),
          parseUnits(entryFee, 6),
        ]
      : undefined,
    chainId: baseSepolia.id,
  });

  const { data: approveSimulation } = useSimulateErc20Approve({
    args: address
      ? [runJudgeAddress[baseSepolia.id], BigInt(2) ** BigInt(256) - BigInt(1)]
      : undefined,
    chainId: baseSepolia.id,
  });

  // Transaction receipt hooks
  const { isSuccess: isApproveSuccess, isError: isApproveError } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      chainId: baseSepolia.id,
    });

  const { isSuccess: isCreateSuccess, isError: isCreateError } =
    useWaitForTransactionReceipt({
      hash: createTxHash,
      chainId: baseSepolia.id,
    });

  // Handle transaction states
  useEffect(() => {
    if (approveTxHash) {
      if (isApproveSuccess) {
        toast.success('USDC approved successfully', { id: toastId });
        // Add delay to allow subgraph to index
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['readErc20Allowance'],
          });
          handleCreateChallenge();
        }, 3000); // Wait 3 seconds for subgraph indexing
        setApproveTxHash(undefined);
      } else if (isApproveError) {
        toast.error('USDC approval failed', { id: toastId });
        setApproveTxHash(undefined);
      }
    }
  }, [isApproveSuccess, isApproveError, approveTxHash, queryClient, toastId]);

  useEffect(() => {
    if (createTxHash) {
      if (isCreateSuccess) {
        toast.success('Challenge created successfully!', { id: toastId });
        // Add delay to allow subgraph to index
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
          router.push('/dashboard');
        }, 3000); // Wait 3 seconds for subgraph indexing
        setCreateTxHash(undefined);
      } else if (isCreateError) {
        toast.error('Failed to create challenge', { id: toastId });
        setCreateTxHash(undefined);
      }
    }
  }, [
    isCreateSuccess,
    isCreateError,
    createTxHash,
    queryClient,
    router,
    toastId,
  ]);

  const handleCreateChallenge = async () => {
    try {
      // Get the start time based on the selected mode
      const startTime =
        timeMode === 'specific'
          ? Math.floor(new Date(date + 'T00:00:00.000Z').getTime() / 1000)
          : getRelativeTime(relativeTime);

      // Simulate create challenge
      if (!createSimulation?.request) {
        toast.error('Failed to simulate challenge creation');
        return;
      }

      const txHash = await createChallenge({
        args: [startTime, parseInt(distance), parseUnits(entryFee, 6)],
        chainId: baseSepolia.id,
      });

      const id = toast.loading('Creating challenge...').toString();
      setToastId(id);
      setCreateTxHash(txHash as Hash);
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create challenge'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !entryFee || !address) return;

    const entryFeeNumber = parseFloat(entryFee);
    if (entryFeeNumber > 10) {
      toast.error('Entry fee cannot exceed 10 USDC');
      return;
    }

    try {
      const entryFeeAmount = parseUnits(entryFee, 6); // USDC has 6 decimals

      // Check if we need approval
      if (!allowance || allowance < entryFeeAmount) {
        // Simulate approval first
        if (!approveSimulation?.request) {
          toast.error('Failed to simulate USDC approval');
          return;
        }

        // Approve max uint256 to save gas on future transactions
        const txHash = await approve({
          args: [
            runJudgeAddress[baseSepolia.id],
            BigInt(2) ** BigInt(256) - BigInt(1),
          ],
          chainId: baseSepolia.id,
        });

        const id = toast.loading('Approving USDC...').toString();
        setToastId(id);
        setApproveTxHash(txHash as Hash);
        return;
      }

      await handleCreateChallenge();
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create challenge'
      );
    }
  };

  const isPending = isCreatePending || isApprovePending;
  const entryFeeNumber = parseFloat(entryFee);
  const isEntryFeeTooHigh = entryFeeNumber > 10;

  const hasEnoughBalance =
    usdcBalance && entryFee
      ? BigInt(usdcBalance) >= parseUnits(entryFee, 6)
      : false;

  const formattedBalance = usdcBalance
    ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2)
    : '0.00';

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl sm:text-3xl">
          {address ? 'Create Your Challenge ✨' : 'Connect Wallet'}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {address
            ? 'Quick and easy setup - your friends can join in seconds!'
            : 'Connect your wallet to create your first challenge'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!address ? (
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`space-y-8 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* Start Time Section */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  When to Start <span className="text-sm">⏰</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Pick when you want the challenge to begin
                </p>
              </div>

              <Select
                value={timeMode}
                onValueChange={(value: 'specific' | 'relative') =>
                  setTimeMode(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose start time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relative">
                    Quick Start (Time from Now)
                  </SelectItem>
                  <SelectItem value="specific">Pick a Specific Date</SelectItem>
                </SelectContent>
              </Select>

              <div className="pt-2">
                {timeMode === 'specific' ? (
                  <div className="space-y-3">
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={getTodayDate()}
                      required
                      className="w-full p-3"
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your challenge will start at midnight (UTC) on this date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {RELATIVE_TIME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRelativeTime(option.value)}
                        className={`p-3 rounded-lg border text-sm transition-colors
                          ${
                            relativeTime === option.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'hover:bg-accent'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Distance Section */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  Running Distance <span className="text-sm">🎯</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how far everyone needs to run
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_DISTANCES.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDistance(preset.value)}
                    disabled={isPending}
                    className={`p-3 rounded-lg border text-sm transition-colors
                      ${
                        distance === preset.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {preset.label}
                      <span className="text-sm">{preset.emoji}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Entry Fee Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="entryFee"
                    className="text-base font-semibold flex items-center gap-2"
                  >
                    Entry Fee <span className="text-sm">💰</span>
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Balance: {formattedBalance} USDC
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Set how much USDC each person needs to join (max 10 USDC)
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  id="entryFee"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  required
                  className={cn(
                    'w-full p-3',
                    isEntryFeeTooHigh && 'border-destructive',
                    !hasEnoughBalance && 'border-yellow-500'
                  )}
                  disabled={isPending}
                />
                {isEntryFeeTooHigh ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Please keep it under 10 USDC for now - safety first! 🛡️
                    </span>
                  </div>
                ) : !hasEnoughBalance ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-yellow-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        You need {entryFee} USDC to create this challenge
                      </span>
                    </div>
                    <Dialog
                      open={showFundDialog}
                      onOpenChange={setShowFundDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          Get USDC with Coinbase 💳
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Get USDC</DialogTitle>
                          <DialogDescription>
                            Purchase USDC directly with your preferred payment
                            method
                          </DialogDescription>
                        </DialogHeader>
                        <FundCard
                          assetSymbol="USDC"
                          country="US"
                          currency="USD"
                          headerText="Get USDC for Challenge"
                          buttonText="Purchase USDC"
                          presetAmountInputs={[entryFee, '20', '50']}
                          onSuccess={() => {
                            setTimeout(() => {
                              queryClient.invalidateQueries({
                                queryKey: ['readErc20BalanceOf'],
                              });
                              setShowFundDialog(false);
                            }, 2000);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Winner takes all! Total prize will be{' '}
                    {parseFloat(entryFee) * 2}+ USDC 🏆
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base sm:text-lg mt-8"
              disabled={isPending || isEntryFeeTooHigh || !hasEnoughBalance}
            >
              {isApprovePending
                ? 'Approving USDC...'
                : isCreatePending
                  ? 'Creating...'
                  : isEntryFeeTooHigh
                    ? 'Entry Fee Too High'
                    : !hasEnoughBalance
                      ? 'Insufficient USDC Balance'
                      : 'Create Challenge ✨'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
