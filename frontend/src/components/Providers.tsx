'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from '@/lib/wagmi';
import { Header } from './Header';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <InnerProviders>{children}</InnerProviders>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-0 -left-32 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>
      {mounted && <Header />}
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );

  return content;
}
