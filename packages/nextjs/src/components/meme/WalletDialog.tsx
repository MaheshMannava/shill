"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogPortal } from "@radix-ui/react-dialog";
import { useConnect } from 'wagmi';
import { config } from '@/lib/web3Config';

interface WalletDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WalletDialog({
  open = false,
  onOpenChange,
}: WalletDialogProps) {
  const { connectors, connect, status } = useConnect();
  const [isBurnerLoading, setIsBurnerLoading] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('WalletDialog mounted');
    console.log('Available connectors:', connectors);
    console.log('Connection status:', status);
  }, [connectors, status]);

  const handleConnect = async (connectorId: string) => {
    console.log('Attempting to connect with:', connectorId); // Debug log
    try {
      await connect({ connector: connectors.find(c => c.id === connectorId) });
      console.log('Connection successful'); // Debug log
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleBurnerWallet = async () => {
    setIsBurnerLoading(true);
    try {
      // TODO: Implement burner wallet generation
      onOpenChange?.(false);
    } catch (error) {
      console.error('Failed to generate burner wallet:', error);
    } finally {
      setIsBurnerLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[440px] p-0 gap-0 bg-[#E6E6E6] border-0 rounded-none">
          {/* Main content area with layered shadow effect */}
          <div className="m-3 shadow-[2px_2px_4px_rgba(0,0,0,0.05)] bg-[#cdcdcd]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#E6E6E6]">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif">🗝️ CONNECT WALLET</h2>
              </div>
              <button
                onClick={() => onOpenChange?.(false)}
                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-black/5"
              >
                ×
              </button>
            </div>

            {/* Wallet options */}
            <div className="p-4 space-y-[6px] bg-[#a3a3a3]">
              {connectors
                .filter(connector => connector.name.toLowerCase() !== 'phantom') // Filter out Phantom wallet
                .map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  disabled={status === 'pending'}
                  className="w-full h-12 px-4 hover:bg-gray-50 border border-[#E6E6E6] flex items-center justify-between font-serif bg-[#cfcfcf] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {connector.name.toUpperCase()}
                    {status === 'pending' && " (connecting...)"}
                  </span>
                  <span className="text-lg">→</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E6E6E6]">
              <p className="text-[11px] text-[#666666] mb-4 text-center max-w-[360px] mx-auto leading-[14px]">
                DON'T HAVE A WALLET? GENERATE A BURNER WALLET TO MAKE THINGS
                EASY. ANY WINNINGS FROM THE GAME WILL BE SENT HERE.
              </p>
              <button
                onClick={handleBurnerWallet}
                disabled={isBurnerLoading}
                className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white font-serif flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBurnerLoading ? "GENERATING..." : "GENERATE BURNER 🔥"}
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
