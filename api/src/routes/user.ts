
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user balances
router.get('/balance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const balances = await prisma.balance.findMany({
      where: { userId },
    });

    res.json(balances);
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user order history
router.get('/orders', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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

// Get user trade history
router.get('/trades', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { market, limit = 50 } = req.query;

    const trades = await prisma.trade.findMany({
      where: {
        buyerId: userId,
        ...(market && { market: { symbol: market as string } }),
      },
      include: {
        market: true,
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(trades);
  } catch (error) {
    console.error('Trade history error:', error);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

export default router;