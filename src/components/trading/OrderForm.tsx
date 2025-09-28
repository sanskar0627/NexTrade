'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OrderFormProps {
  symbol: string;
  assetId: string;
  currentPrice: number;
  balance: number;
  onOrderSubmit?: () => void;
}

export default function OrderForm({ 
  symbol, 
  assetId, 
  currentPrice, 
  balance,
  onOrderSubmit 
}: OrderFormProps) {
  const { data: session } = useSession();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate estimated total
  const price = type === 'market' ? currentPrice : parseFloat(limitPrice) || 0;
  const qty = parseFloat(quantity) || 0;
  const estimatedTotal = price * qty;

  useEffect(() => {
    if (type === 'limit' && !limitPrice) {
      setLimitPrice(currentPrice.toString());
    }
  }, [type, currentPrice, limitPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('Please log in to place orders');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (type === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError('Please enter a valid limit price');
      return;
    }

    if (side === 'buy' && estimatedTotal > balance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        assetId,
        side,
        type,
        qty: parseFloat(quantity),
        ...(type === 'limit' && { limitPrice: parseFloat(limitPrice) }),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }

      // Reset form
      setQuantity('');
      setLimitPrice('');
      setError('');

      // Notify parent component
      onOrderSubmit?.();

      // Show success message (you could use a toast library here)
      alert(`Order placed successfully! Order ID: ${result.orderId}`);

    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              side === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${
              side === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'market' | 'limit')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.00000001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Limit Price (shown for limit orders) */}
        {type === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 p-3 rounded-md space-y-1">
          <div className="flex justify-between text-sm">
            <span>Current Price:</span>
            <span className="font-medium">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estimated Total:</span>
            <span className="font-medium">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Available Balance:</span>
            <span className="font-medium">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !quantity || (type === 'limit' && !limitPrice)}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            side === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? 'Placing Order...'
            : `Place ${side.toUpperCase()} Order`
          }
        </button>
      </form>
    </div>
  );
}