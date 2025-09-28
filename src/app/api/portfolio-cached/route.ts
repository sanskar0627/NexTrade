import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisCache } from '@/lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try Redis cache first
    const cachedPortfolio = await redisCache.getPortfolioCache(session.user.id);
    if (cachedPortfolio) {
      return NextResponse.json({
        ...cachedPortfolio,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Get account balance
    const account = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        currency: 'USD'
      },
    });

    // Get positions with asset information
    const positions = await prisma.position.findMany({
      where: { userId: session.user.id },
      include: { asset: true },
    });

    // Get order history (last 100 orders) with converted Decimals
    const rawOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { 
        asset: true,
        fills: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Convert Decimal fields to numbers - using correct field names from Prisma schema
    const orders = rawOrders.map(order => ({
      id: order.id,
      assetId: order.assetId,
      type: order.type,
      side: order.side,
      qty: parseFloat(order.qty.toString()),
      limitPrice: order.limitPrice ? parseFloat(order.limitPrice.toString()) : null,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      asset: order.asset,
      fills: order.fills.map(fill => ({
        id: fill.id,
        qty: parseFloat(fill.qty.toString()),
        price: parseFloat(fill.price.toString()),
        fee: parseFloat(fill.fee.toString()),
        createdAt: fill.createdAt,
      })),
    }));

    // Convert position quantities to numbers - using correct field names
    const convertedPositions = positions.map(position => ({
      ...position,
      qty: parseFloat(position.qty.toString()), // Using 'qty' field name
      avgPrice: parseFloat(position.avgPrice.toString()), // Using 'avgPrice' field name
    }));

    const portfolioData = {
      account: account ? {
        ...account,
        balance: parseFloat(account.balance.toString()),
      } : null,
      positions: convertedPositions,
      orders,
      timestamp: new Date().toISOString(),
    };

    // Cache the portfolio data for 5 minutes
    await redisCache.setPortfolioCache(session.user.id, portfolioData, 300);

    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}