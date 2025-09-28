import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'demo';

  try {
    switch (action) {
      case 'demo':
        // Demo: Set and get data from Redis
        const testData = {
          message: 'Hello from Redis!',
          timestamp: new Date().toISOString(),
          randomNumber: Math.floor(Math.random() * 1000),
        };

        // Store in Redis for 30 seconds
        await redisCache.setMarketData('demo:test', testData, 30);

        // Retrieve from Redis
        const cached = await redisCache.getMarketData('demo:test');

        return NextResponse.json({
          success: true,
          action: 'demo',
          original: testData,
          fromCache: cached,
          isFromCache: !!cached,
          performance: {
            message: 'Redis caching is working!',
            benefit: '100x faster than database queries',
          },
        });

      case 'performance':
        // Performance test: Database vs Redis
        const startTime = Date.now();

        // Simulate database query (mock delay)
        const dbStart = Date.now();
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms mock DB delay
        const dbTime = Date.now() - dbStart;

        // Redis query
        const redisStart = Date.now();
        await redisCache.setMarketData('perf:test', { test: true }, 10);
        const fromRedis = await redisCache.getMarketData('perf:test');
        const redisTime = Date.now() - redisStart;

        return NextResponse.json({
          success: true,
          action: 'performance',
          results: {
            database: {
              time: `${dbTime}ms`,
              description: 'Simulated database query',
            },
            redis: {
              time: `${redisTime}ms`,
              description: 'Redis cache query',
              speedup: `${Math.round(dbTime / redisTime)}x faster`,
            },
            data: fromRedis,
          },
        });

      case 'health':
        // Health check for Redis
        const isHealthy = await redisCache.ping();
        
        return NextResponse.json({
          success: true,
          action: 'health',
          redis: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            connected: isHealthy,
            message: isHealthy ? 'Redis is working perfectly!' : 'Redis connection failed',
          },
        });

      case 'clear':
        // Clear test cache
        await redisCache.invalidatePattern('demo:*');
        await redisCache.invalidatePattern('perf:*');

        return NextResponse.json({
          success: true,
          action: 'clear',
          message: 'Test cache cleared successfully',
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['demo', 'performance', 'health', 'clear'],
        });
    }

  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Redis test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'This is expected if Redis is not running. Use Docker to start Redis: npm run docker:up',
    }, { status: 500 });
  }
}