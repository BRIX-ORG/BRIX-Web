'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, WagmiProvider } from 'wagmi';
import type { Chain } from 'wagmi/chains';
import { mainnet, polygon, arbitrum, optimism, sepolia } from 'wagmi/chains';
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    trustWallet,
    braveWallet,
    metaMaskWallet,
    rainbowWallet,
    coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';

// Polygon Amoy Testnet
// Polygon Amoy Testnet
const amoy: Chain = {
    id: 80002,
    name: 'Polygon Amoy',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'POL',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://polygon-amoy.drpc.org'],
        },
        public: {
            http: ['https://polygon-amoy.drpc.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'PolygonScan',
            url: 'https://amoy.polygonscan.com',
        },
    },
    testnet: true,
};

const connectors =
    typeof window !== 'undefined'
        ? connectorsForWallets(
              [
                  {
                      groupName: 'Recommended',
                      wallets: [
                          rainbowWallet,
                          metaMaskWallet,
                          trustWallet,
                          braveWallet,
                          coinbaseWallet,
                      ],
                  },
              ],
              {
                  appName: 'BRIX',
                  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID',
              },
          )
        : [];

export const config =
    typeof window !== 'undefined'
        ? createConfig({
              connectors,
              chains: [polygon, amoy, mainnet, arbitrum, optimism, sepolia],
              transports: {
                  [polygon.id]: http(),
                  [amoy.id]: http(),
                  [mainnet.id]: http(),
                  [arbitrum.id]: http(),
                  [optimism.id]: http(),
                  [sepolia.id]: http(),
              },
              ssr: true,
          })
        : null;

// Type declaration for wagmi v3
declare module 'wagmi' {
    interface Register {
        config: typeof config;
    }
}

interface Web3ProviderProps {
    children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 10 * 1000,
                    },
                },
            }),
    );

    if (!mounted || !config) {
        return <>{children}</>;
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#00eeff',
                        accentColorForeground: 'black',
                        borderRadius: 'medium',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                    coolMode
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
