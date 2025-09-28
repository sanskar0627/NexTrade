'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PortfolioData {
  account: {
    balance: number;
    currency: string;
  };
  positions: Array<{
    id: string;
    qty: number;
    avgPrice: number;
    asset: {
      symbol: string;
      name: string;
      type: string;
    };
    currentPrice: number;
    marketValue: number;
    pnl: number;
    pnlPercent: number;
  }>;
  orders: Array<{
    id: string;
    side: string;
    type: string;
    qty: number;
    limitPrice?: number;
    status: string;
    createdAt: string;
    asset: {
      symbol: string;
      name: string;
    };
    fills: Array<{
      price: number;
      qty: number;
      fee: number;
    }>;
  }>;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('positions');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPortfolio();
    }
  }, [status, router]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load portfolio data</p>
          <button
            onClick={fetchPortfolio}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Track your positions and trading performance</p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Account Balance</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${portfolio.account.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">{portfolio.account.currency}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Positions</h3>
            <p className="text-2xl font-bold text-gray-900">{portfolio.positions.length}</p>
            <p className="text-sm text-gray-600">Active positions</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total P&L</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-green-600">+0.00%</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Day Change</h3>
            <p className="text-2xl font-bold text-gray-600">$0.00</p>
            <p className="text-sm text-gray-600">+0.00%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('positions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'positions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Positions ({portfolio.positions.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History ({portfolio.orders.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'positions' && (
              <div>
                {portfolio.positions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm font-medium text-gray-500 border-b">
                          <th className="pb-3">Asset</th>
                          <th className="pb-3 text-right">Quantity</th>
                          <th className="pb-3 text-right">Avg Price</th>
                          <th className="pb-3 text-right">Current Price</th>
                          <th className="pb-3 text-right">Market Value</th>
                          <th className="pb-3 text-right">P&L</th>
                          <th className="pb-3 text-right">P&L %</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.positions.map((position) => (
                          <tr key={position.id} className="border-b">
                            <td className="py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {position.asset.symbol}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {position.asset.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right">{position.qty}</td>
                            <td className="py-4 text-right">${position.avgPrice.toFixed(2)}</td>
                            <td className="py-4 text-right">${position.currentPrice.toFixed(2)}</td>
                            <td className="py-4 text-right">${position.marketValue.toFixed(2)}</td>
                            <td className={`py-4 text-right ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${position.pnl.toFixed(2)}
                            </td>
                            <td className={`py-4 text-right ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                            </td>
                            <td className="py-4 text-right">
                              <Link
                                href={`/trade/${position.asset.symbol}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Trade
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">No positions yet</div>
                    <p className="text-gray-400 mb-4">Start trading to see your positions here</p>
                    <Link
                      href="/markets"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Browse Markets
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                {portfolio.orders.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{order.asset.symbol}</span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {order.side.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                {order.type.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.status === 'filled' ? 'bg-green-100 text-green-800' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {order.asset.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Qty: {order.qty}</div>
                            {order.limitPrice && (
                              <div className="text-sm text-gray-600">
                                Limit: ${order.limitPrice.toFixed(2)}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {order.fills.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium text-gray-700 mb-2">Fills:</div>
                            <div className="space-y-1">
                              {order.fills.map((fill, index) => (
                                <div key={index} className="text-sm text-gray-600 flex justify-between">
                                  <span>Price: ${fill.price.toFixed(2)}</span>
                                  <span>Qty: {fill.qty}</span>
                                  <span>Fee: ${fill.fee.toFixed(4)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">No orders yet</div>
                    <p className="text-gray-400 mb-4">Your order history will appear here</p>
                    <Link
                      href="/markets"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Start Trading
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}