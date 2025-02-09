'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex justify-end">
        <p className="text-sm leading-loose text-muted-foreground">
          Built with{' '}
          <Heart className="inline-block h-4 w-4 text-red-500 animate-pulse" />{' '}
          by{' '}
          <a
            href="https://github.com/aguxez"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            aguxez
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/rplusq"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            rplusq
          </a>{' '}
          for{' '}
          <a
            href="https://ethglobal.com/events/agents"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            ETHGlobal Agentic Ethereum 2025
          </a>
        </p>
      </div>
    </footer>
  );
}
