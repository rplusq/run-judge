import { WalletDefault } from "@coinbase/onchainkit/wallet";
import { StravaButton } from "./strava-button";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-orange-500 select-none cursor-pointer"
        >
          RunJudge
        </Link>
        <div className="flex space-x-2">
          <WalletDefault />
          <StravaButton />
        </div>
      </div>
    </header>
  );
}
