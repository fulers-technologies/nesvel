/**
 * Default configuration values for the PubSub module.
 *
 * This object defines the default values that are used when specific
 * configuration options are not provided during module registration.
 * These defaults ensure sensible behavior out of the box while allowing
 * customization when needed.
 *
 * The defaults are merged with user-provided configuration using object
 * spreading, so any values explicitly set by the user will override these
 * defaults.
 *
 * Configuration Properties:
 * - isGlobal: Whether to register the module globally (default: false)
 * - autoConnect: Whether to auto-connect on initialization (default: true)
 * - maxRetries: Maximum retry attempts for failed operations (default: 3)
 * - retryDelay: Delay between retries in milliseconds (default: 1000)
 *
 * @example
 * Internal usage in module configuration:
 * ```typescript
 * const mergedOptions = {
 *   ...DEFAULT_PUBSUB_CONFIG,
 *   ...userOptions,
 * };
 * ```
 *
 * @example
 * Accessing defaults in application code:
 * ```typescript
 * import { DEFAULT_PUBSUB_CONFIG } from '@nestjs-pubsub/core';
 *
 * console.log('Default max retries:', DEFAULT_PUBSUB_CONFIG.maxRetries);
 * console.log('Default retry delay:', DEFAULT_PUBSUB_CONFIG.retryDelay);
 * ```
 */
export const DEFAULT_PUBSUB_CONFIG = {
  /**
   * Whether to register the module globally.
   *
   * When true, the module is available throughout the application without
   * needing to import it in every module. This is convenient for modules
   * that are used widely across the application.
   *
   * @default false
   */
  isGlobal: false,

  /**
   * Whether to automatically connect to the driver on module initialization.
   *
   * When true, the driver will automatically call connect() during the
   * module's onModuleInit lifecycle hook. When false, you must manually
   * call connect() on the PubSubService before using pub/sub operations.
   *
   * @default true
   */
  autoConnect: true,

  /**
   * Maximum number of retry attempts for failed operations.
   *
   * When publish or subscribe operations fail, the driver will automatically
   * retry up to this number of times before throwing an error. This helps
   * handle transient network issues or temporary backend unavailability.
   *
   * @default 3
   */
  maxRetries: 3,

  /**
   * Retry delay in milliseconds between failed operation attempts.
   *
   * When an operation fails and is retried, this delay is applied between
   * attempts. This prevents overwhelming the backend with rapid retry attempts
   * and allows time for transient issues to resolve.
   *
   * @default 1000
   */
  retryDelay: 1000,
} as const;
