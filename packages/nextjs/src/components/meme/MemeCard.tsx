"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, Ticket } from "lucide-react";
import { MemeDialog } from "./MemeDialog";
import { useContract } from "@/hooks/useContract";

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
  const { voteMeme } = useContract();

  const handleVote = async (isUpvote: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsVoting(true);
      console.log(`Voting ${isUpvote ? 'up' : 'down'} for meme ${memeId} in event ${eventId}`);
      
      const { writeAsync } = voteMeme(eventId, memeId, isUpvote);
      const txHash = await writeAsync();
      
      console.log(`Vote transaction submitted: ${txHash}`);
      
      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh memes after voting
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error("Error voting:", error);
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
            </div>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2563EB] text-white hover:bg-blue-700 rounded-none"
                  onClick={(e) => handleVote(false, e)}
                  disabled={isVoting}
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
                  className="bg-orange-500 text-white hover:bg-orange-600 rounded-none"
                  onClick={(e) => handleVote(true, e)}
                  disabled={isVoting}
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
      />
    </>
  );
}
