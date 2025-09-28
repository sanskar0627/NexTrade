
import { Router } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const depthRouter = Router();

depthRouter.get("/", async (req, res) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        const market = await prisma.market.findUnique({
            where: { symbol: symbol as string }
        });
        
        if (!market) {
            return res.status(404).json({ error: 'Market not found' });
        }
        
        // Get pending buy orders (bids) - highest price first
        const buyOrders = await prisma.order.findMany({
            where: {
                marketId: market.id,
                side: 'BUY',
                status: 'PENDING'
            },
            orderBy: { price: 'desc' },
            take: 20,
            select: {
                price: true,
                quantity: true
            }
        });
        
        // Get pending sell orders (asks) - lowest price first  
        const sellOrders = await prisma.order.findMany({
            where: {
                marketId: market.id,
                side: 'SELL',
                status: 'PENDING'
            },
            orderBy: { price: 'asc' },
            take: 20,
            select: {
                price: true,
                quantity: true
            }
        });
        
        // Generate some demo depth data if no real orders
        let bids = buyOrders.length > 0 ? buyOrders.map((o: any) => [o.price, o.quantity]) : [];
        let asks = sellOrders.length > 0 ? sellOrders.map((o: any) => [o.price, o.quantity]) : [];
        
        if (bids.length === 0 || asks.length === 0) {
            const lastPrice = parseFloat(market.lastPrice);
            
            // Generate demo bids (below market price)
            if (bids.length === 0) {
                for (let i = 1; i <= 10; i++) {
                    const price = (lastPrice - (i * 0.5)).toFixed(2);
                    const quantity = (Math.random() * 10 + 1).toFixed(6);
                    bids.push([price, quantity]);
                }
            }
            
            // Generate demo asks (above market price)
            if (asks.length === 0) {
                for (let i = 1; i <= 10; i++) {
                    const price = (lastPrice + (i * 0.5)).toFixed(2);
                    const quantity = (Math.random() * 10 + 1).toFixed(6);
                    asks.push([price, quantity]);
                }
            }
        }
        
        res.json({
            bids,
            asks,
            lastUpdateId: Date.now()
        });
        
    } catch (error) {
        console.error('Depth error:', error);
        res.status(500).json({ error: 'Failed to fetch depth' });
    }
});
