import { useEffect, useState } from 'react';
import type { OrderBook } from '../utils/types';

export default function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOrderBook('SOL/USDC');
        setOrderBook(data);
      } catch (error) {
        console.error('Failed to fetch orderbook:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-green-500">Bids</h3>
          {orderBook?.bids.map((bid) => (
            <div key={bid.id} className="flex justify-between">
              <span>{bid.price}</span>
              <span>{bid.quantity}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-red-500">Asks</h3>
          {orderBook?.asks.map((ask) => (
            <div key={ask.id} className="flex justify-between">
              <span>{ask.price}</span>
              <span>{ask.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function fetchOrderBook(symbol: string): Promise<OrderBook> {
  const response = await fetch(`/api/orderbook/${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orderbook');
  }
  return response.json();
}