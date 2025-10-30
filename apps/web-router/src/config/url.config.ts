/**
 * URL Configuration
 *
 * All URL-related settings including base URLs, API endpoints,
 * and external service URLs.
 */
export const urlConfig = {
  /**
   * Base application URL
   * Should be the production URL without trailing slash
   * @example 'https://nesvel.com'
   */
  base: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * API base URL
   * Can be same as base URL or separate API domain
   */
  api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  /**
   * CDN URL for static assets
   * Leave empty if not using a CDN
   */
  cdn: process.env.NEXT_PUBLIC_CDN_URL || '',

  /**
   * Assets base path
   * Useful for serving assets from a subdirectory or CDN
   */
  assets: process.env.NEXT_PUBLIC_ASSETS_PATH || '',
} as const;

/**
 * Type export for TypeScript consumers
 */
export type UrlConfig = typeof urlConfig;
