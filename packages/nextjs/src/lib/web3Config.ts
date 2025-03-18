import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Define Corn Testnet
export const cornTestnet = {
  id: 21000001,
  name: 'Corn Testnet',
  network: 'cornTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CORN',
    symbol: 'CORN',
  },
  rpcUrls: {
    default: { 
      http: ['https://rpc.ankr.com/corn_testnet/262e1acff36317b60e329d705fa9973f7485e6da2dd06608f05eac473013a3c7']
    },
    public: { 
      http: ['https://rpc.ankr.com/corn_testnet/262e1acff36317b60e329d705fa9973f7485e6da2dd06608f05eac473013a3c7']
    }
  },
  blockExplorers: {
    default: { name: 'Cornscan', url: 'https://scan.corn.money' }
  },
  testnet: true
} as const;

// Create wagmi config
export const config = createConfig({
  chains: [cornTestnet],
  transports: {
    [cornTestnet.id]: http()
  },
  connectors: [
    injected()
  ]
});
