'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseEther } from 'viem';
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
import { useCreateChallenge } from '@/lib/hooks/use-run-judge';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

const PRESET_DISTANCES = [
  { value: '5000', label: '5K' },
  { value: '10000', label: '10K' },
  { value: '21097', label: 'Half Marathon' },
  { value: '42195', label: 'Marathon' },
];

export function CreateChallengeForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { createChallenge, isPending } = useCreateChallenge();

  const [date, setDate] = useState<string>('');
  const [distance, setDistance] = useState<string>('5000');
  const [entryFee, setEntryFee] = useState<string>('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !distance || !entryFee) return;

    try {
      await createChallenge(
        new Date(date),
        parseInt(distance),
        parseEther(entryFee)
      );
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Connect your wallet to create a challenge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectWallet />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create a Challenge</CardTitle>
          <CardDescription>
            Set up your running challenge in a few simple steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Distance</Label>
            <RadioGroup
              value={distance}
              onValueChange={setDistance}
              className="grid grid-cols-2 gap-4"
            >
              {PRESET_DISTANCES.map((preset) => (
                <div key={preset.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={preset.value} id={preset.value} />
                  <Label htmlFor={preset.value}>{preset.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryFee">Entry Fee (USD)</Label>
            <Input
              id="entryFee"
              type="number"
              min="1"
              step="1"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Challenge'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
