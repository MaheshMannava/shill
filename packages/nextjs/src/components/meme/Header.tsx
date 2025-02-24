"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Key, Ticket } from "lucide-react";
import { WalletDialog } from "./WalletDialog";
import { useAccount, useDisconnect } from 'wagmi';
import { useTicketBalance } from "@/hooks/useTicketBalance";

interface HeaderProps {
}

export function Header(props: HeaderProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const ticketBalance = useTicketBalance(); // Will be null when disconnected

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
    } else {
      setWalletOpen(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-[#e1e1e1]">
      <Card className="p-4 bg-gray-100 rounded-none">
        <div className="flex items-center justify-between">
          <div className="w-16 h-16 bg-white rounded-none flex items-center justify-center overflow-hidden">
            <img
              src="/images/wex 3.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {isConnected && (
            <div className="px-6 py-3 rounded-none flex items-center gap-2 bg-[#fffbce]">
              <Ticket className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold font-sans">
                {ticketBalance}
              </span>
            </div>
          )}

          <Button
            className={`${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-2 h-12 rounded-none font-serif`}
            onClick={handleWalletAction}
          >
            <Key className="mr-2 h-5 w-5" />
            {isConnected ? truncateAddress(address!) : 'CONNECT'}
          </Button>
        </div>
      </Card>
      <WalletDialog
        open={walletOpen}
        onOpenChange={(open) => {
          console.log("Dialog state changing to:", open);
          setWalletOpen(open);
        }}
      />
    </div>
  );
}
