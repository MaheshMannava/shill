"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileToPinata } from "@/services/pinataService";
import { useContract } from "@/hooks/useContract";
import { NotEnoughTicketsDialog } from "./NotEnoughTicketsDialog";
import { LoadingScreen } from "./LoadingScreen";

interface CreateMemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
  eventId: string;
  onMemeSubmitted?: () => void;
}

export function CreateMemeDialog({
  open,
  onOpenChange,
  walletAddress = "0x348879...",
  eventId,
  onMemeSubmitted,
}: CreateMemeDialogProps) {
  const [formData, setFormData] = useState({
    tickerName: "",
    creatorName: "",
    missionStatement: "",
    image: null as File | null,
    isRug: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotEnoughTickets, setShowNotEnoughTickets] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { submitMeme } = useContract();

  const resetForm = () => {
    setFormData({
      tickerName: "",
      creatorName: "",
      missionStatement: "",
      image: null,
      isRug: false,
    });
    setUploadError("");
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      setUploadError("");

      // Validate form
      if (!formData.tickerName) {
        setUploadError("Please enter a ticker name");
        setIsUploading(false);
        return;
      }
      
      if (!formData.missionStatement) {
        setUploadError("Please enter a mission statement");
        setIsUploading(false);
        return;
      }
      
      if (!formData.image) {
        setUploadError("Please upload an image");
        setIsUploading(false);
        return;
      }

      // Upload image to IPFS
      console.log("Uploading image to IPFS:", formData.image);
      const ipfsHash = await uploadFileToPinata(formData.image);
      console.log("IPFS hash received:", ipfsHash);
      
      if (!ipfsHash) {
        setUploadError("Failed to upload image to IPFS");
        setIsUploading(false);
        return;
      }
      
      setIsUploading(false);
      setIsSubmitting(true);
      
      // Submit meme to smart contract
      console.log("Submitting meme to contract:", {
        eventId,
        name: formData.tickerName,
        ipfsHash,
        description: formData.missionStatement
      });
      
      const submitMemeResult = submitMeme(
        eventId,
        formData.tickerName,
        ipfsHash,
        formData.missionStatement
      );
      
      console.log("Submit meme result:", submitMemeResult);
      
      const { writeAsync } = submitMemeResult;
      
      const txHash = await writeAsync();
      console.log("Transaction submitted with hash:", txHash);
      
      // Wait for 2 seconds to allow transaction to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
      
      // Callback to refresh memes
      if (onMemeSubmitted) {
        console.log("Calling onMemeSubmitted to refresh memes");
        onMemeSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting meme:", error);
      if (error.message?.includes("Insufficient CROP")) {
        setShowNotEnoughTickets(true);
      } else {
        setUploadError(error.message || "Failed to submit meme");
      }
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (1MB max)
      if (file.size > 1024 * 1024) {
        setUploadError("File size exceeds 1MB limit");
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setUploadError("Only JPG, PNG, and GIF files are allowed");
        return;
      }
      
      setFormData((prev) => ({ ...prev, image: file }));
      setUploadError(""); // Clear any previous errors
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}>
        <DialogContent className="max-w-xl p-0 gap-0 bg-gray-100">
          {isUploading || isSubmitting ? (
            <LoadingScreen message={isUploading ? "Uploading to IPFS..." : "Submitting to blockchain..."} />
          ) : (
            <>
              {/* Header */}
              <div className="p-6 bg-[#FFFBE6]">
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-4"
                    onClick={() => onOpenChange(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-xl font-serif">MAKE A MEME</h2>
                    <p className="text-sm text-gray-600">COSTS 60 TICKETS</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {uploadError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                      {uploadError}
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      TICKER NAME *
                    </Label>
                    <Input
                      className="bg-white border-gray-200"
                      value={formData.tickerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tickerName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      CREATOR NAME *
                    </Label>
                    <Input
                      className="bg-white border-gray-200"
                      value={formData.creatorName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          creatorName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      MISSION STATEMENT *
                    </Label>
                    <Textarea
                      className="bg-white border-gray-200 min-h-[100px]"
                      value={formData.missionStatement}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          missionStatement: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">IMAGE *</Label>
                    <div className="flex gap-4">
                      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white min-h-[150px]">
                        {formData.image ? (
                          <div className="w-full text-center">
                            <img 
                              src={URL.createObjectURL(formData.image)} 
                              alt="Preview" 
                              className="max-h-[120px] mx-auto mb-2"
                            />
                            <p className="text-sm text-gray-600">{formData.image.name}</p>
                            <Button
                              variant="ghost"
                              className="text-sm text-red-600 mt-2"
                              onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <Button
                              variant="ghost"
                              className="text-sm text-gray-600"
                              onClick={() =>
                                document.getElementById("file-upload")?.click()
                              }
                            >
                              SELECT FILE
                            </Button>
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              accept="image/png,image/jpeg,image/gif"
                              onChange={handleFileSelect}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                              <p>• PNG, JPG, GIF</p>
                              <p>• 1MB MAXIMUM</p>
                              <p>• RECOMMENDED SIZE: 512 x 512 PX</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center w-24">
                        <span className="text-sm text-gray-600 mb-2">RUG?</span>
                        <Button
                          variant="outline"
                          className={`h-12 w-12 rounded-lg border-2 border-gray-300 p-0 ${formData.isRug ? "bg-green-50" : "bg-white"}`}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, isRug: !prev.isRug }))
                          }
                        >
                          {formData.isRug && (
                            <Check className="h-6 w-6 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="p-6 bg-[#FFFBE6]">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  onClick={handleSubmit}
                  disabled={!formData.tickerName || !formData.missionStatement || !formData.image}
                >
                  SUBMIT
                  <Upload className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <NotEnoughTicketsDialog 
        open={showNotEnoughTickets} 
        onOpenChange={setShowNotEnoughTickets}
      />
    </>
  );
}
