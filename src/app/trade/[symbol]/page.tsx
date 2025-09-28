import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface TradePageProps {
  params: { symbol: string };
}

export default async function TradePage({ params }: TradePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Get asset information
  const asset = await prisma.asset.findUnique({
    where: { symbol: params.symbol },
  });

  if (!asset) {
    notFound();
  }

  // Get user account balance
  const account = await prisma.account.findFirst({
    where: { 
      userId: session.user.id,
      currency: 'USD'
    },
  });

  // Get user position for this asset
  const position = await prisma.position.findUnique({
    where: {
      userId_assetId: {
        userId: session.user.id,
        assetId: asset.id,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a
                href="/markets"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Markets
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{asset.symbol}</h1>
                <p className="text-sm text-gray-600">{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-bold text-gray-900">
                ${account?.balance.toString() || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Area - Takes most space */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Price Chart</h2>
                <div className="text-2xl font-bold text-gray-900">
                  $---.-- <span className="text-sm text-gray-500">USD</span>
                </div>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <p className="text-gray-600">Chart loading...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Live price data will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
              
              <div className="space-y-4">
                {/* Buy/Sell Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-green-500 text-white py-2 px-4 rounded-md font-medium">
                    BUY
                  </button>
                  <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium">
                    SELL
                  </button>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Market</option>
                    <option>Limit</option>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>

                {/* Limit Price (conditionally shown) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                    disabled
                  />
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Total:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  disabled
                >
                  Place Buy Order
                </button>
              </div>
            </div>

            {/* Position Info */}
            {position && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Position</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{position.qty.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">${position.avgPrice.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P&L:</span>
                    <span className="font-medium text-gray-500">$---.--</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Book Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 text-center">Loading order book...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}