'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, BarChart3, ChevronRight } from 'lucide-react';
import { AssetLogo } from '@/components/ui/AssetLogo';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authenticated state (shouldn't reach here due to redirect)
  if (session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, {session.user.email}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Redirecting to dashboard...
          </p>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
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

  // Show professional Binance-style homepage for unauthenticated users
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trade Like a
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
              Experience the future of trading with our advanced platform. 
              Start with $5,000 demo funds and trade crypto & stocks with zero risk.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 flex items-center"
              >
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-blue-400 text-blue-400 rounded-xl hover:bg-blue-400 hover:text-blue-900 transition-all duration-300 font-semibold text-lg"
              >
                Sign In
              </Link>
            </div>

            {/* Live Assets Ticker */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 max-w-5xl mx-auto border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Live Market Data</h3>
                <span className="text-sm text-blue-300">Real-time prices</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularAssets.map((asset) => (
                  <div key={asset.symbol} className="text-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-center mb-2">
                      <AssetLogo symbol={asset.symbol} size={32} />
                    </div>
                    <div className="text-white font-medium text-sm">{asset.name}</div>
                    <div className="text-white font-bold">{asset.price}</div>
                    <div className={`text-sm font-medium ${asset.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose NexTrade?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for traders who demand the best. Our platform combines cutting-edge technology with an intuitive design.
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk-Free Demo</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Start with $5,000 virtual funds. Perfect your strategy without any financial risk.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Professional trading tools, technical indicators, and comprehensive portfolio tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 dark:text-gray-300">Trading Pairs</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">$5,000</div>
              <div className="text-gray-600 dark:text-gray-300">Demo Balance</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Market Access</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">0%</div>
              <div className="text-gray-600 dark:text-gray-300">Demo Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of traders who trust NexTrade for their demo trading needs.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Create Free Account
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}