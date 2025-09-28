import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TradingEngine } from '@/lib/trading-engine';
import { z } from 'zod';

const orderSchema = z.object({
  assetId: z.string(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  qty: z.number().positive(),
  limitPrice: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const orderData = orderSchema.parse(body);

    // Validate limit price for limit orders
    if (orderData.type === 'limit' && !orderData.limitPrice) {
      return NextResponse.json(
        { error: 'Limit price is required for limit orders' },
        { status: 400 }
      );
    }

    // Initialize trading engine
    const engine = new TradingEngine(prisma);

    // Get current market price for market orders
    let currentPrice: number | undefined;
    if (orderData.type === 'market') {
      // Get asset to determine symbol
      const asset = await prisma.asset.findUnique({
        where: { id: orderData.assetId },
      });

      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        );
      }

      currentPrice = await engine.getCurrentMarketPrice(asset.symbol) || undefined;
    }

    // Process the order
    const result = await engine.processOrder(
      {
        userId: session.user.id,
        assetId: orderData.assetId,
        side: orderData.side,
        type: orderData.type,
        qty: orderData.qty,
        limitPrice: orderData.limitPrice,
      },
      currentPrice
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      orderId: result.orderId,
      fills: result.fills,
      message: 'Order processed successfully',
    });

  } catch (error) {
    console.error('Order API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        asset: true,
        fills: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Get orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}