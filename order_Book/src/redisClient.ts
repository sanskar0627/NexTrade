import { createClient } from 'redis';
import type { OrderBook } from './types.js';

class RedisManager {
  private static instance: RedisManager;
  private client;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.isConnected = true;
    });
  }

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async saveOrderBook(orderbook: OrderBook): Promise<void> {
    await this.ensureConnection();
    await this.client.set('orderbook', JSON.stringify(orderbook));
  }

  async loadOrderBook(): Promise<OrderBook | null> {
    await this.ensureConnection();
    const data = await this.client.get('orderbook');
    return data ? JSON.parse(data) : null;
  }
}

export const redisManager = RedisManager.getInstance();