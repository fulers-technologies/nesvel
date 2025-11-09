/**
 * CORS Configuration Options
 *
 * Defines allowed origins, methods, headers, credentials, and caching options
 * for Cross-Origin Resource Sharing (CORS).
 */
export interface HandleCorsOptions {
  /**
   * Origins allowed to access the resource.
   * Can be string, array of strings, or function.
   *
   * @default '*'
   * @example 'https://example.com'
   * @example ['https://example.com', 'https://app.example.com']
   * @example (origin) => origin.endsWith('.example.com')
   */
  origin?: string | string[] | ((origin: string) => boolean);

  /**
   * HTTP methods allowed for CORS requests.
   *
   * @default ['GET', 'PUT', 'HEAD', 'POST', 'PATCH', 'DELETE']
   */
  methods?: string | string[];

  /**
   * Headers allowed in CORS requests.
   *
   * @default ['*']
   */
  allowedHeaders?: string | string[];

  /**
   * Headers exposed to the client.
   *
   * @default []
   */
  exposedHeaders?: string | string[];

  /**
   * Whether to allow credentials (cookies, authorization headers).
   *
   * @default false
   */
  credentials?: boolean;

  /**
   * Max age for preflight cache in seconds.
   *
   * @default 86400 (24 hours)
   */
  maxAge?: number;

  /**
   * Whether to pass preflight requests to the next handler.
   *
   * @default false
   */
  preflightContinue?: boolean;

  /**
   * Status code for successful OPTIONS requests.
   *
   * @default 204
   */
  optionsSuccessStatus?: number;
}
