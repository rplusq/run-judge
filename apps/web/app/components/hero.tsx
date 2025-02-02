import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center">
      <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
          RunJudge - Fair Play for Fitness Bets
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          Synchronized Saturday runs, verified by AI, winner takes the
          yield-generating prize pool
        </p>
        <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/create-challenge" className="inline-block">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Create Challenge
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
          >
            Join Challenge
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Image
          src="/placeholder.svg?height=400&width=400"
          alt="Runners and AI judge illustration"
          width={400}
          height={400}
          className="rounded-lg shadow-2xl"
        />
      </div>
    </section>
  );
}
