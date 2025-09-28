// Market data utilities for crypto and stocks
export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdate: number;
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Binance WebSocket connection for crypto data
export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Set<string>();
  private callbacks = new Map<string, Function>();

  constructor() {
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    this.ws = new WebSocket('wss://stream.binance.com:9443/ws');
    
    this.ws.onopen = () => {
      console.log('Binance WebSocket connected');
      // Resubscribe to existing subscriptions
      this.subscriptions.forEach(sub => {
        this.subscribe(sub);
      });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.stream && this.callbacks.has(data.stream)) {
        this.callbacks.get(data.stream)?.(data.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Binance WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Binance WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(stream: string, callback?: Function) {
    this.subscriptions.add(stream);
    if (callback) {
      this.callbacks.set(stream, callback);
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now()
      }));
    }
  }

  unsubscribe(stream: string) {
    this.subscriptions.delete(stream);
    this.callbacks.delete(stream);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [stream],
        id: Date.now()
      }));
    }
  }

  // Subscribe to ticker data
  subscribeTicker(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@ticker`;
    this.subscribe(stream, callback);
  }

  // Subscribe to depth/orderbook data
  subscribeDepth(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@depth20@100ms`;
    this.subscribe(stream, callback);
  }

  // Subscribe to trade data
  subscribeTrades(symbol: string, callback: (data: any) => void) {
    const stream = `${symbol.toLowerCase()}@trade`;
    this.subscribe(stream, callback);
  }

  disconnect() {
    this.subscriptions.clear();
    this.callbacks.clear();
    this.ws?.close();
  }
}

// Finnhub API client for stock data
export class FinnhubClient {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';
  private wsUrl = 'wss://ws.finnhub.io';
  private ws: WebSocket | null = null;
  private callbacks = new Map<string, Function>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // REST API methods
  async getQuote(symbol: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`
    );
    return response.json();
  }

  async getCandles(
    symbol: string,
    resolution: string,
    from: number,
    to: number
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`
    );
    return response.json();
  }

  // WebSocket methods
  connectWebSocket() {
    if (typeof window === 'undefined') return;

    this.ws = new WebSocket(`${this.wsUrl}?token=${this.apiKey}`);
    
    this.ws.onopen = () => {
      console.log('Finnhub WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'trade' && data.data) {
        data.data.forEach((trade: any) => {
          const symbol = trade.s;
          if (this.callbacks.has(symbol)) {
            this.callbacks.get(symbol)?.(trade);
          }
        });
      }
    };

    this.ws.onerror = (error) => {
      console.error('Finnhub WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Finnhub WebSocket closed, reconnecting...');
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  subscribeStock(symbol: string, callback: (data: any) => void) {
    this.callbacks.set(symbol, callback);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }));
    }
  }

  unsubscribeStock(symbol: string) {
    this.callbacks.delete(symbol);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
      }));
    }
  }

  disconnect() {
    this.callbacks.clear();
    this.ws?.close();
  }
}

// Market data manager that handles both crypto and stocks
export class MarketDataManager {
  private binance: BinanceWebSocket;
  private finnhub: FinnhubClient | null = null;
  private priceCallbacks = new Map<string, Function>();

  constructor(finnhubApiKey?: string) {
    this.binance = new BinanceWebSocket();
    
    if (finnhubApiKey) {
      this.finnhub = new FinnhubClient(finnhubApiKey);
      this.finnhub.connectWebSocket();
    }
  }

  subscribePrice(symbol: string, callback: (price: number) => void) {
    this.priceCallbacks.set(symbol, callback);

    // Determine if it's crypto or stock based on symbol format
    if (symbol.endsWith('USDT')) {
      // Crypto symbol
      this.binance.subscribeTicker(symbol, (data: any) => {
        callback(parseFloat(data.c));
      });
    } else {
      // Stock symbol
      this.finnhub?.subscribeStock(symbol, (data: any) => {
        callback(data.p);
      });
    }
  }

  subscribeOrderBook(symbol: string, callback: (orderBook: OrderBook) => void) {
    if (symbol.endsWith('USDT')) {
      this.binance.subscribeDepth(symbol, (data: any) => {
        const orderBook: OrderBook = {
          symbol,
          bids: data.bids.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty),
            total: parseFloat(price) * parseFloat(qty)
          })),
          asks: data.asks.map(([price, qty]: [string, string]) => ({
            price: parseFloat(price),
            quantity: parseFloat(qty),
            total: parseFloat(price) * parseFloat(qty)
          })),
          lastUpdate: Date.now()
        };
        callback(orderBook);
      });
    }
  }

  unsubscribe(symbol: string) {
    this.priceCallbacks.delete(symbol);

    if (symbol.endsWith('USDT')) {
      this.binance.unsubscribe(`${symbol.toLowerCase()}@ticker`);
      this.binance.unsubscribe(`${symbol.toLowerCase()}@depth20@100ms`);
    } else {
      this.finnhub?.unsubscribeStock(symbol);
    }
  }

  disconnect() {
    this.binance.disconnect();
    this.finnhub?.disconnect();
    this.priceCallbacks.clear();
  }
}