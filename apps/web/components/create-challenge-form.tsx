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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useWriteRunJudgeCreateChallenge } from '@/lib/wagmi/generated';
import { WalletConnect } from '@/components/wallet-connect';
import { baseSepolia } from 'viem/chains';

const PRESET_DISTANCES = [
  { value: '1000', label: '1K' },
  { value: '2000', label: '2K' },
  { value: '3000', label: '3K' },
  { value: '5000', label: '5K' },
  { value: '10000', label: '10K' },
  { value: '21097', label: 'Half Marathon' },
];

// Get tomorrow's date in YYYY-MM-DD format
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isoString = tomorrow.toISOString();
  return isoString.substring(0, 10);
}

export function CreateChallengeForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync: createChallenge, isPending } =
    useWriteRunJudgeCreateChallenge();

  const [date, setDate] = useState<string>(getTomorrowDate());
  const [distance, setDistance] = useState<string>('2000');
  const [entryFee, setEntryFee] = useState<string>('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !distance || !entryFee) return;

    try {
      // Create a Date object at UTC 00:00 for the selected date
      const selectedDate = new Date(date + 'T00:00:00.000Z').getTime() / 1000;
      await createChallenge({
        args: [selectedDate, parseInt(distance), parseUnits(entryFee, 6)],
        chainId: baseSepolia.id,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

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
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm sm:text-base">
                Start Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getTomorrowDate()}
                required
                className="w-full p-3"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Challenge will start at 00:00 UTC on the selected date
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base">Distance</Label>
              <RadioGroup
                value={distance}
                onValueChange={setDistance}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                disabled={isPending}
              >
                {PRESET_DISTANCES.map((preset) => (
                  <div
                    key={preset.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      !isPending ? 'hover:bg-accent' : ''
                    }`}
                  >
                    <RadioGroupItem
                      value={preset.value}
                      id={preset.value}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={preset.value}
                      className={`text-sm sm:text-base flex-grow ${
                        isPending
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      }`}
                    >
                      {preset.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="entryFee" className="text-sm sm:text-base">
                Entry Fee (USD)
              </Label>
              <Input
                id="entryFee"
                type="number"
                min="1"
                step="1"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                required
                className="w-full p-3"
                disabled={isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base sm:text-lg"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Challenge'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
