import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Get order history (last 100 orders)
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { 
        asset: true,
        fills: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Calculate portfolio summary
    const totalValue = parseFloat(account?.balance.toString() || '0');
    
    // In a real app, you'd get current market prices to calculate position values
    const positionsWithValue = positions.map(position => ({
      ...position,
      currentPrice: 0, // Would fetch from market data
      marketValue: 0,  // Would calculate: qty * currentPrice
      pnl: 0,         // Would calculate: (currentPrice - avgPrice) * qty
      pnlPercent: 0,  // Would calculate: pnl / (avgPrice * qty) * 100
    }));

    return NextResponse.json({
      account: {
        balance: totalValue,
        currency: 'USD',
      },
      positions: positionsWithValue,
      orders,
      summary: {
        totalValue,
        totalPnl: 0,
        totalPnlPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
      },
    });

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}