'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { WalletButton } from '@/components/wallet-button';

export function NavLinks() {
  const { address } = useAccount();

  return (
    <div className="flex items-center gap-4">
      {address && (
        <>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            My Challenges
          </Link>
        </>
      )}
      <WalletButton />
    </div>
  );
}
