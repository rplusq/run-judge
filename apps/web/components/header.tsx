import Link from 'next/link';
import { NavLinks } from '@/components/nav-links';

export function Header() {
  return (
    <header className="border-b bg-gradient-to-b from-background to-muted/20">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight hover:text-primary transition-colors flex items-center gap-1.5"
        >
          RunJudge <span className="text-sm">🏃‍♂️</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
