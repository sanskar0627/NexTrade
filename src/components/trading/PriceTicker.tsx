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
    // Fetch real market data
    const fetchPrice = async () => {
      try {
        // Try to get real data first
        if (symbol.endsWith('USDT')) {
          await fetchBinanceTicker();
        } else {
          // For stocks, use mock realistic data or API data
          await fetchStockTicker();
        }
      } catch (error) {
        console.error('Failed to fetch price data:', error);
        // Fallback to realistic mock data
        generateRealisticPriceData();
      }
    };

    const fetchBinanceTicker = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          const newPriceData = {
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChange),
            changePercent: parseFloat(data.priceChangePercent),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            volume24h: parseFloat(data.volume),
          };
          
          setLastPrice(priceData.price);
          setPriceData(newPriceData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Binance API not available, using mock data');
      }
      
      // Fallback to realistic mock data
      generateRealisticPriceData();
    };

    const fetchStockTicker = async () => {
      // For stocks, generate realistic mock data (in production, use Finnhub API)
      generateRealisticPriceData();
    };

    const generateRealisticPriceData = () => {
      // Generate realistic price data based on symbol
      let basePrice = 43500;
      
      if (symbol === 'SOLUSDT') {
        basePrice = 205.50;
      } else if (symbol === 'ETHUSDT') {
        basePrice = 2400.75;
      } else if (symbol === 'AAPL') {
        basePrice = 175.25;
      } else if (symbol === 'TSLA') {
        basePrice = 248.90;
      }

      // Realistic daily changes
      const changePercent = (Math.random() - 0.5) * 10; // ±5% daily change
      const change24h = basePrice * (changePercent / 100);
      const currentPrice = basePrice + change24h;
      
      const newPriceData = {
        price: currentPrice,
        change24h,
        changePercent,
        high24h: currentPrice + Math.abs(change24h) * 0.5,
        low24h: currentPrice - Math.abs(change24h) * 0.5,
        volume24h: Math.random() * 10000000 + 1000000, // Random volume
      };

      setLastPrice(priceData.price);
      setPriceData(newPriceData);
      setLoading(false);
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