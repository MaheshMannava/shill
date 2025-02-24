import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { CROPCIRCLE_CONTRACT } from "../types/contracts";

export const useContract = () => {
  const readContract = (functionName: string, args?: any[]) => {
    return useScaffoldContractRead({
      contractName: "CropCircle",
      functionName,
      args: args || []
    });
  };

  const writeContract = (functionName: string, args?: any[]) => {
    return useScaffoldContractWrite({
      contractName: "CropCircle",
      functionName,
      args: args || []
    });
  };

  const getEventDetails = (eventId: string) => {
    return readContract("events", [eventId]);
  };

  const getMemes = (eventId: string, sortByUpvotes: boolean = true) => {
    return readContract("getMemesSorted", [eventId, sortByUpvotes]);
  };

  const getTokenBalance = (address: string) => {
    return readContract("tokenBalances", [address]);
  };

  const submitMeme = (eventId: string, name: string, imageHash: string, description: string) => {
    return writeContract("submitMeme", [eventId, name, imageHash, description]);
  };

  const voteMeme = (eventId: string, memeId: number, isUpvote: boolean) => {
    return writeContract("vote", [eventId, memeId, isUpvote]);
  };

  return {
    getEventDetails,
    getMemes,
    getTokenBalance,
    submitMeme,
    voteMeme,
  };
};
