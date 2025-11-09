/**
 * Trust Hosts Configuration Options
 *
 * Validates the Host header to prevent Host Header Injection attacks.
 * Important security middleware for production applications.
 */
export interface TrustHostsOptions {
  /**
   * Array of trusted host patterns (regex strings) or function returning patterns.
   * If not provided, all subdomains of the app URL are trusted.
   *
   * @default undefined (trusts all subdomains of app URL)
   * @example ['example\\.com', '^(.+\\.)?example\\.com$']
   * @example () => ['api\\.example\\.com', 'app\\.example\\.com']
   */
  hosts?: string[] | (() => string[]);

  /**
   * Whether to trust subdomains of the application URL.
   * Only applies when hosts is explicitly provided.
   *
   * @default true
   */
  trustSubdomains?: boolean;

  /**
   * Application URL to derive trusted hosts from.
   * If not provided, uses environment variable or config.
   *
   * @default process.env.APP_URL
   */
  appUrl?: string;

  /**
   * Environment check - don't validate in these environments.
   *
   * @default ['local', 'test', 'testing']
   */
  skipEnvironments?: string[];

  /**
   * Current environment name.
   *
   * @default process.env.NODE_ENV
   */
  environment?: string;
}
