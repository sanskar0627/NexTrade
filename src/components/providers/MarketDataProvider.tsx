'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { MarketDataManager } from '@/lib/market-data';

interface MarketDataContextType {
  subscribePrice: (symbol: string, callback: (price: number) => void) => void;
  subscribeOrderBook: (symbol: string, callback: (orderBook: any) => void) => void;
  unsubscribe: (symbol: string) => void;
}

const MarketDataContext = createContext<MarketDataContextType | null>(null);

interface MarketDataProviderProps {
  children: ReactNode;
}

export function MarketDataProvider({ children }: MarketDataProviderProps) {
  const managerRef = useRef<MarketDataManager | null>(null);

  useEffect(() => {
    // Initialize market data manager
    const finnhubApiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    managerRef.current = new MarketDataManager(finnhubApiKey);

    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
      }
    };
  }, []);

  const subscribePrice = (symbol: string, callback: (price: number) => void) => {
    if (managerRef.current) {
      managerRef.current.subscribePrice(symbol, callback);
    }
  };

  const subscribeOrderBook = (symbol: string, callback: (orderBook: any) => void) => {
    if (managerRef.current) {
      managerRef.current.subscribeOrderBook(symbol, callback);
    }
  };

  const unsubscribe = (symbol: string) => {
    if (managerRef.current) {
      managerRef.current.unsubscribe(symbol);
    }
  };

  const value: MarketDataContextType = {
    subscribePrice,
    subscribeOrderBook,
    unsubscribe,
  };

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
}