import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';

// Import only the ABI types we need
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "userCropBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_eventId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_imageHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "submitMeme",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export function useTicketBalance() {
  const { address, isConnected } = useAccount();
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);

  // Read the current balance
  const { data: balance, error } = useContractRead({
    address: CONTRACTS.CROP_CIRCLE.ADDRESS,
    abi: ABI,
    functionName: 'userCropBalance',
    args: [address || '0x0000000000000000000000000000000000000000', CONTRACTS.CROP_CIRCLE.EVENT_ID],
    enabled: isConnected && !!address,
    watch: true,
  });

  // If balance is 0, submit a dummy meme to initialize balance
  const { write: submitMeme } = useContractWrite({
    address: CONTRACTS.CROP_CIRCLE.ADDRESS,
    abi: ABI,
    functionName: 'submitMeme',
  });

  useEffect(() => {
    try {
      if (!isConnected) {
        setTicketBalance(null); // No balance shown when disconnected
        return;
      }

      if (error) {
        console.error('Error reading ticket balance:', error);
        setTicketBalance(100); // Fallback to 100 on error while connected
        return;
      }

      if (balance !== undefined) {
        const currentBalance = Number(balance);
        if (currentBalance === 0) {
          // If balance is 0, submit a dummy meme to initialize balance to 100
          submitMeme({
            args: [
              CONTRACTS.CROP_CIRCLE.EVENT_ID,
              'Initial Meme',
              'QmInitial',
              'Initial meme to get CROP tokens'
            ],
          });
          setTicketBalance(100); // Show 100 while transaction is pending
        } else {
          setTicketBalance(currentBalance);
        }
      }
    } catch (err) {
      console.error('Error processing ticket balance:', err);
      setTicketBalance(100); // Fallback to 100 on error while connected
    }
  }, [balance, isConnected, error, submitMeme]);

  return ticketBalance;
}
