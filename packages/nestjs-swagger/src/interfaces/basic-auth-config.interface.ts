/**
 * Basic Authentication Configuration Interface
 *
 * Configuration for basic authentication on Swagger endpoint.
 *
 * @interface BasicAuthConfig
 *
 * @example
 * ```typescript
 * import type { BasicAuthConfig } from './basic-auth-config.interface';
 *
 * const authConfig: BasicAuthConfig = {
 *   username: process.env.SWAGGER_USERNAME || 'admin',
 *   password: process.env.SWAGGER_PASSWORD || 'secret',
 *   realm: 'API Documentation'
 * };
 * ```
 */
export interface BasicAuthConfig {
  /**
   * Username for basic authentication
   *
   * **Security**: Should be stored in environment variables, not hardcoded.
   *
   * @example 'admin'
   */
  username: string;

  /**
   * Password for basic authentication
   *
   * **Security**:
   * - Must be stored in environment variables
   * - Use strong passwords (minimum 16 characters)
   * - Rotate credentials regularly
   *
   * @example process.env.SWAGGER_PASSWORD
   */
  password: string;

  /**
   * Realm name for basic authentication
   *
   * The realm is displayed in the browser's authentication dialog.
   *
   * @optional
   * @default 'Swagger Documentation'
   * @example 'API Documentation'
   */
  realm?: string;
}
