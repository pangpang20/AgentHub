import { createClient } from 'redis';
import config from './index';

const redis = createClient({
  url: config.redisUrl,
  socket: {
    reconnectStrategy: () => false,
    connectTimeout: 3000,
  },
});

redis.on('error', (err) => {
  // Suppress Redis errors during startup
  console.error('Redis Client Error (suppressed):', err.message);
});
redis.on('connect', () => console.log('Redis Client Connected'));
redis.on('disconnect', () => console.log('Redis Client Disconnected'));

let isConnecting = false;
let isConnected = false;

export const connectRedis = async (): Promise<void> => {
  if (isConnected) {
    console.log('Redis already connected');
    return;
  }

  if (isConnecting) {
    console.log('Redis connection already in progress');
    return;
  }

  try {
    isConnecting = true;
    console.log('Attempting to connect to Redis...');

    // Set a timeout for the connection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
    });

    await Promise.race([redis.connect(), timeoutPromise]);
    isConnected = true;
    console.log('Redis connect() completed successfully');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Don't throw error, allow app to continue without Redis
  } finally {
    isConnecting = false;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (isConnected) {
      await redis.disconnect();
      isConnected = false;
    }
  } catch (error) {
    console.error('Failed to disconnect Redis:', error);
  }
};

export default redis;
