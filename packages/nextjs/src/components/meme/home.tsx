import { useState, useEffect } from "react";
import { Header } from "@/components/meme/Header";
import { CreateMemeButton } from "@/components/meme/CreateMemeButton";
import { MemeCard } from "@/components/meme/MemeCard";
import { HowToShillDialog } from "@/components/meme/HowToShillDialog";
import { getIpfsUrl } from "@/services/pinataService";
import { LoadingScreen } from "./LoadingScreen";
import { CONTRACTS } from "@/config/contracts";
import { useAccount } from "wagmi";

// Use the event ID from the contracts config
const EVENT_ID = CONTRACTS.CROP_CIRCLE.EVENT_ID;

// Define types for meme data
interface MemeDetails {
  id: number;
  name: string;
  description: string;
  imageHash: string;
  creator: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  exists: boolean;
  signature?: string;
  upvoters?: string[];
}

interface MemeData {
  id: number;
  symbol: string;
  description: string;
  imageUrl: string;
  ticketCount: number;
  upvotes: number;
  downvotes: number;
  creator: string;
  timestamp: number;
  isTopPerformer: boolean;
}

function Home() {
  const [showHowTo, setShowHowTo] = useState(true);
  const [memes, setMemes] = useState<MemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortByUpvotes, setSortByUpvotes] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { address } = useAccount();
  
  useEffect(() => {
    const fetchMemes = () => {
      setLoading(true);
      
      try {
        // Get memes from local storage
        const memesKey = `memes_${EVENT_ID}`;
        const storedMemes = localStorage.getItem(memesKey);
        const localMemes: MemeDetails[] = storedMemes ? JSON.parse(storedMemes) : [];
        
        if (localMemes.length === 0) {
          setMemes([]);
          setLoading(false);
          return;
        }
        
        // Map local memes to the format needed by the UI
        let formattedMemes: MemeData[] = localMemes.map(meme => ({
          id: meme.id,
          symbol: meme.name,
          description: meme.description,
          imageUrl: getIpfsUrl(meme.imageHash),
          ticketCount: meme.upvotes - meme.downvotes,
          upvotes: meme.upvotes,
          downvotes: meme.downvotes,
          creator: meme.creator,
          timestamp: meme.timestamp,
          isTopPerformer: false // Will update below
        }));
        
        // Sort memes
        if (sortByUpvotes) {
          formattedMemes.sort((a, b) => b.ticketCount - a.ticketCount);
        } else {
          formattedMemes.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        // Mark the top performer
        if (formattedMemes.length > 0) {
          const topMeme = formattedMemes.reduce((prev, current) => 
            (prev.ticketCount > current.ticketCount) ? prev : current
          );
          
          // Find the meme in the array and mark it
          const topIndex = formattedMemes.findIndex(m => m.id === topMeme.id);
          if (topIndex !== -1) {
            formattedMemes[topIndex].isTopPerformer = true;
          }
        }
        
        setMemes(formattedMemes);
      } catch (error) {
        console.error("Error fetching memes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemes();
    
    // Set up event listeners for meme submissions and votes
    const handleMemeSubmitted = () => {
      console.log("Meme submitted, refreshing data...");
      setRefreshTrigger(prev => prev + 1);
    };
    
    const handleVoteSubmitted = () => {
      console.log("Vote submitted, refreshing data...");
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('memeSubmitted', handleMemeSubmitted);
    window.addEventListener('voteSubmitted', handleVoteSubmitted);
    
    return () => {
      window.removeEventListener('memeSubmitted', handleMemeSubmitted);
      window.removeEventListener('voteSubmitted', handleVoteSubmitted);
    };
  }, [sortByUpvotes, refreshTrigger]);
  
  const handleMemeSubmitted = () => {
    console.log("Meme submitted, refreshing data...");
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <LoadingScreen message="Loading memes..." />;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-[url('https://storage.googleapis.com/tempo-public-images/github%7C71592960-1739296617275-phil_bg_6png')]">
      <Header />
      <CreateMemeButton eventId={EVENT_ID} onMemeSubmitted={handleMemeSubmitted} />
      
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-4 flex justify-end">
          <button 
            className={`px-4 py-2 mr-2 ${sortByUpvotes ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSortByUpvotes(true)}
          >
            Sort by Votes
          </button>
          <button 
            className={`px-4 py-2 ${!sortByUpvotes ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSortByUpvotes(false)}
          >
            Sort by Newest
          </button>
        </div>
        
        <div className="w-full max-w-4xl mx-auto bg-[#b3b3b3]">
          {memes.length > 0 ? (
            memes.map((meme) => (
              <MemeCard 
                key={meme.id} 
                {...meme} 
                className="bg-[#b6b6b6]" 
                eventId={EVENT_ID}
                memeId={meme.id}
                onVoteSuccess={handleMemeSubmitted}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-white">
              <h3 className="text-xl font-bold mb-2">No memes yet!</h3>
              <p className="mb-4">Be the first to create a meme for this event.</p>
            </div>
          )}
        </div>
      </div>
      <HowToShillDialog open={showHowTo} onOpenChange={setShowHowTo} />
    </div>
  );
}

export default Home;
