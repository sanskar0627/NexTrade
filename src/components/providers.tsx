'use client';

import { SessionProvider } from 'next-auth/react';
import { MarketDataProvider } from './providers/MarketDataProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MarketDataProvider>
        {children}
      </MarketDataProvider>
    </SessionProvider>
  );
}