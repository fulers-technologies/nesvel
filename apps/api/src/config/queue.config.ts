/**
 * Queue Configuration
 *
 * Configuration for job queues (Bull, BullMQ, etc.)
 *
 * @module config/queue.config
 */

export interface IQueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
    removeOnComplete: boolean | number;
    removeOnFail: boolean | number;
  };
  limiter?: {
    max: number;
    duration: number;
  };
}

export const queueConfig: IQueueConfig = {
  redis: {
    host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT || '6379', 10),
    password: process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
    db: parseInt(process.env.QUEUE_REDIS_DB || '1', 10),
  },
  defaultJobOptions: {
    attempts: parseInt(process.env.QUEUE_JOB_ATTEMPTS || '3', 10),
    backoff: {
      type: (process.env.QUEUE_BACKOFF_TYPE as any) || 'exponential',
      delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '1000', 10),
    },
    removeOnComplete: process.env.QUEUE_REMOVE_ON_COMPLETE === 'true' ? true : 100,
    removeOnFail: process.env.QUEUE_REMOVE_ON_FAIL === 'true' ? true : 500,
  },
  limiter: process.env.QUEUE_RATE_LIMIT
    ? {
        max: parseInt(process.env.QUEUE_RATE_LIMIT_MAX || '10', 10),
        duration: parseInt(process.env.QUEUE_RATE_LIMIT_DURATION || '1000', 10),
      }
    : undefined,
};
