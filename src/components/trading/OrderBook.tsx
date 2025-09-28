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
    // Generate mock order book data (in real app, this would come from WebSocket)
    const generateMockOrderBook = () => {
      const basePrice = 43500; // Mock BTC price
      const spread = 50;
      
      // Generate asks (sell orders) - higher prices
      const mockAsks: OrderBookLevel[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice + spread + (i * 25);
        const quantity = Math.random() * 2 + 0.1;
        mockAsks.push({
          price,
          quantity,
          total: price * quantity
        });
      }

      // Generate bids (buy orders) - lower prices
      const mockBids: OrderBookLevel[] = [];
      for (let i = 0; i < 10; i++) {
        const price = basePrice - spread - (i * 25);
        const quantity = Math.random() * 2 + 0.1;
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

    generateMockOrderBook();

    // Update every few seconds
    const interval = setInterval(generateMockOrderBook, 3000);

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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h3>
      
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div>Price (USD)</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          {asks.slice(0, 5).reverse().map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="grid grid-cols-3 gap-2 text-sm hover:bg-red-50 p-1 rounded transition-colors"
            >
              <div className="text-red-600 font-medium">
                {ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-right text-gray-900">
                {ask.quantity.toFixed(4)}
              </div>
              <div className="text-right text-gray-600">
                {ask.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="border-t border-b border-gray-200 py-2 text-center">
          <div className="text-sm font-medium text-gray-900">
            Spread: ${(asks[0]?.price - bids[0]?.price || 0).toFixed(2)}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {bids.slice(0, 5).map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 gap-2 text-sm hover:bg-green-50 p-1 rounded transition-colors"
            >
              <div className="text-green-600 font-medium">
                {bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-right text-gray-900">
                {bid.quantity.toFixed(4)}
              </div>
              <div className="text-right text-gray-600">
                {bid.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Depth Visualization */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-500 mb-2">MARKET DEPTH</div>
        <div className="h-20 bg-gradient-to-r from-green-100 via-gray-100 to-red-100 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xs">Depth visualization</span>
        </div>
      </div>
    </div>
  );
}