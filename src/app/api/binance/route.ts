import { NextRequest, NextResponse } from 'next/server';
import { BinanceApiClient } from '@/lib/binance-client';

// Create Binance client with API keys from environment
const binanceClient = new BinanceApiClient(
  process.env.BINANCE_API_KEY || '',
  process.env.BINANCE_SECRET_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type'); // 'klines', 'ticker', 'orderbook', 'trades'
    const interval = searchParams.get('interval') || '1d';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    let data;

    switch (type) {
      case 'klines':
        data = await binanceClient.getKlines(symbol, interval, limit);
        break;
      
      case 'ticker':
        data = await binanceClient.getTicker24hr(symbol);
        break;
      
      case 'orderbook':
        data = await binanceClient.getOrderBook(symbol, limit);
        break;
      
      case 'trades':
        data = await binanceClient.getRecentTrades(symbol, limit);
        break;
      
      case 'price':
        data = await binanceClient.getCurrentPrice(symbol);
        break;
      
      default:
        // Default to ticker data
        data = await binanceClient.getTicker24hr(symbol);
    }

    // Add CORS headers for client-side requests
    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Cache-Control', 's-maxage=5, stale-while-revalidate');

    return response;

  } catch (error) {
    console.error('Binance API error:', error);
    
    // Return mock data if Binance API fails
    const mockData = {
      symbol: 'BTCUSDT',
      lastPrice: '43750.00',
      priceChange: '850.50',
      priceChangePercent: '1.98',
      highPrice: '44500.00',
      lowPrice: '42800.00',
      volume: '28500.12345678',
      count: 2834729
    };

    return NextResponse.json(mockData, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body; // Array of symbols for batch requests

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    // Batch fetch ticker data for multiple symbols
    const promises = symbols.map(symbol => 
      binanceClient.getTicker24hr(symbol).catch(error => {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    
    // Filter out failed requests
    const validResults = results.filter(result => result !== null);

    return NextResponse.json(validResults);

  } catch (error) {
    console.error('Batch Binance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}