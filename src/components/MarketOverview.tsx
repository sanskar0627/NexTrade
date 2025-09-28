'use client';

import { useState, useEffect } from 'react';
import { AssetLogo } from '@/components/ui/AssetLogo';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketTicker {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
}

interface MarketOverviewProps {
  className?: string;
}

export default function MarketOverview({ className = '' }: MarketOverviewProps) {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Major crypto symbols to track
  const cryptoSymbols = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 
    'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'MATICUSDT'
  ];

  useEffect(() => {
    fetchMarketData();
    
    // Update every 10 seconds
    const interval = setInterval(fetchMarketData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch data for all crypto symbols at once
      const promises = cryptoSymbols.map(symbol =>
        fetch(`/api/binance?symbol=${symbol}&type=ticker`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const results = await Promise.all(promises);
      const validTickers = results.filter(ticker => ticker !== null);
      
      if (validTickers.length > 0) {
        setTickers(validTickers);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string, symbol: string) => {
    const numPrice = parseFloat(price);
    if (numPrice < 1) {
      return numPrice.toFixed(6);
    } else if (numPrice < 100) {
      return numPrice.toFixed(4);
    } else {
      return numPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };

  const formatVolume = (volume: string) => {
    const numVolume = parseFloat(volume);
    if (numVolume >= 1e9) {
      return `${(numVolume / 1e9).toFixed(1)}B`;
    } else if (numVolume >= 1e6) {
      return `${(numVolume / 1e6).toFixed(1)}M`;
    } else if (numVolume >= 1e3) {
      return `${(numVolume / 1e3).toFixed(1)}K`;
    }
    return numVolume.toFixed(0);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Market Overview</h3>
          <Activity className="h-5 w-5 text-gray-400 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Live Market Data
        </h3>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          {lastUpdate && (
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {tickers.map((ticker) => {
          const isPositive = parseFloat(ticker.priceChangePercent) >= 0;
          
          return (
            <div 
              key={ticker.symbol}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
              onClick={() => window.location.href = `/trade/${ticker.symbol}`}
            >
              <div className="flex items-center space-x-3">
                <AssetLogo symbol={ticker.symbol} size={32} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {ticker.symbol.replace('USDT', '')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Vol: {formatVolume(ticker.volume)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  ${formatPrice(ticker.lastPrice, ticker.symbol)}
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {isPositive ? '+' : ''}
                  {parseFloat(ticker.priceChangePercent).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tickers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Loading market data...</p>
        </div>
      )}
    </div>
  );
}