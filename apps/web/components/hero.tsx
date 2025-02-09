import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative isolate px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl py-12 sm:py-20">
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-ring/10 hover:ring-ring/20">
              Powered by{' '}
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-1 font-semibold text-primary"
              >
                Base <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Run Together, Win Together ✨
          </h1>

          <div className="mx-auto max-w-xl space-y-4">
            <p className="text-base sm:text-lg leading-7 text-muted-foreground">
              Create fun running challenges with friends - no crypto knowledge
              needed! Just connect your Strava, set a goal, and let our AI
              handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Fair & transparent</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span>USDC prizes 💰</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/create">Start Your First Challenge</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/join">Browse Challenges</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
