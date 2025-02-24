import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocalStorage } from "usehooks-ts";

interface BurnerWallet {
  address: string;
  privateKey: string;
}

export const useBurnerWallet = (eventId: string) => {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [storedWallet, setStoredWallet] = useLocalStorage<BurnerWallet | null>(
    `burner_${eventId}`,
    null
  );

  useEffect(() => {
    const initializeWallet = async () => {
      if (storedWallet) {
        // Restore existing wallet
        const restoredWallet = new ethers.Wallet(storedWallet.privateKey);
        setWallet(restoredWallet);
      } else {
        // Create new wallet
        const newWallet = ethers.Wallet.createRandom();
        const walletData = {
          address: newWallet.address,
          privateKey: newWallet.privateKey,
        };
        setStoredWallet(walletData);
        setWallet(newWallet);
      }
    };

    initializeWallet();
  }, [eventId, storedWallet, setStoredWallet]);

  const clearWallet = () => {
    setStoredWallet(null);
    setWallet(null);
  };

  return {
    wallet,
    address: wallet?.address || "",
    clearWallet,
    isInitialized: !!wallet,
  };
};
