/**
 * Container initialization options
 */
export interface ContainerOptions {
  /**
   * Log level for Inversiland (default: 'info' in production, 'debug' in development)
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /**
   * Default scope for services (default: 'Singleton')
   */
  defaultScope?: 'Singleton' | 'Transient' | 'Request';

  /**
   * Whether to skip initialization if already initialized (default: true)
   */
  skipIfInitialized?: boolean;
}
