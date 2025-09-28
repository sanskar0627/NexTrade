"use client";
import { useState, useEffect } from "react";
import { getTrades } from "../utils/httpClient";
import { Trade } from "../utils/types";

export function Trades({ market }: { market: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
    
    // Refresh trades every 2 seconds for real-time feel
    const interval = setInterval(loadTrades, 2000);
    return () => clearInterval(interval);
  }, [market]);

  const loadTrades = async () => {
    try {
      const tradeData = await getTrades(market);
      setTrades(tradeData.slice(0, 20)); // Show latest 20 trades
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  const formatQuantity = (quantity: string) => {
    return parseFloat(quantity).toFixed(4);
  };

  if (loading) {
    return (
      <div className="bg-baseBackgroundL1 p-4 h-full">
        <div className="text-center text-gray-400">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="bg-baseBackgroundL1 h-full">
      <div className="px-4 py-2 border-b border-slate-800">
        <h3 className="text-sm font-medium text-white">Recent Trades</h3>
      </div>
      
      <div className="px-4 py-2">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 mb-2">
          <div>Price ({market.split('_')[1]})</div>
          <div className="text-right">Quantity ({market.split('_')[0]})</div>
          <div className="text-right">Time</div>
        </div>
      </div>

      <div className="px-4 space-y-1 h-64 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No recent trades
          </div>
        ) : (
          trades.map((trade, index) => (
            <div 
              key={trade.id} 
              className={`grid grid-cols-3 gap-4 text-xs py-1 hover:bg-slate-800/50 rounded ${
                index === 0 ? 'bg-green-900/20' : ''
              }`}
            >
              <div className="text-green-400 font-mono">
                {formatPrice(trade.price)}
              </div>
              <div className="text-right text-white font-mono">
                {formatQuantity(trade.quantity)}
              </div>
              <div className="text-right text-gray-400">
                {formatTime(trade.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {trades.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-slate-800">
          Last updated: {formatTime(new Date().toISOString())}
        </div>
      )}
    </div>
  );
}