import { PrismaClient } from '@prisma/client';
import { RedisManager } from './RedisManager';

const prisma = new PrismaClient();
const redisManager = RedisManager.getInstance();

interface DemoTrade {
  market: string;
  price: string;
  quantity: string;
  side: 'BUY' | 'SELL';
}

// Demo markets and their price ranges
const DEMO_MARKETS = {
  'SOL_USDC': { min: 95, max: 105, current: 100 },
  'BTC_USDC': { min: 44000, max: 46000, current: 45000 },
};

class DemoTradeGenerator {
  private isRunning = false;
  private intervals: NodeJS.Timeout[] = [];

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting demo trade generator...');

    // Generate trades for each market
    Object.keys(DEMO_MARKETS).forEach(market => {
      // Generate a trade every 2-5 seconds for each market
      const interval = setInterval(() => {
        this.generateRandomTrade(market);
      }, Math.random() * 3000 + 2000); // 2-5 second intervals
      
      this.intervals.push(interval);
    });
  }

  stop() {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('Demo trade generator stopped');
  }

  private async generateRandomTrade(market: string) {
    try {
      const marketConfig = DEMO_MARKETS[market as keyof typeof DEMO_MARKETS];
      if (!marketConfig) return;

      // Random price within 2% of current price
      const priceVariation = (Math.random() - 0.5) * 0.04; // ±2%
      const price = marketConfig.current * (1 + priceVariation);
      
      // Random quantity between 0.1 and 10
      const quantity = Math.random() * 9.9 + 0.1;
      
      // Random side
      const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';

      const trade: DemoTrade = {
        market,
        price: price.toFixed(2),
        quantity: quantity.toFixed(6),
        side,
      };

      // Store trade in database and publish to Redis
      await this.saveTrade(trade);
      
      // Update market price
      marketConfig.current = price;
      
      console.log(`Generated demo trade: ${market} ${side} ${trade.quantity} at ${trade.price}`);
      
    } catch (error) {
      console.error('Error generating demo trade:', error);
    }
  }

  private async saveTrade(trade: DemoTrade) {
    try {
      // Get market info
      const marketData = await prisma.market.findUnique({
        where: { symbol: trade.market }
      });

      if (!marketData) return;

      // Create demo trade record
      const tradeRecord = await prisma.trade.create({
        data: {
          marketId: marketData.id,
          buyOrderId: 'demo-buy-' + Date.now(),
          sellOrderId: 'demo-sell-' + Date.now(),
          buyerId: 'demo-buyer',
          sellerId: 'demo-seller',
          quantity: trade.quantity,
          price: trade.price,
          timestamp: new Date(),
        },
      });

      // Update market last price
      await prisma.market.update({
        where: { id: marketData.id },
        data: { lastPrice: trade.price },
      });

      // Publish to Redis for real-time updates
      await redisManager.publishMessage('TRADE_UPDATE', {
        market: trade.market,
        trade: {
          id: tradeRecord.id,
          price: trade.price,
          quantity: trade.quantity,
          timestamp: tradeRecord.timestamp.toISOString(),
          side: trade.side,
        },
      });

      // Publish market price update
      await redisManager.publishMessage('PRICE_UPDATE', {
        market: trade.market,
        price: trade.price,
      });

    } catch (error) {
      console.error('Error saving demo trade:', error);
    }
  }

  // Generate initial batch of recent trades
  async generateInitialTrades() {
    console.log('Generating initial demo trades...');
    
    for (const market of Object.keys(DEMO_MARKETS)) {
      // Generate 10 initial trades for each market
      for (let i = 0; i < 10; i++) {
        await this.generateRandomTrade(market);
        // Small delay between trades
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

// Export singleton instance
export const demoTradeGenerator = new DemoTradeGenerator();

// Auto-start if this file is run directly
if (require.main === module) {
  async function main() {
    await demoTradeGenerator.generateInitialTrades();
    demoTradeGenerator.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down demo trade generator...');
      demoTradeGenerator.stop();
      process.exit(0);
    });
  }
  
  main().catch(console.error);
}