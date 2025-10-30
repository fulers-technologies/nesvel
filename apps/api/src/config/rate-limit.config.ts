/**
 * Rate Limit Configuration
 *
 * Rate limiting settings to protect API from abuse.
 *
 * @module RateLimitConfig
 */

export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  max: number;
  message: string;
  statusCode: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (req: any) => string;
  skip?: (req: any) => boolean;
  handler?: (req: any, res: any) => void;
}

export const rateLimitConfig = (): RateLimitConfig => {
  return {
    enabled: process.env.RATE_LIMIT_ENABLED?.toLowerCase() !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later',
    statusCode: parseInt(process.env.RATE_LIMIT_STATUS_CODE || '429', 10),
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL?.toLowerCase() === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED?.toLowerCase() === 'true',
  };
};
