import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "solidity-coverage";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "cornTestnet": {
      url: process.env.CORN_RPC_URL || "https://testnet-rpc.usecorn.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 21000001
    },
  },
  etherscan: {
    apiKey: {
      "cornTestnet": process.env.CORN_ETHERSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "cornTestnet",
        chainId: 21000001,
        urls: {
          apiURL: "https://explorer-corn-testnet-l8rm17uloq.t.conduit.xyz/api",
          browserURL: "https://explorer-corn-testnet-l8rm17uloq.t.conduit.xyz"
        }
      }
    ]
  }
};

export default config;