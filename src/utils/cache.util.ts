import redis from '@database/redis';
import { logger } from '@logger/logger';

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (err) {
    logger.error({ err, key }, 'Redis GET failed — falling back to DB');
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.error({ err, key }, 'Redis SET failed — continuing without cache');
  }
};

export const deleteCache = async (keyPattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(keyPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.error({ err, keyPattern }, 'Redis DELETE failed');
  }
};
