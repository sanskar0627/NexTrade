import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, BarChart3, ChevronRight } from 'lucide-react';
import { AssetLogo } from '@/components/ui/AssetLogo';
import { MarketOverview } from '@/components/dynamic';

export default async function HomePage() {
  // Server-side auth check for instant redirect
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    redirect('/dashboard');
  }

  // Popular assets for showcase
  const popularAssets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: '$43,750.00', change: '+2.34%', positive: true },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: '$2,650.75', change: '+1.89%', positive: true },
    { symbol: 'SOLUSDT', name: 'Solana', price: '$205.80', change: '-0.45%', positive: false },
    { symbol: 'AAPL', name: 'Apple', price: '$175.50', change: '+0.67%', positive: true },
    { symbol: 'TSLA', name: 'Tesla', price: '$248.90', change: '+3.21%', positive: true },
    { symbol: 'NVDA', name: 'NVIDIA', price: '$725.30', change: '+5.67%', positive: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                NexTrade
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              Professional-grade trading platform for 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> crypto </span>
              and 
              <span className="font-semibold text-purple-600 dark:text-purple-400"> stocks</span>
            </p>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Execute trades with institutional-level tools, real-time market data, and advanced charting. Start with just $0.10.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
              >
                Start Trading Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-semibold text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Market Data */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Live Market Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Real-time prices from Binance and major exchanges</p>
          </div>
          
          <MarketOverview className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        </div>
      </div>

      {/* Popular Assets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Popular Assets</h2>
          <p className="text-gray-600 dark:text-gray-400">Trade the most popular cryptocurrencies and stocks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {popularAssets.map((asset) => (
            <Link
              key={asset.symbol}
              href="/auth/register"
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <AssetLogo symbol={asset.symbol} size={40} />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{asset.price}</div>
                <div className={`font-medium ${asset.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {asset.change}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Professional Trading Tools</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to trade like a pro - from real-time charts to advanced order types
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Trading</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Execute trades instantly with live market data, advanced charts, and professional-grade order types.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Professional charting tools with technical indicators, order book depth, and portfolio analytics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Bank-grade security with institutional-level infrastructure and 24/7 monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust NexTrade for their investment journey. Start with as little as $0.10.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/markets"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Explore Markets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}