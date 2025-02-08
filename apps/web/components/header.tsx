import Link from 'next/link';
import { WalletButton } from '@/components/wallet-button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">
          RunJudge
        </Link>
        <WalletButton />
      </div>
    </header>
  );
}
