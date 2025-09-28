// Unified price service - single source of truth for all market prices
import { BinanceApiClient } from './binance-client';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: number;
}

export class PriceService {
  private static instance: PriceService;
  private priceCache = new Map<string, PriceData>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5000; // 5 seconds cache

  // Realistic base prices for fallback
  private readonly FALLBACK_PRICES: Record<string, number> = {
    'BTCUSDT': 43500.00,
    'ETHUSDT': 2650.00,
    'SOLUSDT': 205.80,    // Realistic SOL price
    'XRPUSDT': 2.831,     // Realistic XRP price (NOT $43,750!)
    'ADAUSDT': 0.87,
    'DOGEUSDT': 0.385,
    'AAPL': 175.50,
    'MSFT': 415.25,
    'TSLA': 248.75,
    'NVDA': 725.30,
    'GOOGL': 2850.40,
  };

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const priceData = await this.getPriceData(symbol);
    return priceData.price;
  }

  async getPriceData(symbol: string): Promise<PriceData> {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    const expiry = this.cacheExpiry.get(symbol);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      let priceData: PriceData;

      if (symbol.endsWith('USDT')) {
        // Try to get real Binance data for crypto
        priceData = await this.fetchBinancePrice(symbol);
      } else {
        // For stocks, use mock realistic data (would integrate with real stock API)
        priceData = await this.generateStockPrice(symbol);
      }

      // Cache the result
      this.priceCache.set(symbol, priceData);
      this.cacheExpiry.set(symbol, Date.now() + this.CACHE_DURATION);

      return priceData;

    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return this.getFallbackPrice(symbol);
    }
  }

  private async fetchBinancePrice(symbol: string): Promise<PriceData> {
    try {
      // Try enhanced Binance API first
      const response = await fetch(`/api/binance?symbol=${symbol}&type=ticker`);
      if (response.ok) {
        const data = await response.json();
        
        return {
          symbol,
          price: parseFloat(data.price || data.lastPrice),
          change24h: parseFloat(data.priceChange || '0'),
          changePercent: parseFloat(data.priceChangePercent || '0'),
          high24h: parseFloat(data.highPrice || data.price),
          low24h: parseFloat(data.lowPrice || data.price),
          volume24h: parseFloat(data.volume || '0'),
          lastUpdate: Date.now(),
        };
      }
    } catch (error) {
      console.log('Enhanced Binance API not available, using fallback');
    }

    // Fallback to realistic mock data
    return this.getFallbackPrice(symbol);
  }

  private async generateStockPrice(symbol: string): Promise<PriceData> {
    const basePrice = this.FALLBACK_PRICES[symbol] || 150;
    
    // Generate realistic intraday movement
    const changePercent = (Math.random() - 0.5) * 4; // ±2% daily range
    const change24h = basePrice * (changePercent / 100);
    const currentPrice = basePrice + change24h;

    return {
      symbol,
      price: currentPrice,
      change24h,
      changePercent,
      high24h: currentPrice + Math.abs(change24h) * 0.5,
      low24h: currentPrice - Math.abs(change24h) * 0.5,
      volume24h: Math.floor(Math.random() * 10000000) + 1000000, // 1M-11M volume
      lastUpdate: Date.now(),
    };
  }

  private getFallbackPrice(symbol: string): PriceData {
    const basePrice = this.FALLBACK_PRICES[symbol] || 100;
    const changePercent = (Math.random() - 0.5) * 2; // ±1% fallback range
    const change24h = basePrice * (changePercent / 100);

    return {
      symbol,
      price: basePrice + change24h,
      change24h,
      changePercent,
      high24h: basePrice * 1.02,
      low24h: basePrice * 0.98,
      volume24h: 5000000,
      lastUpdate: Date.now(),
    };
  }

  // Clear cache for real-time updates
  clearCache(symbol?: string) {
    if (symbol) {
      this.priceCache.delete(symbol);
      this.cacheExpiry.delete(symbol);
    } else {
      this.priceCache.clear();
      this.cacheExpiry.clear();
    }
  }

  // Subscribe to price updates (for WebSocket integration)
  subscribeToPriceUpdates(symbol: string, callback: (priceData: PriceData) => void) {
    const interval = setInterval(async () => {
      try {
        this.clearCache(symbol); // Force fresh data
        const priceData = await this.getPriceData(symbol);
        callback(priceData);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const priceService = PriceService.getInstance();