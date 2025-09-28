import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AssetLogo } from '@/components/ui/AssetLogo';
import MarketOverview from '@/components/MarketOverview';
import Link from 'next/link';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus
} from 'lucide-react';

// Mock market performance data
const mockMarketData = {
  'BTCUSDT': { price: 43750.00, change: 1.98 },
  'ETHUSDT': { price: 2420.75, change: 2.77 },
  'SOLUSDT': { price: 205.80, change: 4.28 },
  'AAPL': { price: 195.50, change: 1.45 },
  'TSLA': { price: 248.75, change: -3.31 },
  'NVDA': { price: 875.20, change: 1.81 },
};

const topGainers = [
  { symbol: 'SOLUSDT', name: 'Solana', change: 4.28, price: 205.80 },
  { symbol: 'ETHUSDT', name: 'Ethereum', change: 2.77, price: 2420.75 },
  { symbol: 'BTCUSDT', name: 'Bitcoin', change: 1.98, price: 43750.00 },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Get user account balance
  const account = await prisma.account.findFirst({
    where: { 
      userId: session.user.id,
      currency: 'USD'
    },
  });

  // Get user positions
  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
    include: { asset: true },
  });

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { asset: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Calculate portfolio stats
  let portfolioValue = parseFloat(account?.balance.toString() || '0');
  let totalPnL = 0;
  
  positions.forEach(position => {
    const marketData = mockMarketData[position.asset.symbol as keyof typeof mockMarketData];
    if (marketData) {
      const currentValue = parseFloat(position.qty.toString()) * marketData.price;
      const originalValue = parseFloat(position.qty.toString()) * parseFloat(position.avgPrice.toString());
      portfolioValue += currentValue;
      totalPnL += (currentValue - originalValue);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Dashboard</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                href="/markets"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Markets
              </Link>
              <Link
                href="/trade/BTCUSDT"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Trading
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cash Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${parseFloat(account?.balance.toString() || '0').toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {totalPnL >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {positions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Real-time Market Overview */}
          <MarketOverview />

          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Gainers</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topGainers.map((asset) => (
                  <Link key={asset.symbol} href={`/trade/${asset.symbol}`}>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <AssetLogo symbol={asset.symbol} size={32} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{asset.symbol.replace('USDT', '')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${asset.price.toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{asset.change}%
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Your Positions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Positions</h3>
                </div>
                <Link 
                  href="/portfolio"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.slice(0, 3).map((position) => {
                    const marketData = mockMarketData[position.asset.symbol as keyof typeof mockMarketData];
                    const currentValue = marketData ? parseFloat(position.qty.toString()) * marketData.price : 0;
                    const originalValue = parseFloat(position.qty.toString()) * parseFloat(position.avgPrice.toString());
                    const pnl = currentValue - originalValue;
                    const pnlPercent = originalValue > 0 ? (pnl / originalValue) * 100 : 0;

                    return (
                      <Link key={position.id} href={`/trade/${position.asset.symbol}`}>
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <AssetLogo symbol={position.asset.symbol} size={32} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{position.asset.symbol}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {position.qty.toString()} @ ${position.avgPrice.toString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                            <p className={`text-sm font-medium ${
                              pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No positions yet</p>
                  <Link
                    href="/markets"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Trading
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                </div>
                <Link 
                  href="/portfolio"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <AssetLogo symbol={order.asset.symbol} size={32} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{order.asset.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.side.toUpperCase()} • {order.qty.toString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium px-2 py-1 rounded-full ${
                          order.status === 'filled' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          order.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {order.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Trade Actions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Quick Trade
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(mockMarketData).slice(0, 6).map(([symbol, data]) => (
                <Link key={symbol} href={`/trade/${symbol}`}>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-center transition-colors cursor-pointer group">
                    <AssetLogo symbol={symbol} size={40} className="mx-auto mb-3" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {symbol.replace('USDT', '')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${data.price.toLocaleString()}
                    </div>
                    <div className={`text-xs font-medium mt-1 ${
                      data.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {data.change >= 0 ? '+' : ''}{data.change}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}