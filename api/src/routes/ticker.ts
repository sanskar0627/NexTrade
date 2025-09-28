
import { Router } from "express";
import { prisma } from '../lib/prisma';

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
    try {
        const markets = await prisma.market.findMany();
        
        const tickers = markets.map((market: any) => ({
            symbol: market.symbol,
            lastPrice: market.lastPrice,
            high: market.high,
            low: market.low,
            volume: market.volume,
            priceChange: market.priceChange,
            priceChangePercent: parseFloat(market.priceChange) > 0 ? `+${((parseFloat(market.priceChange) / parseFloat(market.lastPrice)) * 100).toFixed(2)}` : ((parseFloat(market.priceChange) / parseFloat(market.lastPrice)) * 100).toFixed(2),
            baseAsset: market.baseAsset,
            quoteAsset: market.quoteAsset
        }));
        
        res.json(tickers);
    } catch (error) {
        console.error('Ticker error:', error);
        res.status(500).json({ error: 'Failed to fetch tickers' });
    }
});