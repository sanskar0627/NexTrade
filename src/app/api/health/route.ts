import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const healthChecks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: false,
      redis: false,
      memory: false,
    },
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    healthChecks.checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
    healthChecks.status = 'unhealthy';
  }

  try {
    // Redis health check (if Redis is available)
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      healthChecks.checks.redis = true;
    } else {
      healthChecks.checks.redis = true; // Redis is optional
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
    // Don't mark as unhealthy if Redis is optional
  }

  // Memory usage check
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  healthChecks.checks.memory = memUsageMB < 500; // Alert if over 500MB

  const statusCode = healthChecks.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthChecks, { status: statusCode });
}