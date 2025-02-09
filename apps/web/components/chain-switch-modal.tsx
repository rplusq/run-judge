'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from '@/lib/wagmi/config';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

// Get the first chain from config as the required chain
const [requiredChain] = config.chains;

export function ChainSwitchModal() {
  const { isConnected, chainId } = useAccount();
  const {
    switchChain,
    isError: isSwitchError,
    error: switchError,
  } = useSwitchChain();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isConnected && chainId !== requiredChain?.id) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isConnected, chainId]);

  // Log switch chain errors
  useEffect(() => {
    if (isSwitchError && switchError) {
      console.error('Switch chain error:', switchError);
    }
  }, [isSwitchError, switchError]);

  const handleSwitch = async () => {
    if (!requiredChain?.id) {
      console.error('Required chain ID is undefined');
      toast.error('Unable to connect to the required network');
      return;
    }

    try {
      await switchChain({ chainId: requiredChain.id });
      toast.success('Successfully connected to the required network');
    } catch (error) {
      console.error('Failed to switch chain:', error);
      let errorMessage = 'Unable to connect to the required network';
      if (error instanceof Error) {
        errorMessage = `Connection failed: ${error.message}`;
      }
      toast.error(errorMessage);
    }
  };

  // Early return with debug log
  if (!isConnected || chainId === requiredChain?.id) {
    return null;
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4">
        <div className="bg-background rounded-lg border shadow-lg">
          <div className="p-6 space-y-6">
            <div className="space-y-3 text-center">
              <div className="mx-auto rounded-full bg-yellow-100 p-3 w-fit">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold">
                Action Required: Wrong Network
              </h2>
              <p className="text-muted-foreground">
                You must switch to {requiredChain?.name} to continue using Run
                Judge. This action is required and cannot be dismissed.
              </p>
            </div>
            <div>
              <Button
                onClick={handleSwitch}
                disabled={!requiredChain?.id}
                className="w-full"
              >
                Switch Network
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
