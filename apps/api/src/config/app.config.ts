/**
 * Application Configuration
 *
 * Central configuration for application-level settings including:
 * - Environment settings
 * - Server configuration
 * - Application metadata
 * - Feature flags
 * - Default behaviors
 *
 * @module config/app.config
 */

/**
 * Application environment type
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Application configuration interface
 */
export interface IAppConfig {
  /**
   * Application name
   */
  name: string;

  /**
   * Application version
   */
  version: string;

  /**
   * Application description
   */
  description: string;

  /**
   * Current environment
   */
  environment: Environment;

  /**
   * Application URL (for redirects, emails, etc.)
   */
  url: string;

  /**
   * API prefix for all routes (e.g., 'api/v1')
   */
  apiPrefix: string;

  /**
   * Server configuration
   */
  server: {
    /**
     * Server port
     */
    port: number;

    /**
     * Server host
     */
    host: string;

    /**
     * Enable HTTPS
     */
    https: boolean;

    /**
     * Request timeout in milliseconds
     */
    timeout: number;

    /**
     * Body size limit
     */
    bodySizeLimit: string;
  };

  /**
   * Security settings
   */
  security: {
    /**
     * Enable helmet security headers
     */
    helmet: boolean;

    /**
     * Trust proxy (for running behind reverse proxy)
     */
    trustProxy: boolean;

    /**
     * Allowed origins (for CORS)
     */
    allowedOrigins: string[];

    /**
     * Enable CSRF protection
     */
    csrf: boolean;
  };

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Log level
     */
    level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';

    /**
     * Enable file logging
     */
    fileLogging: boolean;

    /**
     * Log directory
     */
    logDir: string;

    /**
     * Enable pretty printing (dev only)
     */
    prettyPrint: boolean;
  };

  /**
   * Feature flags
   */
  features: {
    /**
     * Enable API documentation (Swagger)
     */
    swagger: boolean;

    /**
     * Enable search functionality
     */
    search: boolean;

    /**
     * Enable PubSub messaging
     */
    pubsub: boolean;

    /**
     * Enable rate limiting
     */
    rateLimit: boolean;

    /**
     * Enable metrics/monitoring
     */
    metrics: boolean;

    /**
     * Enable health checks
     */
    healthCheck: boolean;
  };

  /**
   * Maintenance mode
   */
  maintenance: {
    /**
     * Enable maintenance mode
     */
    enabled: boolean;

    /**
     * Maintenance message
     */
    message: string;

    /**
     * Allowed IPs during maintenance
     */
    allowedIps: string[];
  };
}

/**
 * Load application configuration from environment variables
 */
export const appConfig: IAppConfig = {
  name: process.env.APP_NAME || 'Nesvel API',
  version: process.env.APP_VERSION || '1.0.0',
  description: process.env.APP_DESCRIPTION || 'NestJS API with Laravel-style features',
  environment: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
  url: process.env.APP_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api',

  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    https: process.env.HTTPS === 'true',
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    bodySizeLimit: process.env.BODY_SIZE_LIMIT || '10mb',
  },

  security: {
    helmet: process.env.SECURITY_HELMET !== 'false',
    trustProxy: process.env.TRUST_PROXY === 'true',
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    csrf: process.env.CSRF_PROTECTION === 'true',
  },

  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    fileLogging: process.env.FILE_LOGGING === 'true',
    logDir: process.env.LOG_DIR || './logs',
    prettyPrint: process.env.NODE_ENV === 'development',
  },

  features: {
    swagger: process.env.ENABLE_SWAGGER !== 'false',
    search: process.env.ENABLE_SEARCH !== 'false',
    pubsub: process.env.ENABLE_PUBSUB !== 'false',
    rateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    metrics: process.env.ENABLE_METRICS === 'true',
    healthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
  },

  maintenance: {
    enabled: process.env.MAINTENANCE_MODE === 'true',
    message:
      process.env.MAINTENANCE_MESSAGE || 'System is under maintenance. Please try again later.',
    allowedIps: process.env.MAINTENANCE_ALLOWED_IPS
      ? process.env.MAINTENANCE_ALLOWED_IPS.split(',')
      : [],
  },
};

/**
 * Check if application is in production environment
 */
export const isProduction = (): boolean => {
  return appConfig.environment === Environment.PRODUCTION;
};

/**
 * Check if application is in development environment
 */
export const isDevelopment = (): boolean => {
  return appConfig.environment === Environment.DEVELOPMENT;
};

/**
 * Check if application is in test environment
 */
export const isTest = (): boolean => {
  return appConfig.environment === Environment.TEST;
};

/**
 * Get full API URL with prefix
 */
export const getApiUrl = (): string => {
  return `${appConfig.url}/${appConfig.apiPrefix}`;
};
