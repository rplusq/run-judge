'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
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
  runJudgeAddress,
} from '@/lib/wagmi/generated';
import { WalletConnect } from '@/components/wallet-connect';
import { baseSepolia } from 'viem/chains';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_DISTANCES = [
  { value: '1000', label: '1K' },
  { value: '2000', label: '2K' },
  { value: '3000', label: '3K' },
  { value: '5000', label: '5K' },
  { value: '10000', label: '10K' },
  { value: '21097', label: 'Half Marathon' },
];

const RELATIVE_TIME_OPTIONS = [
  { value: '1m', label: '1 minute from now' },
  { value: '5m', label: '5 minutes from now' },
  { value: '15m', label: '15 minutes from now' },
  { value: '1h', label: '1 hour from now' },
  { value: '3h', label: '3 hours from now' },
  { value: '24h', label: '24 hours from now' },
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
  const { address } = useAccount();
  const { writeContractAsync: createChallenge, isPending: isCreatePending } =
    useWriteRunJudgeCreateChallenge();
  const { writeContractAsync: approve, isPending: isApprovePending } =
    useWriteErc20Approve();
  const { data: allowance } = useReadErc20Allowance({
    args: address && [address, runJudgeAddress[baseSepolia.id]],
  });

  const [timeMode, setTimeMode] = useState<'specific' | 'relative'>('relative');
  const [date, setDate] = useState<string>(getTodayDate());
  const [relativeTime, setRelativeTime] = useState<string>('1h');
  const [distance, setDistance] = useState<string>('2000');
  const [entryFee, setEntryFee] = useState<string>('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !entryFee || !address) return;

    const entryFeeNumber = parseFloat(entryFee);
    if (entryFeeNumber > 10) {
      return; // Early return if entry fee is too high
    }

    try {
      const entryFeeAmount = parseUnits(entryFee, 6); // USDC has 6 decimals

      // Check if we need approval
      if (!allowance || allowance < entryFeeAmount) {
        // Approve max uint256 to save gas on future transactions
        await approve({
          args: [
            runJudgeAddress[baseSepolia.id],
            BigInt(2) ** BigInt(256) - BigInt(1),
          ],
          chainId: baseSepolia.id,
        });
      }

      // Get the start time based on the selected mode
      const startTime =
        timeMode === 'specific'
          ? Math.floor(new Date(date + 'T00:00:00.000Z').getTime() / 1000)
          : getRelativeTime(relativeTime);

      await createChallenge({
        args: [startTime, parseInt(distance), entryFeeAmount],
        chainId: baseSepolia.id,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const isPending = isCreatePending || isApprovePending;
  const entryFeeNumber = parseFloat(entryFee);
  const isEntryFeeTooHigh = entryFeeNumber > 10;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl sm:text-3xl">
          {address ? 'Create a Challenge' : 'Connect Wallet'}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {address
            ? 'Set up your running challenge in a few simple steps'
            : 'Connect your wallet to create a challenge'}
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
                <Label className="text-base font-semibold">Start Time</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose when your challenge will begin
                </p>
              </div>

              <Select
                value={timeMode}
                onValueChange={(value: 'specific' | 'relative') =>
                  setTimeMode(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select start time type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relative">Time from Now</SelectItem>
                  <SelectItem value="specific">Specific Date</SelectItem>
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
                      Challenge will start at 00:00 UTC on the selected date
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
                <Label className="text-base font-semibold">Distance</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select your challenge distance
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
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Entry Fee Section */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="entryFee" className="text-base font-semibold">
                  Entry Fee
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Set the entry fee in USDC (max 10 USDC)
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
                    isEntryFeeTooHigh && 'border-destructive'
                  )}
                  disabled={isPending}
                />
                {isEntryFeeTooHigh && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Maximum entry fee is 10 USDC as the contract is not yet
                      audited
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base sm:text-lg mt-8"
              disabled={isPending || isEntryFeeTooHigh}
            >
              {isApprovePending
                ? 'Approving USDC...'
                : isCreatePending
                  ? 'Creating...'
                  : isEntryFeeTooHigh
                    ? 'Entry Fee Too High'
                    : 'Create Challenge'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
