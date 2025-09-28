import { Router } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const tradesRouter = Router();

tradesRouter.get("/", async (req, res) => {
    try {
        const { symbol, limit = 50 } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        const market = await prisma.market.findUnique({
            where: { symbol: symbol as string }
        });
        
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }
        
        const trades = await prisma.trade.findMany({
            where: { marketId: market.id },
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit as string),
            select: {
                id: true,
                price: true,
                quantity: true,
                timestamp: true
            }
        });
        
        res.json(trades);
    } catch (error) {
        console.error('Trades error:', error);
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
});
