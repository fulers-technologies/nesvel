/**
 * Resolver Types Constants
 *
 * Defines constants for language resolver configuration.
 *
 * @module ResolverTypes
 */


/**
 * Default Query Parameter Name
 */
export const DEFAULT_QUERY_PARAM = 'lang';

/**
 * Default Cookie Name
 */
export const DEFAULT_COOKIE_NAME = 'lang';

/**
 * Cookie Options
 *
 * Default options for language cookie
 */
export const COOKIE_OPTIONS = {
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  httpOnly: false, // Allow JavaScript to read (for client-side language switching)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const,
  path: '/',
} as const;
