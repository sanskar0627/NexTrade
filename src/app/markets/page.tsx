import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crypto Markets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cryptocurrency</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {cryptoAssets.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/trade/${asset.symbol}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {asset.symbol.slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Loading...
                        </div>
                        <div className="text-sm text-gray-500">
                          24h Change
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stock Markets */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">US Stocks</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stockAssets.map((asset) => (
                <li key={asset.id}>
                  <Link
                    href={`/trade/${asset.symbol}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">
                              {asset.symbol}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Loading...
                        </div>
                        <div className="text-sm text-gray-500">
                          Market Hours
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}