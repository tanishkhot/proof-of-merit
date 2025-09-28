'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { useState, useEffect } from 'react';

// Flow testnet configuration
const flowTestnet = {
  id: 545,
  name: 'Flow Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Flowscan', url: 'https://testnet.flowscan.org' },
  },
  testnet: true,
} as const;
import { http } from 'viem';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Create query client outside component to prevent re-initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configure chains for your app - only on client side
  const getConfig = () => {
    if (typeof window === 'undefined') {
      // Return a minimal config for SSR
      return null;
    }
    
    return getDefaultConfig({
      appName: 'Crucible',
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id',
      chains: [flowTestnet, mainnet, sepolia, hardhat],
      transports: {
        [flowTestnet.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [hardhat.id]: http(),
      },
      ssr: true, // Enable SSR support
    });
  };

  const config = getConfig();

  // During SSR or before mount, render children without providers
  if (!mounted || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}