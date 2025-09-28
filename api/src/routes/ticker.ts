
import { Router } from "express";
import { mockMarkets } from '../lib/mockData';

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
    try {
        console.log('📊 Fetching tickers from mock data...');
        
        const markets = mockMarkets;
        console.log(`Found ${markets.length} markets in mock data`);
        
        if (markets.length === 0) {
            // Return demo data if no markets in database
            const demoTickers = [
                {
                    symbol: "BTC_USDC",
                    lastPrice: "45000.00",
                    high: "46000.00", 
                    low: "44000.00",
                    volume: "1250.75",
                    priceChange: "500.00",
                    priceChangePercent: "+1.12",
                    baseAsset: "BTC",
                    quoteAsset: "USDC"
                },
                {
                    symbol: "SOL_USDC",
                    lastPrice: "100.50",
                    high: "102.00",
                    low: "98.00", 
                    volume: "5000.25",
                    priceChange: "-2.50",
                    priceChangePercent: "-2.43",
                    baseAsset: "SOL",
                    quoteAsset: "USDC"
                }
            ];
            console.log('📈 Returning demo ticker data');
            return res.json(demoTickers);
        }
        
        const tickers = markets.map((market: any) => {
            const priceChange = parseFloat(market.priceChange || '0');
            const lastPrice = parseFloat(market.lastPrice || '0');
            const changePercent = lastPrice > 0 ? ((priceChange / lastPrice) * 100) : 0;
            
            return {
                symbol: market.symbol,
                lastPrice: market.lastPrice,
                high: market.high,
                low: market.low,
                volume: market.volume,
                priceChange: market.priceChange,
                priceChangePercent: priceChange >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`,
                baseAsset: market.baseAsset,
                quoteAsset: market.quoteAsset
            };
        });
        
        console.log(`✅ Successfully returned ${tickers.length} tickers`);
        res.json(tickers);
    } catch (error) {
        console.error('❌ Ticker error:', error);
        
        // Return demo data as fallback
        const fallbackTickers = [
            {
                symbol: "BTC_USDC",
                lastPrice: "45000.00",
                high: "46000.00",
                low: "44000.00", 
                volume: "1250.75",
                priceChange: "500.00",
                priceChangePercent: "+1.12",
                baseAsset: "BTC",
                quoteAsset: "USDC"
            }
        ];
        
        console.log('⚠️ Returning fallback ticker data due to error');
        res.json(fallbackTickers);
    }
});