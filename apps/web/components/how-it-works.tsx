import { Flag, Wallet, Medal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    name: 'Create a Challenge',
    description: 'Pick a distance and date. Entry fee goes to the winner',
    icon: Wallet,
    accent: 'from-primary/5 to-transparent border-primary/10',
  },
  {
    name: 'Share with Friends',
    description: 'Send them the link and they can join instantly',
    icon: Flag,
    accent: 'from-primary/5 to-transparent border-primary/10',
  },
  {
    name: 'Run & Win',
    description:
      'Complete your run on Strava and our AI verifies the winner ✨',
    icon: Medal,
    accent: 'from-primary/5 to-transparent border-primary/10',
  },
];

export function HowItWorks() {
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How it Works
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Three simple steps to start running with friends 🏃‍♂️
          </p>
        </div>

        <div className="mx-auto mt-6 sm:mt-8 max-w-5xl">
          <dl className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.name}
                className={cn(
                  'relative rounded-lg border bg-gradient-to-b p-6 text-center transition-all hover:scale-[1.01]',
                  step.accent
                )}
              >
                <dt className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2.5 ring-1 ring-primary/20">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-base font-semibold">{step.name}</div>
                </dt>
                <dd className="mt-1.5 text-sm text-muted-foreground">
                  {step.description}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 sm:mt-10 flex justify-center lg:hidden">
            <Button asChild size="lg">
              <Link href="/create" className="flex items-center gap-2">
                Create Challenge
                <span className="text-sm">🎯</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
