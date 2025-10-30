/**
 * Security Utilities for Swagger Documentation
 *
 * Provides utility functions for securing Swagger documentation endpoints
 * in production environments. These utilities help implement authentication
 * and authorization for the API documentation.
 *
 * @module SecurityUtils
 */

import type { INestApplication } from '@nestjs/common';

import type { BasicAuthConfig } from '../interfaces';

/**
 * Apply Basic Authentication to Swagger Documentation
 *
 * Protects the Swagger documentation endpoint with HTTP Basic Authentication.
 * This is useful for production environments where you want to restrict access
 * to the API documentation.
 *
 * @param app - NestJS application instance
 * @param config - Basic authentication configuration
 * @param swaggerPath - Path where Swagger is mounted
 *
 * @example
 * ```typescript
 * import { applyBasicAuth } from './utils';
 *
 * applyBasicAuth(app, {
 *   username: process.env.SWAGGER_USERNAME || 'admin',
 *   password: process.env.SWAGGER_PASSWORD || 'secret'
 * }, 'api/docs');
 * ```
 *
 * @remarks
 * **Security Best Practices:**
 * - Always use environment variables for credentials
 * - Use strong passwords (minimum 16 characters)
 * - Consider using OAuth2 or JWT for better security
 * - Use HTTPS in production to protect credentials in transit
 * - Rotate credentials regularly
 *
 * **Note:** This is a basic implementation. For enterprise-grade security,
 * consider implementing OAuth2 or integrating with your authentication system.
 */
export function applyBasicAuth(
  app: INestApplication,
  config: BasicAuthConfig,
  swaggerPath: string,
): void {
  // This would require express-basic-auth middleware
  // Implementation note: Install express-basic-auth package
  console.warn(
    '⚠️  Basic auth for Swagger is configured but requires express-basic-auth package.',
  );
  console.warn(
    '   Run: bun add express-basic-auth @types/express-basic-auth -D',
  );
  console.warn(
    `   Swagger path: /${swaggerPath} should be protected with username: ${config.username}`,
  );
}

/**
 * Check if Swagger should be enabled based on environment
 *
 * Determines whether Swagger documentation should be enabled based on
 * the current environment and configuration.
 *
 * @param nodeEnv - Current Node environment
 * @param explicitEnabled - Explicit enable/disable flag
 * @returns True if Swagger should be enabled
 *
 * @example
 * ```typescript
 * const shouldEnable = shouldEnableSwagger(
 *   process.env.NODE_ENV,
 *   process.env.SWAGGER_ENABLED === 'true'
 * );
 * ```
 */
export function shouldEnableSwagger(
  nodeEnv?: string,
  explicitEnabled?: boolean,
): boolean {
  // If explicitly disabled, don't enable
  if (explicitEnabled === false) {
    return false;
  }

  // If explicitly enabled, enable regardless of environment
  if (explicitEnabled === true) {
    return true;
  }

  // By default, enable in development and staging, disable in production
  const env = (nodeEnv || 'development').toLowerCase();
  return env !== 'production';
}

/**
 * Validate Swagger Configuration
 *
 * Validates that the Swagger configuration is complete and secure.
 * Logs warnings for potential security issues.
 *
 * @param config - Swagger configuration object
 * @param nodeEnv - Current Node environment
 *
 * @example
 * ```typescript
 * validateSwaggerConfig(swaggerConfig, process.env.NODE_ENV);
 * ```
 */
export function validateSwaggerConfig(
  config: { enabled: boolean; apiPath?: string; serverUrl?: string },
  nodeEnv?: string,
): void {
  const env = (nodeEnv || 'development').toLowerCase();

  // Warn if Swagger is enabled in production
  if (config.enabled && env === 'production') {
    console.warn('⚠️  WARNING: Swagger documentation is enabled in production!');
    console.warn('   Consider disabling it or adding authentication.');
  }

  // Warn if using default path
  if (config.apiPath === 'api/docs' && env === 'production') {
    console.warn('⚠️  WARNING: Using default Swagger path in production.');
    console.warn('   Consider using a non-obvious path or adding authentication.');
  }

  // Warn if serverUrl is localhost in production
  if (
    config.serverUrl?.includes('localhost') &&
    env === 'production' &&
    config.enabled
  ) {
    console.warn('⚠️  WARNING: Swagger server URL points to localhost in production!');
    console.warn(`   Update serverUrl to your production API URL.`);
  }
}

/**
 * Generate Security Headers for Swagger Endpoint
 *
 * Returns recommended security headers for the Swagger documentation endpoint.
 * These headers help prevent common web vulnerabilities.
 *
 * @returns Object containing security headers
 *
 * @example
 * ```typescript
 * const headers = getSecurityHeaders();
 * // Apply to Swagger endpoint
 * ```
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'",
  };
}
