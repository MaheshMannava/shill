import { createConfig, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

// Define Corn Testnet
const cornTestnet = {
  id: 21000001,
  name: 'Corn Testnet',
  network: 'cornTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CORN',
    symbol: 'CORN',
  },
  rpcUrls: {
    public: { http: ['https://rpc.ankr.com/corn_testnet/262e1acff36317b60e329d705fa9973f7485e6da2dd06608f05eac473013a3c7'] }, // We'll replace this
    default: { http: ['https://rpc.ankr.com/corn_testnet/262e1acff36317b60e329d705fa9973f7485e6da2dd06608f05eac473013a3c7'] }, // We'll replace this
  },
  blockExplorers: {
    default: { name: 'Cornscan', url: 'https://scan.corn.money' },
  },
  testnet: true,
};

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [cornTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
  ],
);

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'CropCircle',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '4b6eecf33c435bb26b65993ce811ec6e', // We'll replace this
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});
