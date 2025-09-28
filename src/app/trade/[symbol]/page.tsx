import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PriceTicker from '@/components/trading/PriceTicker';
import OrderForm from '@/components/trading/OrderForm';
import OrderBook from '@/components/trading/OrderBook';
import TradingChart from '@/components/trading/TradingChart';

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
        {/* Price Ticker */}
        <PriceTicker symbol={asset.symbol} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Chart Area - Takes most space */}
          <div className="lg:col-span-2">
            <TradingChart symbol={asset.symbol} height={500} />
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Form */}
            <OrderForm
              symbol={asset.symbol}
              assetId={asset.id}
              currentPrice={43500} // This would come from real market data
              balance={parseFloat(account?.balance.toString() || '0')}
            />

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
          </div>

          {/* Order Book */}
          <div className="lg:col-span-1">
            <OrderBook symbol={asset.symbol} />
          </div>
        </div>
      </div>
    </div>
  );
}