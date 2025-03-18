"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, Ticket } from "lucide-react";
import { MemeDialog } from "./MemeDialog";
import { useContract } from "@/hooks/useContract";
import { useAccount } from "wagmi";
import { useTicketBalance } from "@/hooks/useTicketBalance";
import { CONTRACTS } from "@/config/contracts";

export interface MemeCardProps {
  id: number;
  symbol: string;
  description: string;
  imageUrl: string;
  ticketCount: number;
  upvotes: number;
  downvotes: number;
  creator: string;
  timestamp: number;
  isTopPerformer?: boolean;
  eventId: string;
  memeId: number;
  onVoteSuccess?: () => void;
  className?: string;
}

export function MemeCard({
  id,
  symbol,
  description,
  imageUrl,
  ticketCount,
  upvotes,
  downvotes,
  creator,
  timestamp,
  isTopPerformer = false,
  eventId,
  memeId,
  onVoteSuccess,
  className,
}: MemeCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const { voteMeme } = useContract();
  const { address } = useAccount();
  const { ticketBalance } = useTicketBalance();

  // Check if the user has already voted on this meme
  useEffect(() => {
    if (!address) return;
    
    const votesKey = `votes_${eventId}_${memeId}_${address.toLowerCase()}`;
    const savedVote = localStorage.getItem(votesKey);
    setUserVote(savedVote);
  }, [eventId, memeId, address]);

  // Check if user is the creator
  const isCreator = address && creator && address.toLowerCase() === creator.toLowerCase();

  const handleVote = async (isUpvote: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is creator - show message if they try to vote on their own meme
    if (isCreator) {
      alert("You cannot vote on your own meme");
      return;
    }
    
    // Check if user is connected
    if (!address) {
      alert("Please connect your wallet to vote");
      return;
    }
    
    // Check if user has already voted the same way
    if ((isUpvote && userVote === "up") || (!isUpvote && userVote === "down")) {
      alert(`You've already voted ${isUpvote ? "up" : "down"} on this meme`);
      return;
    }
    
    // Check if user has enough tickets for a new vote (changing vote doesn't cost)
    if (!userVote && (ticketBalance === null || ticketBalance < 1)) {
      alert("You don't have enough tickets to vote. Voting costs 1 ticket.");
      return;
    }
    
    try {
      setIsVoting(true);
      console.log(`Voting ${isUpvote ? 'up' : 'down'} for meme ${memeId} in event ${eventId}`);
      
      const { writeAsync } = voteMeme(eventId, memeId, isUpvote);
      const txHash = await writeAsync();
      
      console.log(`Vote transaction submitted: ${txHash}`);
      
      // Update local user vote state
      if (address) {
        const votesKey = `votes_${eventId}_${memeId}_${address.toLowerCase()}`;
        const currentVote = isUpvote ? "up" : "down";
        localStorage.setItem(votesKey, currentVote);
        setUserVote(currentVote);
      }
      
      // Refresh memes after voting
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert(error instanceof Error ? error.message : "Error voting on meme");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <Card
        className={`w-full bg-[#FFFFFF] shadow-md p-4 mb-4 cursor-pointer hover:bg-gray-50 rounded-none ${className || ''}`}
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex gap-4 bg-white">
          <img
            src={imageUrl}
            alt={symbol}
            className="w-24 h-24 object-cover rounded-none bg-[url('./src/cornim11 1.png')]"
          />
          <div className="flex-1 font-serif">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">${symbol}</h3>
              {isCreator && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Creator</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${userVote === "down" 
                    ? "bg-blue-700 text-white" 
                    : "bg-[#2563EB] text-white hover:bg-blue-700"} rounded-none`}
                  onClick={(e) => handleVote(false, e)}
                  disabled={isVoting || isCreator}
                  title={isCreator ? "Cannot vote on your own meme" : ""}
                >
                  <ThumbsDown className="h-4 w-4" />
                  {downvotes > 0 && <span className="ml-1">{downvotes}</span>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border border-[#E6E6E6] rounded-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ticket className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${userVote === "up" 
                    ? "bg-orange-700 text-white" 
                    : "bg-orange-500 text-white hover:bg-orange-600"} rounded-none`}
                  onClick={(e) => handleVote(true, e)}
                  disabled={isVoting || isCreator}
                  title={isCreator ? "Cannot vote on your own meme" : ""}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {upvotes > 0 && <span className="ml-1">{upvotes}</span>}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {isTopPerformer && <span className="text-yellow-500">👑</span>}
                <Ticket className="h-4 w-4 text-yellow-500" />
                <span className="font-mono font-bold">{ticketCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <MemeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        symbol={symbol}
        description={description}
        imageUrl={imageUrl}
        ticketCount={ticketCount}
        upvotes={upvotes}
        downvotes={downvotes}
        creator={creator}
        timestamp={timestamp}
        eventId={eventId}
        memeId={memeId}
        onVoteSuccess={onVoteSuccess}
        userVote={userVote}
        isCreator={isCreator}
      />
    </>
  );
}
