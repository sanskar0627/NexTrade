// Enhanced Binance API client with authentication
export class BinanceApiClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl = 'https://api.binance.com';

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  // Create signature for authenticated requests
  private createSignature(queryString: string): string {
    if (typeof window !== 'undefined') {
      // For client-side, we'll use public endpoints only
      return '';
    }
    
    const crypto = require('crypto');
    return crypto.createHmac('sha256', this.secretKey).update(queryString).digest('hex');
  }

  // Get authenticated headers
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.apiKey) {
      headers['X-MBX-APIKEY'] = this.apiKey;
    }

    return headers;
  }

  // Public market data endpoints (no authentication required)
  async getKlines(symbol: string, interval: string, limit: number = 500) {
    const url = `${this.baseUrl}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance klines:', error);
      throw error;
    }
  }

  async getTicker24hr(symbol?: string) {
    const url = symbol 
      ? `${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}`
      : `${this.baseUrl}/api/v3/ticker/24hr`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance ticker:', error);
      throw error;
    }
  }

  async getOrderBook(symbol: string, limit: number = 100) {
    const url = `${this.baseUrl}/api/v3/depth?symbol=${symbol}&limit=${limit}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance order book:', error);
      throw error;
    }
  }

  async getExchangeInfo() {
    const url = `${this.baseUrl}/api/v3/exchangeInfo`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance exchange info:', error);
      throw error;
    }
  }

  // Real-time price updates
  async getCurrentPrice(symbol: string) {
    const url = `${this.baseUrl}/api/v3/ticker/price?symbol=${symbol}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      throw error;
    }
  }

  // Get recent trades
  async getRecentTrades(symbol: string, limit: number = 500) {
    const url = `${this.baseUrl}/api/v3/trades?symbol=${symbol}&limit=${limit}`;
    
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Binance trades:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const binanceClient = typeof window === 'undefined' 
  ? new BinanceApiClient(
      process.env.BINANCE_API_KEY || '', 
      process.env.BINANCE_SECRET_KEY || ''
    )
  : new BinanceApiClient('', ''); // Client-side doesn't need secrets