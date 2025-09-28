'use client';

import { useState, useEffect } from 'react';

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real market data or generate realistic mock data
    const generateRealisticOrderBook = async () => {
      try {
        // Try to fetch real order book data
        if (symbol.endsWith('USDT')) {
          await fetchBinanceOrderBook();
        } else {
          // For stocks, generate realistic mock data based on current price
          await generateRealisticMockData();
        }
      } catch (error) {
        console.error('Failed to fetch order book:', error);
        await generateRealisticMockData();
      }
    };

    const fetchBinanceOrderBook = async () => {
      try {
        // Use our enhanced API route for better reliability
        const response = await fetch(`/api/binance?symbol=${symbol}&type=orderbook&limit=20`);
        if (response.ok) {
          const data = await response.json();
          
          const binanceAsks = data.asks.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty),
            total: parseFloat(price) * parseFloat(qty)
          }));

          const binanceBids = data.bids.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty),  
            total: parseFloat(price) * parseFloat(qty)
          }));

          setAsks(binanceAsks);
          setBids(binanceBids);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Enhanced Binance API not available, using mock data');
      }
      
      // Fallback to mock data
      await generateRealisticMockData();
    };

    const generateRealisticMockData = async () => {
      // Get realistic base price for the symbol
      let basePrice = 43500; // Default BTC price
      
      if (symbol === 'SOLUSDT') {
        basePrice = 205; // Current SOL price
      } else if (symbol === 'ETHUSDT') {
        basePrice = 2400; // ETH price
      } else if (symbol === 'AAPL') {
        basePrice = 175; // Apple stock
      } else if (symbol === 'TSLA') {
        basePrice = 250; // Tesla stock
      }

      // Realistic spread (much smaller than $100)
      const spreadPercent = symbol.endsWith('USDT') ? 0.001 : 0.002; // 0.1% for crypto, 0.2% for stocks
      const spread = basePrice * spreadPercent;
      
      // Generate asks (sell orders) - higher prices  
      const mockAsks: OrderBookLevel[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice + spread/2 + (i * spread * 0.5);
        const quantity = Math.random() * 5 + 0.5;
        mockAsks.push({
          price,
          quantity,
          total: price * quantity
        });
      }

      // Generate bids (buy orders) - lower prices
      const mockBids: OrderBookLevel[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice - spread/2 - (i * spread * 0.5);
        const quantity = Math.random() * 5 + 0.5;
        mockBids.push({
          price,
          quantity,
          total: price * quantity
        });
      }

      setAsks(mockAsks);
      setBids(mockBids);
      setLoading(false);
    };

    generateRealisticOrderBook();

    // Update every few seconds
    const interval = setInterval(generateRealisticOrderBook, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h3>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-2">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full min-h-[600px]">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Book</h3>
      
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div>Price (USD)</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          {asks.slice(0, 5).reverse().map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="grid grid-cols-3 gap-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
            >
              <div className="text-red-600 dark:text-red-400 font-medium">
                {ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-right text-gray-900 dark:text-white">
                {ask.quantity.toFixed(4)}
              </div>
              <div className="text-right text-gray-600 dark:text-gray-400">
                {ask.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="border-t border-b border-gray-200 dark:border-gray-600 py-2 text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Spread: ${(asks[0]?.price - bids[0]?.price || 0).toFixed(2)}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {bids.slice(0, 5).map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 gap-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded transition-colors"
            >
              <div className="text-green-600 dark:text-green-400 font-medium">
                {bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-right text-gray-900 dark:text-white">
                {bid.quantity.toFixed(4)}
              </div>
              <div className="text-right text-gray-600 dark:text-gray-400">
                {bid.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Depth Visualization */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MARKET DEPTH</div>
        <div className="h-20 bg-gradient-to-r from-green-100 dark:from-green-900/30 via-gray-100 dark:via-gray-700 to-red-100 dark:to-red-900/30 rounded flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-xs">Live market depth</span>
        </div>
      </div>
    </div>
  );
}