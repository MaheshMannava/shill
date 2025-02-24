export const CROPCIRCLE_CONTRACT = {
  address: "0xE3Eb826c2545A75fd1D4254738BbF1EF3125C577",
  network: "cornTestnet",
  functions: {
    // Read functions
    events: { type: "read", args: ["bytes32"] },
    getMemesSorted: { type: "read", args: ["bytes32", "bool"] },
    tokenBalances: { type: "read", args: ["address"] },
    getWinningMeme: { type: "read", args: ["bytes32"] },
    
    // Write functions
    submitMeme: { 
      type: "write", 
      args: ["bytes32", "string", "string", "string"],
      cost: 60 // CROP tokens required
    },
    vote: { 
      type: "write", 
      args: ["bytes32", "uint256", "bool"],
      cost: 1 // CROP token per vote
    }
  },
  events: {
    MemeSubmitted: ["bytes32", "uint256", "address", "string", "string", "string"],
    VoteCast: ["bytes32", "uint256", "address", "bool"],
    EventCreated: ["bytes32", "uint256", "string"]
  }
};
