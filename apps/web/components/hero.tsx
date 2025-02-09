import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <div className="relative isolate px-4 sm:px-6 pt-10 sm:pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-16 sm:py-32 lg:py-40">
        <div className="text-center space-y-8 sm:space-y-10">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
            Challenge friends to run together, winner takes all
          </h1>
          <p className="text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-xl mx-auto">
            Create running challenges with friends, set a prize pool, and let
            our AI judge verify the winner through Strava. It&apos;s that
            simple!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base sm:text-lg"
            >
              <Link href="/create">Challenge a Friend</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base sm:text-lg"
            >
              <Link href="/dashboard">View My Challenges</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
