import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';

// Enhanced market data with Redis caching
const mockPrices: Record<string, any> = {
  // Crypto - Updated to realistic 2024 prices
  'BTCUSDT': { price: 43750.00, change24h: 850.50, changePercent: 1.98, volume: 28450.67, high: 44200.00, low: 42900.00 },
  'ETHUSDT': { price: 2420.75, change24h: 65.30, changePercent: 2.77, volume: 182340.45, high: 2485.90, low: 2380.20 },
  'SOLUSDT': { price: 205.80, change24h: 8.45, changePercent: 4.28, volume: 45230.12, high: 208.50, low: 198.40 },
  'BNBUSDT': { price: 615.80, change24h: 12.40, changePercent: 2.05, volume: 8920.45, high: 625.00, low: 605.30 },
  'XRPUSDT': { price: 0.6235, change24h: 0.0125, changePercent: 2.04, volume: 892340.67, high: 0.6350, low: 0.6120 },
  'ADAUSDT': { price: 0.4580, change24h: -0.0150, changePercent: -3.17, volume: 234567.89, high: 0.4720, low: 0.4480 },
  'DOGEUSDT': { price: 0.08450, change24h: 0.0025, changePercent: 3.05, volume: 1234567.90, high: 0.0875, low: 0.0820 },
  'MATICUSDT': { price: 0.8920, change24h: 0.0340, changePercent: 3.96, volume: 567890.12, high: 0.9100, low: 0.8750 },
  
  // Stocks
  'AAPL': { price: 195.50, change24h: 2.80, changePercent: 1.45, volume: 45673000, high: 196.80, low: 192.10 },
  'MSFT': { price: 415.25, change24h: -3.50, changePercent: -0.84, volume: 23456000, high: 420.00, low: 412.50 },
  'GOOGL': { price: 138.75, change24h: 4.25, changePercent: 3.16, volume: 28900000, high: 140.20, low: 136.80 },
  'TSLA': { price: 248.90, change24h: 8.15, changePercent: 3.39, volume: 67890000, high: 252.00, low: 245.30 },
  'NVDA': { price: 875.25, change24h: -12.75, changePercent: -1.44, volume: 34567000, high: 890.00, low: 870.50 },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') || 'all';

    if (!symbol) {
      // Return all market data with caching
      const cacheKey = 'market:all';
      const cached = await redisCache.getMarketData(cacheKey);
      
      if (cached) {
        return NextResponse.json({
          ...cached,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }

      // Add realistic price variations
      const enhancedPrices = Object.entries(mockPrices).reduce((acc, [symbol, data]) => {
        const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const newPrice = data.price * (1 + priceVariation);
        
        acc[symbol] = {
          ...data,
          price: parseFloat(newPrice.toFixed(symbol.includes('USD') ? 2 : 6)),
          lastUpdate: Date.now(),
          trend: priceVariation > 0 ? 'up' : 'down',
        };
        return acc;
      }, {} as any);

      const marketData = {
        data: enhancedPrices,
        timestamp: new Date().toISOString(),
        totalAssets: Object.keys(enhancedPrices).length,
      };

      // Cache for 15 seconds
      await redisCache.setMarketData(cacheKey, marketData, 15);
      
      return NextResponse.json(marketData);
    }

    // Single symbol request with caching
    const cacheKey = `market:${symbol}:${type}`;
    const cached = await redisCache.getMarketData(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    const baseData = mockPrices[symbol];
    if (!baseData) {
      return NextResponse.json(
        { error: `Symbol ${symbol} not found` },
        { status: 404 }
      );
    }

    // Add realistic price movement
    const priceVariation = (Math.random() - 0.5) * 0.01; // ±0.5% variation
    const currentPrice = baseData.price * (1 + priceVariation);

    let responseData: any = {
      symbol,
      price: parseFloat(currentPrice.toFixed(symbol.includes('USD') ? 2 : 6)),
      change24h: baseData.change24h,
      changePercent: baseData.changePercent,
      volume: baseData.volume,
      high: baseData.high,
      low: baseData.low,
      timestamp: new Date().toISOString(),
      trend: priceVariation > 0 ? 'up' : 'down',
    };

    // Add type-specific data
    switch (type) {
      case 'ticker':
        responseData = {
          ...responseData,
          bid: currentPrice * 0.9995,
          ask: currentPrice * 1.0005,
          lastQty: Math.random() * 10 + 1,
        };
        break;

      case 'orderbook':
        const spread = currentPrice * 0.001;
        responseData.orderBook = {
          bids: Array.from({ length: 10 }, (_, i) => [
            currentPrice - spread * (i + 1),
            Math.random() * 100 + 10
          ]),
          asks: Array.from({ length: 10 }, (_, i) => [
            currentPrice + spread * (i + 1),
            Math.random() * 100 + 10
          ]),
        };
        break;

      case 'klines':
        const interval = searchParams.get('interval') || '1d';
        const limit = parseInt(searchParams.get('limit') || '100');
        
        responseData.klines = Array.from({ length: limit }, (_, i) => {
          const timestamp = Date.now() - (limit - i) * 86400000; // Daily intervals
          const open = currentPrice * (0.95 + Math.random() * 0.1);
          const close = open * (0.98 + Math.random() * 0.04);
          const high = Math.max(open, close) * (1 + Math.random() * 0.02);
          const low = Math.min(open, close) * (1 - Math.random() * 0.02);
          
          return [
            timestamp,
            open.toFixed(6),
            high.toFixed(6),
            low.toFixed(6),
            close.toFixed(6),
            (Math.random() * 1000).toFixed(2), // Volume
          ];
        });
        break;
    }

    // Cache individual symbol data for 10 seconds
    await redisCache.setMarketData(cacheKey, responseData, 10);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}