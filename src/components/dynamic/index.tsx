import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamic imports for heavy components
export const TradingChart = dynamic(() => import('@/components/trading/TradingChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  ),
});

export const OrderBook = dynamic(() => import('@/components/trading/OrderBook'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[600px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading order book...</p>
      </div>
    </div>
  ),
});

export const MarketOverview = dynamic(() => import('@/components/MarketOverview'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  ),
});

// Memoized components for expensive calculations
export const MemoizedAssetLogo = dynamic(() => 
  import('@/components/ui/AssetLogo').then(mod => mod.AssetLogo), {
  ssr: true,
});

export const MemoizedPriceTicker = dynamic(() => 
  import('@/components/trading/PriceTicker'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    </div>
  ),
});