/**
 * Express Request interface extensions
 *
 * Extends Express Request type with custom properties used throughout
 * the application for context management, authentication, and multi-tenancy.
 */

declare namespace Express {
  /**
   * Extended Express Request interface
   *
   * Adds custom properties for:
   * - User authentication context
   * - Multi-tenancy support
   * - Error tracking context
   */
  export interface Request {
    /**
     * Authenticated user object
     * Set by AuthContextMiddleware
     */
    user?: {
      id?: string;
      sub?: string;
      email?: string;
      roles?: string[];
      tenantId?: string;
      [key: string]: any;
    };

    /**
     * Current tenant ID
     * Set by TenantContextMiddleware
     */
    tenantId?: string;

    /**
     * Error context for logging and debugging
     * Set by ErrorContextMiddleware
     */
    errorContext?: {
      requestId?: string | string[];
      correlationId?: string | string[];
      method?: string;
      url?: string;
      ip?: string;
      userAgent?: string | string[];
      timestamp?: string;
      [key: string]: any;
    };
  }
}
