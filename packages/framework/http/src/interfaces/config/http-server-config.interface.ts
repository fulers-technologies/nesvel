import type { HttpCorsConfig } from './http-cors-config.interface';
import type { HttpBodyParserConfig } from './http-body-parser-config.interface';
import type { HttpCookieParserConfig } from './http-cookie-parser-config.interface';
import type { HttpCompressionConfig } from './http-compression-config.interface';
import type { HttpHelmetConfig } from './http-helmet-config.interface';
import type { HttpRateLimitConfig } from './http-rate-limit-config.interface';

/**
 * HTTP Server Configuration
 *
 * Configuration options for Express-based server middleware.
 * Controls CORS, body parsing, cookies, compression, and security.
 */
export interface HttpServerConfig {
  /**
   * CORS configuration
   *
   * Cross-Origin Resource Sharing settings.
   */
  cors?: HttpCorsConfig;

  /**
   * Body parser configuration
   *
   * Settings for parsing request bodies.
   */
  bodyParser?: HttpBodyParserConfig;

  /**
   * Cookie parser configuration
   *
   * Settings for parsing and signing cookies.
   */
  cookieParser?: HttpCookieParserConfig;

  /**
   * Compression middleware configuration
   *
   * Settings for response compression.
   */
  compression?: HttpCompressionConfig;

  /**
   * Helmet security middleware configuration
   *
   * Security headers and protection settings.
   */
  helmet?: HttpHelmetConfig;

  /**
   * Rate limiting configuration
   *
   * Settings for request rate limiting.
   */
  rateLimit?: HttpRateLimitConfig;

  /**
   * Trust proxy configuration
   *
   * Whether to trust proxy headers (X-Forwarded-*).
   *
   * @env HTTP_SERVER_TRUST_PROXY
   * @default false
   */
  trustProxy?: boolean | number | string;
}
