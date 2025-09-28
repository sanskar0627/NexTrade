import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-900">{session.user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Account Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${account?.balance.toString() || '0.00'} USD
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Positions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Positions
              </h3>
              {positions.length > 0 ? (
                <div className="space-y-3">
                  {positions.map((position) => (
                    <div key={position.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{position.asset.symbol}</p>
                        <p className="text-sm text-gray-500">{position.asset.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{position.qty.toString()}</p>
                        <p className="text-sm text-gray-500">Avg: ${position.avgPrice.toString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No positions yet. Start trading!</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Orders
              </h3>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{order.asset.symbol}</p>
                        <p className="text-sm text-gray-500">
                          {order.side.toUpperCase()} • {order.type.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          order.status === 'filled' ? 'text-green-600' :
                          order.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {order.status.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">{order.qty.toString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <a
                href="/trade/BTCUSDT"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-2">₿</div>
                <div className="text-sm font-medium text-blue-900">Trade Bitcoin</div>
              </a>
              <a
                href="/trade/ETHUSDT"
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-2">⧫</div>
                <div className="text-sm font-medium text-purple-900">Trade Ethereum</div>
              </a>
              <a
                href="/trade/AAPL"
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-2">🍎</div>
                <div className="text-sm font-medium text-gray-900">Trade Apple</div>
              </a>
              <a
                href="/markets"
                className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-green-900">All Markets</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}