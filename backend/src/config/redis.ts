import { createClient } from 'redis';
import config from './index';

const redis = createClient({
  url: config.redisUrl,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis Client Connected'));
redis.on('disconnect', () => console.log('Redis Client Disconnected'));

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't throw error, allow app to continue without Redis
  }
};

export const disconnectRedis = async (): Promise<void> => {
  await redis.disconnect();
};

export default redis;
