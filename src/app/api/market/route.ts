import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock prices for demo - in production this would come from real market data
const mockPrices: Record<string, any> = {
  // Crypto
  'BTCUSDT': { price: 43500.00, change24h: 1250.50, changePercent: 2.96 },
  'ETHUSDT': { price: 2650.00, change24h: 85.30, changePercent: 3.33 },
  'SOLUSDT': { price: 145.50, change24h: -5.20, changePercent: -3.45 },
  'BNBUSDT': { price: 615.80, change24h: 12.40, changePercent: 2.05 },
  'XRPUSDT': { price: 0.6235, change24h: 0.0125, changePercent: 2.04 },
  'ADAUSDT': { price: 0.4580, change24h: -0.0150, changePercent: -3.17 },
  'DOGEUSDT': { price: 0.08450, change24h: 0.0025, changePercent: 3.05 },
  'MATICUSDT': { price: 0.8920, change24h: 0.0340, changePercent: 3.96 },
  'LTCUSDT': { price: 75.80, change24h: -1.25, changePercent: -1.62 },
  'DOTUSDT': { price: 6.45, change24h: 0.18, changePercent: 2.87 },
  
  // Stocks
  'AAPL': { price: 195.50, change24h: 2.80, changePercent: 1.45 },
  'MSFT': { price: 415.25, change24h: -3.50, changePercent: -0.84 },
  'AMZN': { price: 155.80, change24h: 4.25, changePercent: 2.81 },
  'GOOGL': { price: 142.30, change24h: 1.90, changePercent: 1.35 },
  'TSLA': { price: 248.75, change24h: -8.50, changePercent: -3.31 },
  'NVDA': { price: 875.20, change24h: 15.60, changePercent: 1.81 },
  'META': { price: 518.40, change24h: 12.30, changePercent: 2.43 },
  'NFLX': { price: 485.60, change24h: -5.80, changePercent: -1.18 },
  'AMD': { price: 165.90, change24h: 3.45, changePercent: 2.12 },
  'JPM': { price: 185.25, change24h: -1.75, changePercent: -0.94 },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type'); // 'crypto', 'stock', or null for all

    if (symbol) {
      // Get specific symbol data
      const asset = await prisma.asset.findUnique({
        where: { symbol },
      });

      if (!asset) {
        return NextResponse.json(
          { error: 'Symbol not found' },
          { status: 404 }
        );
      }

      const priceData = mockPrices[symbol];
      if (!priceData) {
        return NextResponse.json(
          { error: 'Price data not available' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        symbol,
        name: asset.name,
        type: asset.type,
        price: priceData.price,
        change24h: priceData.change24h,
        changePercent: priceData.changePercent,
        volume24h: Math.random() * 1000000, // Mock volume
        high24h: priceData.price * 1.05,
        low24h: priceData.price * 0.95,
        lastUpdate: Date.now(),
      });
    }

    // Get all market data
    const whereClause = type ? { type, isActive: true } : { isActive: true };
    const assets = await prisma.asset.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' },
        { symbol: 'asc' }
      ],
    });

    const marketData = assets.map(asset => {
      const priceData = mockPrices[asset.symbol] || { 
        price: 0, 
        change24h: 0, 
        changePercent: 0 
      };

      return {
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        price: priceData.price,
        change24h: priceData.change24h,
        changePercent: priceData.changePercent,
        volume24h: Math.random() * 1000000,
        high24h: priceData.price * 1.05,
        low24h: priceData.price * 0.95,
        lastUpdate: Date.now(),
      };
    });

    return NextResponse.json(marketData);

  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}