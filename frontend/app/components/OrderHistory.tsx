"use client";
import { useState, useEffect } from "react";
import { getUserOrders, cancelOrder } from "../utils/httpClient";
import { getCurrentUser } from "../utils/auth";

interface Order {
  id: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: string;
  price: string;
  filled: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'PARTIALLY_FILLED';
  createdAt: string;
  market: {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
  };
}

export function OrderHistory({ market }: { market?: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
      loadOrders();
      // Refresh orders every 5 seconds
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user, market]);

  const loadOrders = async () => {
    try {
      const orderData = await getUserOrders(market);
      setOrders(orderData);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId);
    try {
      await cancelOrder(orderId);
      await loadOrders(); // Refresh orders
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setCancellingOrder(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      case 'PENDING': return 'text-yellow-400';
      case 'PARTIALLY_FILLED': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="bg-baseBackgroundL1 p-4 h-full">
        <div className="text-center text-gray-400">Please log in to view your orders</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-baseBackgroundL1 p-4 h-full">
        <div className="text-center text-gray-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-baseBackgroundL1 h-full">
      <div className="px-4 py-2 border-b border-slate-800">
        <h3 className="text-sm font-medium text-white">Order History</h3>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No orders found
        </div>
      ) : (
        <div className="overflow-y-auto h-64">
          <div className="px-4 py-2">
            <div className="grid grid-cols-6 gap-2 text-xs text-gray-400 mb-2">
              <div>Market</div>
              <div>Side</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Status</div>
              <div>Action</div>
            </div>
          </div>

          <div className="px-4 space-y-1">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="grid grid-cols-6 gap-2 text-xs py-2 hover:bg-slate-800/50 rounded"
              >
                <div className="text-white font-medium">
                  {order.market.symbol}
                </div>
                <div className={order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                  {order.side}
                </div>
                <div className="text-white font-mono">
                  ${parseFloat(order.price || '0').toFixed(2)}
                </div>
                <div className="text-white font-mono">
                  {parseFloat(order.quantity).toFixed(4)}
                </div>
                <div className={getStatusColor(order.status)}>
                  {order.status}
                </div>
                <div>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 text-xs"
                    >
                      {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-slate-800">
          {orders.length} orders • Last updated: {formatTime(new Date().toISOString())}
        </div>
      )}
    </div>
  );
}