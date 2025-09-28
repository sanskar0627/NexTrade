import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AssetLogo } from '@/components/ui/AssetLogo';
import { TrendingUp, TrendingDown, ChevronRight, Search } from 'lucide-react';

// Mock market data - in production this would come from real APIs
const mockMarketData: { [key: string]: { price: number; change: number; volume: number; marketCap?: number } } = {
  // Crypto
  'BTCUSDT': { price: 43750.00, change: 1.98, volume: 28500000000, marketCap: 860000000000 },
  'ETHUSDT': { price: 2420.75, change: 2.77, volume: 12800000000, marketCap: 291000000000 },
  'SOLUSDT': { price: 205.80, change: 4.28, volume: 2100000000, marketCap: 91000000000 },
  'BNBUSDT': { price: 615.80, change: 2.05, volume: 1200000000, marketCap: 89000000000 },
  'XRPUSDT': { price: 0.6235, change: 2.04, volume: 890000000, marketCap: 35000000000 },
  'ADAUSDT': { price: 0.4580, change: -1.17, volume: 450000000, marketCap: 16000000000 },
  'DOGEUSDT': { price: 0.08450, change: 3.05, volume: 380000000, marketCap: 12000000000 },
  'MATICUSDT': { price: 0.8920, change: 3.96, volume: 320000000, marketCap: 8500000000 },
  'LTCUSDT': { price: 75.80, change: -1.62, volume: 280000000, marketCap: 5600000000 },
  'DOTUSDT': { price: 6.45, change: 2.87, volume: 190000000, marketCap: 8200000000 },
  
  // Stocks
  'AAPL': { price: 195.50, change: 1.45, volume: 48000000 },
  'MSFT': { price: 415.25, change: -0.84, volume: 22000000 },
  'AMZN': { price: 155.80, change: 2.81, volume: 36000000 },
  'GOOGL': { price: 142.30, change: 1.35, volume: 28000000 },
  'TSLA': { price: 248.75, change: -3.31, volume: 89000000 },
  'NVDA': { price: 875.20, change: 1.81, volume: 35000000 },
  'META': { price: 518.40, change: 2.43, volume: 18000000 },
  'NFLX': { price: 485.60, change: -1.18, volume: 12000000 },
  'AMD': { price: 165.90, change: 2.12, volume: 42000000 },
  'JPM': { price: 185.25, change: -0.94, volume: 15000000 },
};

export default async function MarketsPage() {
  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: [
      { type: 'asc' },
      { symbol: 'asc' }
    ],
  });

  const cryptoAssets = assets.filter(asset => asset.type === 'crypto');
  const stockAssets = assets.filter(asset => asset.type === 'stock');

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.endsWith('USDT') && price < 1) {
      return price.toFixed(6);
    }
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    } else {
      return `$${(volume / 1e3).toFixed(1)}K`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Real-time prices for cryptocurrency and stock markets
              </p>
            </div>
            
            {/* Search and filters */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Market Cap</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$1.8T</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">24h Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$89B</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">BTC Dominance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">48.2%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Pairs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">20</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crypto Markets */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cryptocurrency Markets</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{cryptoAssets.length} assets</span>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">24h Change</div>
                <div className="col-span-2 text-right">Volume</div>
                <div className="col-span-2 text-right">Market Cap</div>
              </div>
            </div>
            
            {/* Assets List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cryptoAssets.map((asset) => {
                const marketData = mockMarketData[asset.symbol];
                if (!marketData) return null;
                
                const isPositive = marketData.change >= 0;
                
                return (
                  <Link key={asset.id} href={`/trade/${asset.symbol}`}>
                    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Name & Logo */}
                        <div className="col-span-4 flex items-center space-x-3">
                          <AssetLogo symbol={asset.symbol} size={40} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {asset.symbol.replace('USDT', '')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="col-span-2 text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${formatPrice(marketData.price, asset.symbol)}
                          </div>
                        </div>
                        
                        {/* 24h Change */}
                        <div className="col-span-2 text-right">
                          <div className={`flex items-center justify-end space-x-1 font-medium ${
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{isPositive ? '+' : ''}{marketData.change.toFixed(2)}%</span>
                          </div>
                        </div>
                        
                        {/* Volume */}
                        <div className="col-span-2 text-right">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatVolume(marketData.volume)}
                          </div>
                        </div>
                        
                        {/* Market Cap */}
                        <div className="col-span-2 text-right flex items-center justify-end space-x-2">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {marketData.marketCap ? formatMarketCap(marketData.marketCap) : 'N/A'}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stock Markets */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">US Stock Markets</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{stockAssets.length} assets</span>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-10 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">24h Change</div>
                <div className="col-span-2 text-right">Volume</div>
              </div>
            </div>
            
            {/* Assets List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stockAssets.map((asset) => {
                const marketData = mockMarketData[asset.symbol];
                if (!marketData) return null;
                
                const isPositive = marketData.change >= 0;
                
                return (
                  <Link key={asset.id} href={`/trade/${asset.symbol}`}>
                    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="grid grid-cols-10 gap-4 items-center">
                        {/* Name & Logo */}
                        <div className="col-span-4 flex items-center space-x-3">
                          <AssetLogo symbol={asset.symbol} size={40} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {asset.symbol}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="col-span-2 text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${formatPrice(marketData.price, asset.symbol)}
                          </div>
                        </div>
                        
                        {/* 24h Change */}
                        <div className="col-span-2 text-right">
                          <div className={`flex items-center justify-end space-x-1 font-medium ${
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{isPositive ? '+' : ''}{marketData.change.toFixed(2)}%</span>
                          </div>
                        </div>
                        
                        {/* Volume */}
                        <div className="col-span-2 text-right flex items-center justify-end space-x-2">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {formatVolume(marketData.volume)}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}