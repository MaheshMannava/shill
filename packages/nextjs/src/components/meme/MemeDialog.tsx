"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogPortal } from "@radix-ui/react-dialog";
import { ArrowLeft, Ticket, ThumbsDown, ThumbsUp } from "lucide-react";
import { useContract } from "@/hooks/useContract";
import { formatDistanceToNow } from "date-fns";

export interface MemeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  symbol?: string;
  ticketCount?: number;
  imageUrl?: string;
  description?: string;
  upvotes?: number;
  downvotes?: number;
  creator?: string;
  timestamp?: number;
  eventId?: string;
  memeId?: number;
  onVoteSuccess?: () => void;
}

interface Comment {
  address: string;
  text: string;
}

const comments: Comment[] = [
  {
    address: "0x3849504xcw3932...",
    text: "Whoa, this meme is tight!",
  },
  {
    address: "0x943r3299dfv9d51...",
    text: "Interesting choice to change the letter M to N.",
  },
  {
    address: "0x8430448jjn52851...",
    text: "This looks like a promising investment",
  },
  {
    address: "0x63890472jn292m1...",
    text: "PINP is the strategic reserve chosen by Mr. Trump!",
  },
];

export function MemeDialog({
  open = false,
  onOpenChange,
  symbol = "PINP",
  ticketCount = 8045,
  imageUrl = "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6",
  description = "The coin that makes you a true individual. This should be a max of 3 lines of text...",
  upvotes = 0,
  downvotes = 0,
  creator = "0x0000000000000000000000000000000000000000" as string,
  timestamp = Date.now(),
  eventId = "",
  memeId = 0,
  onVoteSuccess,
}: MemeDialogProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { voteMeme } = useContract();
  
  const handleVote = async (isUpvote: boolean) => {
    if (!eventId || !memeId) return;
    
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
  
  // Format the timestamp to a human-readable format
  const timeAgo = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : '';
  
  // Truncate the creator address for display
  const truncatedCreator = creator ? 
    `${creator.substring(0, 6)}...${creator.substring(creator.length - 4)}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[440px] p-0 gap-0 bg-[#E6E6E6] border-0 rounded-none">
          {/* Top yellow strip */}

          {/* Main content area */}
          <div className="m-3 bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">
            {/* Header with back button and symbol */}
            <div className="flex items-center p-3 border-b border-[#E6E6E6]">
              <button
                onClick={() => onOpenChange?.(false)}
                className="mr-3 hover:bg-black/5 p-1 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-xl font-serif">${symbol}</span>
            </div>

            {/* Meme content */}
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <img
                  src={imageUrl}
                  alt={symbol}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <button 
                        className="bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1"
                        onClick={() => handleVote(false)}
                        disabled={isVoting}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {downvotes > 0 && <span>{downvotes}</span>}
                      </button>
                      <button className="border border-gray-200 px-4 py-1 rounded">
                        <Ticket className="h-4 w-4" />
                      </button>
                      <button 
                        className="bg-orange-500 text-white px-4 py-1 rounded flex items-center gap-1"
                        onClick={() => handleVote(true)}
                        disabled={isVoting}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {upvotes > 0 && <span>{upvotes}</span>}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-yellow-500" />
                      <span className="font-mono font-bold">{ticketCount}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                  <div className="text-xs text-gray-400 mt-1 flex justify-between">
                    <span>Created by: {truncatedCreator}</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Comments section */}
              <div className="border-t border-[#E6E6E6] pt-2">
                <div className="text-xs text-gray-500 mb-2">
                  Comments
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {comments.map((comment, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-blue-500">
                        {comment.address}
                      </span>
                      <span className="text-xs">{comment.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with input */}
            <div className="p-4 border-t border-[#E6E6E6] flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-[#E6E6E6] text-xs"
              />
              <button className="bg-blue-600 text-white px-6 py-2 font-serif">
                SEND
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
