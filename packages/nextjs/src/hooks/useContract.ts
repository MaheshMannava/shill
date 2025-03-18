import { useContractRead, useWriteContract, useWalletClient, useConfig } from 'wagmi';
import { CROPCIRCLE_CONTRACT } from "../types/contracts";
import { CONTRACTS } from '@/config/contracts';
import { parseEther } from 'viem';

// Define the ABI for the contract functions we need
const ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_eventId",
        "type": "bytes32"
      }
    ],
    "name": "events",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "startTime", "type": "uint256" },
          { "internalType": "uint256", "name": "endTime", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct CropCircle.Event",
        "name": "",
        "type": "tuple"
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
        "internalType": "bool",
        "name": "_sortByUpvotes",
        "type": "bool"
      }
    ],
    "name": "getMemesSorted",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "tokenBalances",
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
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_eventId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_memeId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_isUpvote",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "internalType": "uint256",
        "name": "_memeId",
        "type": "uint256"
      }
    ],
    "name": "getMemeDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "imageHash", "type": "string" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "upvotes", "type": "uint256" },
          { "internalType": "uint256", "name": "downvotes", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct CropCircle.Meme",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Ensure the contract address is in the correct format
const CONTRACT_ADDRESS = CONTRACTS.CROP_CIRCLE.ADDRESS as `0x${string}`;

export const useContract = () => {
  const { data: walletClient } = useWalletClient();
  const config = useConfig();
  const { writeContractAsync, isPending, isSuccess, isError, error } = useWriteContract();

  const getEventDetails = (eventId: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'events',
      args: [eventId as `0x${string}`],
    });
  };

  const getMemes = (eventId: string, sortByUpvotes: boolean = true) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'getMemesSorted',
      args: [eventId as `0x${string}`, sortByUpvotes],
    });
  };

  const getTokenBalance = (address: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'tokenBalances',
      args: [address as `0x${string}`],
    });
  };

  const getMemeDetails = (eventId: string, memeId: number) => {
    return useContractRead({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'getMemeDetails',
      args: [eventId as `0x${string}`, BigInt(memeId)],
    });
  };

  // Function to read contract data dynamically with proper type handling
  // Note: This function is not fully implemented for our local-storage approach
  const readContract = <T extends 'events' | 'getMemesSorted' | 'tokenBalances' | 'getMemeDetails'>(
    functionName: T,
    ...args: any[]
  ) => {
    console.warn("readContract is not fully implemented for local storage mode");
    // This is a simplified implementation that will avoid type errors
    return {
      data: null,
      isError: false,
      isLoading: false,
      error: null
    };
  };

  const submitMeme = (eventId: string, name: string, imageHash: string, description: string) => {
    return {
      writeAsync: async () => {
        if (!walletClient) {
          throw new Error("Wallet not available");
        }

        const address = walletClient.account?.address;
        if (!address) {
          throw new Error("No account connected");
        }

        // Get the current crop balance from local storage
        const storageKey = `cropBalance_${eventId}_${address.toLowerCase()}`;
        const storedBalance = localStorage.getItem(storageKey);
        const currentBalance = storedBalance ? parseInt(storedBalance) : 100; // Default 100 if not set

        // Check if user has enough crop tokens for submission
        if (currentBalance < 60) {
          throw new Error("Insufficient CROP");
        }

        // Deduct the submission cost from the balance
        const newBalance = currentBalance - 60;
        localStorage.setItem(storageKey, newBalance.toString());

        // Generate a signature instead of a transaction
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Submit Meme: ${name}\nIPFS: ${imageHash}\nDescription: ${description}\nEvent: ${eventId}\nTimestamp: ${timestamp}`;
        
        // Sign the message - this doesn't require gas
        const signature = await walletClient.signMessage({ 
          message,
          account: walletClient.account
        });

        // Store the meme data in local storage
        const memesKey = `memes_${eventId}`;
        const storedMemes = localStorage.getItem(memesKey);
        const memes = storedMemes ? JSON.parse(storedMemes) : [];

        // Generate a unique ID for the meme
        const memeId = memes.length > 0 ? Math.max(...memes.map((m: any) => m.id)) + 1 : 1;

        // Add the new meme to the array
        memes.push({
          id: memeId,
          name,
          imageHash,
          description,
          creator: address,
          upvotes: 0,
          downvotes: 0,
          timestamp,
          signature,
          exists: true
        });

        // Save the updated memes array back to local storage
        localStorage.setItem(memesKey, JSON.stringify(memes));

        // Emit custom event to notify other components
        window.dispatchEvent(new CustomEvent('memeSubmitted', { 
          detail: { eventId, memeId }
        }));

        // Return the memeId as the transaction hash
        return `meme_${memeId}`;
      },
      isLoading: isPending,
      isSuccess,
      isError,
      error
    };
  };

  const voteMeme = (eventId: string, memeId: number, isUpvote: boolean) => {
    return {
      writeAsync: async () => {
        if (!walletClient) {
          throw new Error("Wallet not available");
        }

        const address = walletClient.account?.address;
        if (!address) {
          throw new Error("No account connected");
        }

        // Get the current crop balance from local storage
        const storageKey = `cropBalance_${eventId}_${address.toLowerCase()}`;
        const storedBalance = localStorage.getItem(storageKey);
        const currentBalance = storedBalance ? parseInt(storedBalance) : 100;

        // Get the memes from local storage
        const memesKey = `memes_${eventId}`;
        const storedMemes = localStorage.getItem(memesKey);
        const memes = storedMemes ? JSON.parse(storedMemes) : [];

        // Find the meme to vote on
        const memeIndex = memes.findIndex((m: any) => m.id === memeId);
        if (memeIndex === -1) {
          throw new Error("Meme not found");
        }

        const meme = memes[memeIndex];
        
        // Check if meme creator is trying to vote on their own meme
        if (meme.creator.toLowerCase() === address.toLowerCase()) {
          throw new Error("Cannot vote on your own meme");
        }

        // Get user votes for this meme
        const votesKey = `votes_${eventId}_${memeId}_${address.toLowerCase()}`;
        const userVote = localStorage.getItem(votesKey);
        
        // Handle changing votes
        if (userVote) {
          // User already voted - check if they're trying to change their vote
          const previousVote = userVote === "up";
          
          // If trying to vote the same way, throw an error
          if (previousVote === isUpvote) {
            throw new Error(`You've already voted ${isUpvote ? 'up' : 'down'} on this meme`);
          }
          
          // User is changing their vote, charge a CROP token again
          // Check if user has enough CROP tokens
          if (currentBalance < 1) {
            throw new Error("Insufficient CROP");
          }
          
          // Deduct the voting cost for changing the vote
          const newBalance = currentBalance - 1;
          localStorage.setItem(storageKey, newBalance.toString());
          
          // Remove the previous vote
          if (previousVote) {
            // Previous vote was upvote, remove it
            meme.upvotes = Math.max(0, meme.upvotes - 1);
            
            // Remove from upvoters array if it exists
            if (meme.upvoters) {
              meme.upvoters = meme.upvoters.filter((voter: string) => 
                voter.toLowerCase() !== address.toLowerCase()
              );
            }
          } else {
            // Previous vote was downvote, remove it
            meme.downvotes = Math.max(0, meme.downvotes - 1);
          }
          
          // Add the new vote
          if (isUpvote) {
            meme.upvotes += 1;
            if (!meme.upvoters) {
              meme.upvoters = [];
            }
            meme.upvoters.push(address);
          } else {
            meme.downvotes += 1;
          }
          
          // Update the vote record
          localStorage.setItem(votesKey, isUpvote ? "up" : "down");
        } else {
          // New vote - check if user has enough CROP tokens
          if (currentBalance < 1) {
            throw new Error("Insufficient CROP");
          }
          
          // Deduct the voting cost (only for new votes)
          const newBalance = currentBalance - 1;
          localStorage.setItem(storageKey, newBalance.toString());
          
          // Record the vote
          localStorage.setItem(votesKey, isUpvote ? "up" : "down");
          
          // Update the meme's vote count
          if (isUpvote) {
            meme.upvotes += 1;
            if (!meme.upvoters) {
              meme.upvoters = [];
            }
            meme.upvoters.push(address);
          } else {
            meme.downvotes += 1;
          }
        }

        // Save the updated memes back to local storage
        memes[memeIndex] = meme;
        localStorage.setItem(memesKey, JSON.stringify(memes));

        // Generate a signature for the vote
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `Vote on Meme: ${memeId}\nEvent: ${eventId}\nVote: ${isUpvote ? 'up' : 'down'}\nTimestamp: ${timestamp}`;
        
        // Sign the message
        const signature = await walletClient.signMessage({ 
          message,
          account: walletClient.account
        });

        // Emit events for components to update
        window.dispatchEvent(new CustomEvent('voteSubmitted', { 
          detail: { eventId, memeId, isUpvote }
        }));
        window.dispatchEvent(new CustomEvent('cropBalanceChanged'));

        return signature;
      },
      isLoading: isPending,
      isSuccess,
      isError,
      error
    };
  };

  return {
    getEventDetails,
    getMemes,
    getTokenBalance,
    getMemeDetails,
    readContract,
    submitMeme,
    voteMeme
  };
};
