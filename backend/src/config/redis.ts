import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error('Redis SET error:', error);
  }
}

export async function cacheGet(key: string): Promise<any | null> {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis DEL error:', error);
  }
}
