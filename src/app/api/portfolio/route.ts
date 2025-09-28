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

    // Convert Decimal fields to numbers
    const orders = rawOrders.map(order => ({
      ...order,
      qty: parseFloat(order.qty.toString()),
      limitPrice: order.limitPrice ? parseFloat(order.limitPrice.toString()) : null,
      fills: order.fills.map(fill => ({
        ...fill,
        price: parseFloat(fill.price.toString()),
        qty: parseFloat(fill.qty.toString()),
        fee: parseFloat(fill.fee.toString()),
      })),
    }));

    // Calculate portfolio summary
    const cashBalance = parseFloat(account?.balance.toString() || '0');
    
    // Get current market prices and calculate position values
    const { priceService } = await import('@/lib/price-service');
    
    const positionsWithValue = await Promise.all(positions.map(async position => {
      // Convert Prisma Decimals to numbers
      const qty = parseFloat(position.qty.toString());
      const avgPrice = parseFloat(position.avgPrice.toString());
      
      // Get current market price
      let currentPrice = 0;
      try {
        currentPrice = await priceService.getCurrentPrice(position.asset.symbol);
      } catch (error) {
        console.log(`Could not get price for ${position.asset.symbol}, using avgPrice`);
        currentPrice = avgPrice; // Fallback to avgPrice
      }
      
      // Calculate market value and P&L
      const marketValue = qty * currentPrice;
      const costBasis = qty * avgPrice;
      const pnl = marketValue - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        id: position.id,
        qty: qty,
        avgPrice: avgPrice,
        currentPrice: currentPrice,
        marketValue: marketValue,
        pnl: pnl,
        pnlPercent: pnlPercent,
        asset: {
          symbol: position.asset.symbol,
          name: position.asset.name,
          type: position.asset.type,
        },
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      };
    }));

    // Calculate portfolio summary
    const totalPositionValue = positionsWithValue.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalValue = cashBalance + totalPositionValue;
    const totalPnl = positionsWithValue.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalCostBasis = positionsWithValue.reduce((sum, pos) => sum + (pos.qty * pos.avgPrice), 0);
    const totalPnlPercent = totalCostBasis > 0 ? (totalPnl / totalCostBasis) * 100 : 0;

    return NextResponse.json({
      account: {
        balance: cashBalance,
        currency: 'USD',
      },
      positions: positionsWithValue,
      orders,
      summary: {
        totalValue,
        totalPnl,
        totalPnlPercent,
        cashBalance,
        positionValue: totalPositionValue,
        dayChange: 0, // Would need historical data
        dayChangePercent: 0, // Would need historical data
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