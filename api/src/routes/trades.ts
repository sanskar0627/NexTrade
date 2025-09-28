import { Router } from "express";
import { mockTrades, mockMarkets } from '../lib/mockData';

export const tradesRouter = Router();

tradesRouter.get("/", async (req, res) => {
    try {
        const { symbol, limit = 50 } = req.query;
        console.log(`📈 Fetching trades for symbol: ${symbol}`);
        
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol parameter is required' });
        }
        
        const market = mockMarkets.find(m => m.symbol === symbol);
        
        if (!market) {
            console.log(`⚠️ Market not found: ${symbol}, returning demo trades`);
        }
        
        // Generate realistic trades for the requested market
        const basePrice = market ? parseFloat(market.lastPrice) : 45000;
        const trades = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
            id: `trade_${symbol}_${i}`,
            price: (basePrice + (Math.random() - 0.5) * basePrice * 0.02).toFixed(2),
            quantity: (Math.random() * 5 + 0.1).toFixed(4),
            timestamp: new Date(Date.now() - i * 15000).toISOString(),
            side: Math.random() > 0.5 ? 'BUY' : 'SELL'
        }));
        

        
        console.log(`✅ Found ${trades.length} trades for ${symbol}`);
        res.json(trades);
    } catch (error) {
        console.error('❌ Trades error:', error);
        
        // Return demo data as fallback
        const fallbackTrades = Array.from({ length: 8 }, (_, i) => ({
            id: `fallback_${i}`,
            price: (45000 + Math.random() * 2000).toFixed(2),
            quantity: (Math.random() * 2).toFixed(4),
            timestamp: new Date(Date.now() - i * 45000).toISOString(),
            side: Math.random() > 0.5 ? 'BUY' : 'SELL'
        }));
        
        console.log('⚠️ Returning fallback trades due to error');
        res.json(fallbackTrades);
    }
});
