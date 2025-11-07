/**
 * Cache Configuration
 *
 * Configuration for caching layer including Redis, memory cache, etc.
 *
 * @module config/cache.config
 */

export enum CacheDriver {
  MEMORY = 'memory',
  REDIS = 'redis',
  MEMCACHED = 'memcached',
}

export interface ICacheConfig {
  driver: CacheDriver;
  ttl: number; // Default TTL in seconds
  max: number; // Max items in memory cache
  redis?: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
}

export const cacheConfig: ICacheConfig = {
  driver: (process.env.CACHE_DRIVER as CacheDriver) || CacheDriver.MEMORY,
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes
  max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  redis: process.env.REDIS_HOST
    ? {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'nesvel:cache:',
      }
    : undefined,
};
