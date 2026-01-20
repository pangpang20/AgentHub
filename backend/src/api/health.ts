import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';
import PerformanceMonitor from '../services/performance';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
  };
  metrics?: {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
  };
  performance?: Record<string, unknown>;
}

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const health: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unhealthy',
      redis: 'unhealthy',
    },
  };

  try {
    // Check database connection with timeout
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5000, 'Database connection timeout');
    health.services.database = 'healthy';
  } catch (error) {
    health.status = 'unhealthy';
    health.services.database = 'unhealthy';
  }

  try {
    // Check Redis connection with timeout
    await withTimeout(redis.ping(), 3000, 'Redis connection timeout');
    health.services.redis = 'healthy';
  } catch (error) {
    health.status = 'unhealthy';
    health.services.redis = 'unhealthy';
  }

  // Add metrics if detailed health check
  if (req.query.detailed === 'true') {
    health.metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };
  }

  // Add performance metrics if available
  if (req.query.performance === 'true') {
    const perfMetrics = PerformanceMonitor.getAllMetrics();
    if (Object.keys(perfMetrics).length > 0) {
      health.performance = perfMetrics;
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  const ready = {
    ready: true,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check if database is ready with timeout
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5000, 'Database connection timeout');
  } catch {
    ready.ready = false;
    res.status(503).json(ready);
    return;
  }

  try {
    // Check if Redis is ready with timeout
    await withTimeout(redis.ping(), 3000, 'Redis connection timeout');
  } catch {
    ready.ready = false;
    res.status(503).json(ready);
    return;
  }

  res.json(ready);
};

export const livenessCheck = async (_req: Request, res: Response): Promise<void> => {
  const alive = {
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  res.json(alive);
};
