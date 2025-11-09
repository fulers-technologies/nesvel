import { Logger } from '@nestjs/common';
import { IRateLimiterOptions } from '../interfaces';
import { RateLimitExceededException } from '../exceptions';

/**
 * Rate limiter implementation for controlling request throughput.
 *
 * Implements sliding or fixed window rate limiting on a per-topic basis.
 * Prevents message floods and ensures fair resource usage across topics.
 *
 * @remarks
 * The rate limiter tracks requests per topic within configurable time windows.
 * It can use either:
 * - Sliding window: Smooth rate limiting that considers recent history
 * - Fixed window: Simple periodic reset (can allow bursts at boundaries)
 *
 * @example
 * ```typescript
 * const rateLimiter = RateLimiter.make(logger, {
 *   maxRequestsPerWindow: 100,
 *   windowSize: 60000, // 1 minute
 *   useSlidingWindow: true
 * });
 *
 * try {
 *   await rateLimiter.checkLimit('user.created');
 *   // Proceed with publishing
 * } catch (error: Error | any) {
 *   if (error instanceof RateLimitExceededException) {
 *     // Rate limit hit, wait until resetAt
 *     const waitTime = error.resetAt.getTime() - Date.now();
 *     await sleep(waitTime);
 *   }
 * }
 * ```
 */
export class RateLimiter {
  /**
   * Logger instance for recording rate limit events.
   */
  private readonly logger = new Logger(RateLimiter.name);

  /**
   * Rate limiter configuration options.
   */
  private readonly options: Required<IRateLimiterOptions>;

  /**
   * Map of topic names to arrays of request timestamps.
   * Used for sliding window rate limiting.
   */
  private readonly slidingWindows = new Map<string, number[]>();

  /**
   * Map of topic names to fixed window data.
   * Used for fixed window rate limiting.
   */
  private readonly fixedWindows = new Map<string, { count: number; windowStart: number }>();

  /**
   * Creates a new RateLimiter instance.
   *
   * @param options - Rate limiter configuration
   */
  constructor(options: IRateLimiterOptions) {
    this.options = {
      ...options,
      useSlidingWindow: options.useSlidingWindow ?? true,
    };
  }

  /**
   * Check if a request for the given topic is within rate limits.
   *
   * Records the request and checks if it exceeds the configured rate limit.
   * Throws RateLimitExceededException if the limit is exceeded.
   *
   * @param topic - The topic to check rate limit for
   * @throws {RateLimitExceededException} When rate limit is exceeded
   *
   * @example
   * ```typescript
   * await rateLimiter.checkLimit('orders.created');
   * // If we reach here, we're within limits
   * await publishMessage('orders.created', data);
   * ```
   */
  async checkLimit(topic: string): Promise<void> {
    if (this.options.useSlidingWindow) {
      await this.checkSlidingWindowLimit(topic);
    } else {
      await this.checkFixedWindowLimit(topic);
    }
  }

  /**
   * Check rate limit using sliding window algorithm.
   *
   * Maintains a list of request timestamps and removes old requests
   * outside the current window. Provides smooth rate limiting.
   *
   * @param topic - The topic to check
   * @throws {RateLimitExceededException} When limit exceeded
   */
  private async checkSlidingWindowLimit(topic: string): Promise<void> {
    const now = Date.now();

    // Get or create timestamp array for this topic
    if (!this.slidingWindows.has(topic)) {
      this.slidingWindows.set(topic, []);
    }

    const timestamps = this.slidingWindows.get(topic)!;

    // Remove timestamps outside the current window
    const windowStart = now - this.options.windowSize;
    const recentRequests = timestamps.filter((timestamp) => timestamp > windowStart);
    this.slidingWindows.set(topic, recentRequests);

    // Check if we're at the limit
    if (recentRequests.length >= this.options.maxRequestsPerWindow) {
      // Calculate when the oldest request will age out
      const oldestRequest = recentRequests[0]!; // Safe: array has at least maxRequests items
      const resetAt = new Date(oldestRequest + this.options.windowSize);

      const error = RateLimitExceededException.make(
        `Rate limit exceeded for topic "${topic}": ${recentRequests.length}/${this.options.maxRequestsPerWindow} requests in ${this.options.windowSize}ms window`,
        topic,
        recentRequests.length,
        this.options.maxRequestsPerWindow,
        resetAt,
      );

      this.logger.warn(error.message, {
        topic,
        currentRequests: recentRequests.length,
        maxRequests: this.options.maxRequestsPerWindow,
        resetAt: resetAt.toISOString(),
      });

      throw error;
    }

    // Add current request timestamp
    recentRequests.push(now);

    // Log warning if approaching limit (80% threshold)
    const utilizationPercent = (recentRequests.length / this.options.maxRequestsPerWindow) * 100;
    if (utilizationPercent >= 80) {
      this.logger.warn(
        `Rate limit ${utilizationPercent.toFixed(1)}% utilized for topic "${topic}"`,
        {
          topic,
          currentRequests: recentRequests.length,
          maxRequests: this.options.maxRequestsPerWindow,
          utilizationPercent,
        },
      );
    }
  }

  /**
   * Check rate limit using fixed window algorithm.
   *
   * Counts requests within fixed time windows that reset periodically.
   * Simpler than sliding window but can allow bursts at boundaries.
   *
   * @param topic - The topic to check
   * @throws {RateLimitExceededException} When limit exceeded
   */
  private async checkFixedWindowLimit(topic: string): Promise<void> {
    const now = Date.now();

    // Get or create window data for this topic
    if (!this.fixedWindows.has(topic)) {
      this.fixedWindows.set(topic, {
        count: 0,
        windowStart: now,
      });
    }

    const windowData = this.fixedWindows.get(topic)!;

    // Check if we're in a new window
    const windowEnd = windowData.windowStart + this.options.windowSize;
    if (now >= windowEnd) {
      // Start new window
      windowData.count = 0;
      windowData.windowStart = now;
    }

    // Check if we're at the limit
    if (windowData.count >= this.options.maxRequestsPerWindow) {
      const resetAt = new Date(windowEnd);

      const error = RateLimitExceededException.make(
        `Rate limit exceeded for topic "${topic}": ${windowData.count}/${this.options.maxRequestsPerWindow} requests in current window`,
        topic,
        windowData.count,
        this.options.maxRequestsPerWindow,
        resetAt,
      );

      this.logger.warn(error.message, {
        topic,
        currentRequests: windowData.count,
        maxRequests: this.options.maxRequestsPerWindow,
        resetAt: resetAt.toISOString(),
      });

      throw error;
    }

    // Increment count
    windowData.count++;

    // Log warning if approaching limit (80% threshold)
    const utilizationPercent = (windowData.count / this.options.maxRequestsPerWindow) * 100;
    if (utilizationPercent >= 80) {
      this.logger.warn(
        `Rate limit ${utilizationPercent.toFixed(1)}% utilized for topic "${topic}"`,
        {
          topic,
          currentRequests: windowData.count,
          maxRequests: this.options.maxRequestsPerWindow,
          utilizationPercent,
        },
      );
    }
  }

  /**
   * Get current rate limit statistics for a topic.
   *
   * @param topic - The topic to get stats for
   * @returns Object containing current request count and limit info
   */
  getStats(topic: string): {
    currentRequests: number;
    maxRequests: number;
    utilizationPercent: number;
    resetAt?: Date;
  } {
    const now = Date.now();

    if (this.options.useSlidingWindow) {
      const timestamps = this.slidingWindows.get(topic) || [];
      const windowStart = now - this.options.windowSize;
      const recentRequests = timestamps.filter((t) => t > windowStart);
      const oldestRequest = recentRequests[0];

      return {
        currentRequests: recentRequests.length,
        maxRequests: this.options.maxRequestsPerWindow,
        utilizationPercent: (recentRequests.length / this.options.maxRequestsPerWindow) * 100,
        resetAt: oldestRequest ? new Date(oldestRequest + this.options.windowSize) : undefined,
      };
    } else {
      const windowData = this.fixedWindows.get(topic);
      if (!windowData) {
        return {
          currentRequests: 0,
          maxRequests: this.options.maxRequestsPerWindow,
          utilizationPercent: 0,
        };
      }

      const windowEnd = windowData.windowStart + this.options.windowSize;

      // Check if window has expired
      if (now >= windowEnd) {
        return {
          currentRequests: 0,
          maxRequests: this.options.maxRequestsPerWindow,
          utilizationPercent: 0,
          resetAt: new Date(now + this.options.windowSize),
        };
      }

      return {
        currentRequests: windowData.count,
        maxRequests: this.options.maxRequestsPerWindow,
        utilizationPercent: (windowData.count / this.options.maxRequestsPerWindow) * 100,
        resetAt: new Date(windowEnd),
      };
    }
  }

  /**
   * Reset rate limits for a specific topic.
   *
   * Clears all tracking data for the topic, allowing new requests.
   * Useful for testing or administrative purposes.
   *
   * @param topic - The topic to reset
   */
  reset(topic: string): void {
    this.slidingWindows.delete(topic);
    this.fixedWindows.delete(topic);
    this.logger.debug(`Rate limiter reset for topic: ${topic}`);
  }

  /**
   * Reset all rate limits across all topics.
   *
   * Clears all tracking data. Useful for testing or administrative purposes.
   */
  resetAll(): void {
    this.slidingWindows.clear();
    this.fixedWindows.clear();
    this.logger.debug('Rate limiter reset for all topics');
  }

  /**
   * Clean up old tracking data to prevent memory leaks.
   *
   * Should be called periodically to remove tracking data for
   * inactive topics. Recommended to run every hour.
   *
   * @param inactiveThresholdMs - Remove topics inactive for this long (default: 1 hour)
   */
  cleanup(inactiveThresholdMs: number = 3600000): void {
    const now = Date.now();
    const cutoff = now - inactiveThresholdMs;

    // Cleanup sliding windows
    for (const [topic, timestamps] of this.slidingWindows.entries()) {
      const lastRequest = timestamps[timestamps.length - 1];
      if (lastRequest && lastRequest < cutoff) {
        this.slidingWindows.delete(topic);
        this.logger.debug(`Cleaned up inactive sliding window for topic: ${topic}`);
      }
    }

    // Cleanup fixed windows
    for (const [topic, windowData] of this.fixedWindows.entries()) {
      const windowEnd = windowData.windowStart + this.options.windowSize;
      if (windowEnd < cutoff) {
        this.fixedWindows.delete(topic);
        this.logger.debug(`Cleaned up inactive fixed window for topic: ${topic}`);
      }
    }
  }
}
