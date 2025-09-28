import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, redisCache } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const redis = getRedisClient();
    
    const monitoringData = {
      timestamp: new Date().toISOString(),
      services: {
        redis: {
          status: 'unknown' as string,
          connected: false,
          memory: null as string | null,
          keys: null as number | null,
          info: null as string | null,
        },
        database: {
          status: 'unknown' as string,
          connected: false,
          connectionCount: null as number | null,
        },
        cache: {
          hitRate: 0,
          missRate: 0,
          totalRequests: 0,
        }
      },
      performance: {
        avgResponseTime: 0,
        cacheEfficiency: 0,
      }
    };

    // Redis monitoring
    if (redis) {
      try {
        const startTime = Date.now();
        const pong = await redis.ping();
        const responseTime = Date.now() - startTime;
        
        if (pong === 'PONG') {
          monitoringData.services.redis.status = 'healthy';
          monitoringData.services.redis.connected = true;
          
          // Get Redis info
          const info = await redis.info('memory');
          const dbInfo = await redis.info('keyspace');
          const keyCount = await redis.dbsize();
          
          monitoringData.services.redis.memory = info;
          monitoringData.services.redis.keys = keyCount;
          monitoringData.services.redis.info = dbInfo;
          monitoringData.performance.avgResponseTime = responseTime;
        }
      } catch (error) {
        monitoringData.services.redis.status = 'error';
        console.error('Redis monitoring error:', error);
      }
    } else {
      monitoringData.services.redis.status = 'disabled';
    }

    // Database monitoring
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;
      
      monitoringData.services.database.status = 'healthy';
      monitoringData.services.database.connected = true;
      
      // Get connection info if available
      try {
        const connections = await prisma.$queryRaw`
          SELECT count(*) as connection_count 
          FROM pg_stat_activity 
          WHERE state = 'active'
        ` as any[];
        
        monitoringData.services.database.connectionCount = connections[0]?.connection_count || 0;
      } catch (e) {
        // PostgreSQL specific query might fail on other databases
        monitoringData.services.database.connectionCount = null;
      }
      
    } catch (error) {
      monitoringData.services.database.status = 'error';
      console.error('Database monitoring error:', error);
    }

    // Cache performance metrics (simplified)
    if (redis) {
      try {
        // Get some sample cache metrics
        const cacheStats = await redis.info('stats');
        const lines = cacheStats.split('\r\n');
        
        let keyspaceHits = 0;
        let keyspaceMisses = 0;
        
        for (const line of lines) {
          if (line.startsWith('keyspace_hits:')) {
            keyspaceHits = parseInt(line.split(':')[1]);
          }
          if (line.startsWith('keyspace_misses:')) {
            keyspaceMisses = parseInt(line.split(':')[1]);
          }
        }
        
        const totalRequests = keyspaceHits + keyspaceMisses;
        monitoringData.services.cache.totalRequests = totalRequests;
        
        if (totalRequests > 0) {
          monitoringData.services.cache.hitRate = (keyspaceHits / totalRequests) * 100;
          monitoringData.services.cache.missRate = (keyspaceMisses / totalRequests) * 100;
          monitoringData.performance.cacheEfficiency = monitoringData.services.cache.hitRate;
        }
      } catch (error) {
        console.error('Cache stats error:', error);
      }
    }

    return NextResponse.json(monitoringData);

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch monitoring data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Clear cache endpoint
export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedisClient();
    
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || '*';
    
    await redisCache.invalidatePattern(pattern);
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared for pattern: ${pattern}`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}