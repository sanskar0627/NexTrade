'use client';

import { useState, useEffect } from 'react';

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

export default function PriceTicker({ symbol, initialPrice = 0 }: PriceTickerProps) {
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
    // Fetch initial price data
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/market?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          setPriceData({
            price: data.price,
            change24h: data.change24h,
            changePercent: data.changePercent,
            high24h: data.high24h,
            low24h: data.low24h,
            volume24h: data.volume24h,
          });
          setLastPrice(data.price);
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // Set up price updates (in a real app, this would be WebSocket)
    const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{symbol}</h2>
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
            <div className="text-gray-500">24h High</div>
            <div className="font-medium">${priceData.high24h.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">24h Low</div>
            <div className="font-medium">${priceData.low24h.toFixed(2)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500">24h Volume</div>
            <div className="font-medium">
              {priceData.volume24h.toLocaleString(undefined, {
                maximumFractionDigits: 0
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Price Sparkline Placeholder */}
      <div className="mt-4 h-12 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500 text-sm">📈 Price chart placeholder</span>
      </div>
    </div>
  );
}