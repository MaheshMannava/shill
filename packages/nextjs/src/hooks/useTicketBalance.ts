import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';

// Define the event ID from contracts config
const EVENT_ID = CONTRACTS.CROP_CIRCLE.EVENT_ID;

export function useTicketBalance() {
  const { address, isConnected } = useAccount();
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setTicketBalance(null);
      return;
    }

    // Use local storage to track balances
    const storageKey = `cropBalance_${EVENT_ID}_${address.toLowerCase()}`;
    const storedBalance = localStorage.getItem(storageKey);
    
    if (storedBalance) {
      // If we already have a balance, use it
      setTicketBalance(parseInt(storedBalance));
    } else {
      // Initialize with 100 tickets for new users
      localStorage.setItem(storageKey, '100');
      setTicketBalance(100);
    }

    // Listen for balance changes (from submissions and votes)
    const handleBalanceChange = () => {
      const updatedBalance = localStorage.getItem(storageKey);
      if (updatedBalance) {
        setTicketBalance(parseInt(updatedBalance));
      }
    };

    // Set up event listener for balance changes
    window.addEventListener('cropBalanceChanged', handleBalanceChange);

    return () => {
      window.removeEventListener('cropBalanceChanged', handleBalanceChange);
    };
  }, [address, isConnected]);

  // Function to update ticket balance (for use in other components)
  const updateTicketBalance = (newBalance: number) => {
    if (!address) return;
    
    const storageKey = `cropBalance_${EVENT_ID}_${address.toLowerCase()}`;
    localStorage.setItem(storageKey, newBalance.toString());
    setTicketBalance(newBalance);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('cropBalanceChanged'));
  };

  // Function to check if user has enough tickets
  const hasEnoughTickets = (amount: number): boolean => {
    return ticketBalance !== null && ticketBalance >= amount;
  };

  return { ticketBalance, updateTicketBalance, hasEnoughTickets };
}
