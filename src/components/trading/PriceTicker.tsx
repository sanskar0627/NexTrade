'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { priceService } from '@/lib/price-service';

interface PriceTickerProps {
  symbol: string;
  initialPrice?: number;
}

interface PriceData {
  price: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

const PriceTicker = memo(function PriceTicker({ symbol, initialPrice = 0 }: PriceTickerProps) {
  const [priceData, setPriceData] = useState<PriceData>({
    price: initialPrice,
    change24h: 0,
    changePercent: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState(initialPrice);

  useEffect(() => {
    // Fetch real market data using unified price service
    const fetchPrice = async () => {
      try {
        const data = await priceService.getPriceData(symbol);
        
        setLastPrice(priceData.price);
        setPriceData({
          price: data.price,
          change24h: data.change24h,
          changePercent: data.changePercent,
          high24h: data.high24h,
          low24h: data.low24h,
          volume24h: data.volume24h,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        setLoading(false);
      }
    };

    fetchPrice();

    // Subscribe to real-time price updates
    const unsubscribe = priceService.subscribeToPriceUpdates(symbol, (data) => {
      setLastPrice(priceData.price);
      setPriceData({
        price: data.price,
        change24h: data.change24h,
        changePercent: data.changePercent,
        high24h: data.high24h,
        low24h: data.low24h,
        volume24h: data.volume24h,
      });
    });

    return unsubscribe;
  }, [symbol]);

  // Price change animation effect
  const priceChangeClass = 
    priceData.price > lastPrice ? 'text-green-600' :
    priceData.price < lastPrice ? 'text-red-600' :
    'text-gray-900';

  const changeClass = priceData.changePercent >= 0 ? 'text-green-600' : 'text-red-600';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{symbol}</h2>
          <div className={`text-3xl font-bold transition-colors duration-300 ${priceChangeClass}`}>
            ${priceData.price.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 8
            })}
          </div>
          <div className={`text-sm font-medium ${changeClass}`}>
            {priceData.changePercent >= 0 ? '+' : ''}
            {priceData.changePercent.toFixed(2)}% 
            <span className="ml-2">
              ({priceData.changePercent >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)})
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">24h High</div>
            <div className="font-medium text-gray-900 dark:text-white">${priceData.high24h.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">24h Low</div>
            <div className="font-medium text-gray-900 dark:text-white">${priceData.low24h.toFixed(2)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 dark:text-gray-400">24h Volume</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {priceData.volume24h.toLocaleString(undefined, {
                maximumFractionDigits: 0
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Price Sparkline Placeholder */}
      <div className="mt-4 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">📈 Live price updates</span>
      </div>
    </div>
  );
});

export default PriceTicker;