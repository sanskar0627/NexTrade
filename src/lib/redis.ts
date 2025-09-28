import Redis, { RedisOptions } from 'ioredis';

// Type for Redis client instance
type RedisClient = InstanceType<typeof Redis>;

// Redis client singleton
let redisClient: RedisClient | null = null;

export function getRedisClient(): RedisClient | null {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not configured, running without Redis cache');
    return null;
  }

  if (!redisClient) {
    try {
      const redisOptions: RedisOptions = {
        // Connection settings
        connectTimeout: 10000,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        
        // Reconnection settings
        enableReadyCheck: false,
        
        // Connection pool
        family: 4,
        keepAlive: 30000,
        
        // Error handling
        enableOfflineQueue: false,
      };

      redisClient = new Redis(process.env.REDIS_URL, redisOptions);

      redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      redisClient.on('error', (error: Error) => {
        console.error('❌ Redis connection error:', error);
      });

      redisClient.on('close', () => {
        console.log('🔌 Redis connection closed');
      });

    } catch (error) {
      console.warn('Redis not available, falling back to database-only caching');
      return null;
    }
  }

  return redisClient;
}

// Redis utilities for trading platform
export class RedisCache {
  private client: RedisClient | null;

  constructor() {
    this.client = getRedisClient();
  }

  // Market data caching
  async setMarketData(symbol: string, data: any, ttl: number = 30): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.setex(`market:${symbol}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis setMarketData error:', error);
    }
  }

  async getMarketData(symbol: string): Promise<any | null> {
    if (!this.client) return null;
    
    try {
      const data = await this.client.get(`market:${symbol}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getMarketData error:', error);
      return null;
    }
  }

  // User session caching
  async setUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.setex(`session:${userId}`, ttl, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Redis setUserSession error:', error);
    }
  }

  async getUserSession(userId: string): Promise<any | null> {
    if (!this.client) return null;
    
    try {
      const data = await this.client.get(`session:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getUserSession error:', error);
      return null;
    }
  }

  // Order book caching for real-time trading
  async setOrderBook(symbol: string, orderBook: any, ttl: number = 5): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.setex(`orderbook:${symbol}`, ttl, JSON.stringify(orderBook));
    } catch (error) {
      console.error('Redis setOrderBook error:', error);
    }
  }

  async getOrderBook(symbol: string): Promise<any | null> {
    if (!this.client) return null;
    
    try {
      const data = await this.client.get(`orderbook:${symbol}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getOrderBook error:', error);
      return null;
    }
  }

  // Portfolio caching
  async setPortfolioCache(userId: string, portfolio: any, ttl: number = 300): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.setex(`portfolio:${userId}`, ttl, JSON.stringify(portfolio));
    } catch (error) {
      console.error('Redis setPortfolioCache error:', error);
    }
  }

  async getPortfolioCache(userId: string): Promise<any | null> {
    if (!this.client) return null;
    
    try {
      const data = await this.client.get(`portfolio:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis getPortfolioCache error:', error);
      return null;
    }
  }

  // Invalidate cache
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client) return;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      redisClient = null;
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();