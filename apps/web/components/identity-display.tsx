'use client';

interface BaseIdentityProps {
  address: `0x${string}`;
  className?: string;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function CompactIdentity({ address, className }: BaseIdentityProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-6 h-6 bg-muted border rounded-full flex items-center justify-center text-xs">
        {address.slice(2, 4)}
      </div>
      <span className="text-sm font-medium text-foreground">
        {formatAddress(address)}
      </span>
    </div>
  );
}

export function MiniIdentity({ address, className }: BaseIdentityProps) {
  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <div className="w-4 h-4 bg-muted border rounded-full flex items-center justify-center text-[10px]">
        {address.slice(2, 4)}
      </div>
      <span className="font-medium text-foreground">
        {formatAddress(address)}
      </span>
    </div>
  );
}

interface WinnerIdentityProps extends BaseIdentityProps {
  prize: string;
}

export function WinnerIdentity({
  address,
  prize,
  className,
}: WinnerIdentityProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-muted border rounded-full flex items-center justify-center text-sm">
        {address.slice(2, 4)}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-medium text-foreground">
          {formatAddress(address)}
        </span>
        <div className="text-xs text-muted-foreground">Prize: ${prize}</div>
      </div>
    </div>
  );
}
