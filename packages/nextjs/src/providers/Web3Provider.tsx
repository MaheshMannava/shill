import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect } from 'wagmi/connectors';

const queryClient = new QueryClient();

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
const config = createConfig({
  chains: [cornTestnet],
  transports: {
    [cornTestnet.id]: http()
  },
  connectors: [
    walletConnect({
      projectId: '4b6eecf33c435bb26b65993ce811ec6e',
    })
  ]
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  console.log('Web3Provider mounting...'); // Debug log

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
