import express, { Response } from 'express';
import { RedisManager } from '../RedisManager';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();
const redisManager = RedisManager.getInstance();

// Create order
router.post('/create', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { market, side, quantity, price, type = 'LIMIT' } = req.body;
    const userId = req.userId!;

    // Validate market exists
    const marketData = await prisma.market.findUnique({
      where: { symbol: market },
    });

    if (!marketData) {
      return res.status(400).json({ error: 'Invalid market' });
    }

    // Check user balance
    const quoteAsset = marketData.quoteAsset;
    const baseAsset = marketData.baseAsset;
    
    const requiredAsset = side === 'BUY' ? quoteAsset : baseAsset;
    const requiredAmount = side === 'BUY' 
      ? (parseFloat(quantity) * parseFloat(price)).toString()
      : quantity;

    const balance = await prisma.balance.findUnique({
      where: {
        userId_asset: {
          userId,
          asset: requiredAsset,
        },
      },
    });

    if (!balance || parseFloat(balance.available) < parseFloat(requiredAmount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        marketId: marketData.id,
        side: side as 'BUY' | 'SELL',
        type: type as 'MARKET' | 'LIMIT',
        quantity,
        price: type === 'LIMIT' ? price : null,
        status: 'PENDING',
      },
    });

    // Lock funds
    await prisma.balance.update({
      where: {
        userId_asset: {
          userId,
          asset: requiredAsset,
        },
      },
      data: {
        available: (parseFloat(balance.available) - parseFloat(requiredAmount)).toString(),
        locked: (parseFloat(balance.locked) + parseFloat(requiredAmount)).toString(),
      },
    });

    // Send to trading engine
    await redisManager.publishMessage('CREATE_ORDER', {
      orderId: order.id,
      market,
      side,
      quantity,
      price,
      userId,
    });

    res.json({
      orderId: order.id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Cancel order
router.delete('/:orderId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId!;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: { in: ['PENDING', 'PARTIALLY_FILLED'] },
      },
      include: { market: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    // Unlock funds
    const requiredAsset = order.side === 'BUY' ? order.market.quoteAsset : order.market.baseAsset;
    const lockedAmount = order.side === 'BUY' 
      ? (parseFloat(order.quantity) * parseFloat(order.price!)).toString()
      : order.quantity;

    await prisma.balance.update({
      where: {
        userId_asset: {
          userId,
          asset: requiredAsset,
        },
      },
      data: {
        available: {
          increment: parseFloat(lockedAmount),
        },
        locked: {
          decrement: parseFloat(lockedAmount),
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get user orders
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { market, limit = 50 } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(market && { market: { symbol: market as string } }),
      },
      include: {
        market: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(orders);
  } catch (error) {
    console.error('Order history error:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

export default router;