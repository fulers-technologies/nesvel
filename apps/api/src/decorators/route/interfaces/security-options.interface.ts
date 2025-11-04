/**
 * Security configuration options for API endpoints.
 *
 * Provides comprehensive security controls including Content Security Policy,
 * rate limiting, IP whitelisting, and HTTPS enforcement.
 */
export interface SecurityOptions {
  /**
   * Content Security Policy (CSP) directives.
   *
   * Defines allowed sources for various content types to prevent XSS attacks.
   * Each key is a CSP directive, and the value is an array of allowed sources.
   *
   * @example
   * ```typescript
   * csp: {
   *   'default-src': ["'self'"],
   *   'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
   *   'style-src': ["'self'", "'unsafe-inline'"],
   *   'img-src': ["'self'", 'data:', 'https:'],
   *   'connect-src': ["'self'", 'https://api.example.com']
   * }
   * ```
   *
   * @default undefined (no CSP headers)
   */
  csp?: Record<string, string[]>;

  /**
   * Rate limiting configuration.
   *
   * Controls the maximum number of requests allowed within a time window.
   * Helps prevent abuse, brute force attacks, and ensures fair resource usage.
   */
  rateLimit?: {
    /**
     * Maximum number of requests allowed within the TTL window.
     *
     * Requests exceeding this limit will receive a 429 Too Many Requests response.
     * Set based on expected legitimate usage patterns.
     *
     * @example 100 // 100 requests per window
     * @default 100
     */
    limit: number;

    /**
     * Time window in seconds for rate limiting.
     *
     * The period over which the request limit is enforced.
     * After this period, the counter resets.
     *
     * @example 60 // 60 seconds (1 minute)
     * @default 60
     */
    ttl: number;

    /**
     * Condition to skip rate limiting.
     *
     * Expression or key to determine when rate limiting should be bypassed.
     * Useful for whitelisting specific users or scenarios.
     *
     * @example 'admin' // Skip for admin users
     * @default undefined
     */
    skipIf?: string;
  };

  /**
   * IP address whitelist.
   *
   * Array of IP addresses or CIDR ranges allowed to access the endpoint.
   * Requests from non-whitelisted IPs will be rejected.
   * Use for administrative or internal-only endpoints.
   *
   * @example
   * ```typescript
   * ipWhitelist: [
   *   '192.168.1.100',      // Single IP
   *   '10.0.0.0/8',         // CIDR range
   *   '2001:db8::/32'       // IPv6 range
   * ]
   * ```
   *
   * @default undefined (all IPs allowed)
   */
  ipWhitelist?: string[];

  /**
   * Require HTTPS for this endpoint.
   *
   * When enabled, HTTP requests will be rejected or redirected to HTTPS.
   * Essential for endpoints handling sensitive data or authentication.
   *
   * @default false
   */
  requireHttps?: boolean;
}
