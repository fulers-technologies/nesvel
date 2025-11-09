import type { LoggerContextService } from '@services/logger-context.service';

/**
 * ManagesContext concern mixin.
 *
 * This concern provides methods for managing contextual data that should be
 * included with log messages. Context allows you to attach persistent
 * information (like request IDs, user IDs, or session data) without passing
 * it to every log call.
 *
 * The concern delegates to a LoggerContextService instance, providing a
 * convenient API for context management.
 *
 * @class ManagesContextConcern
 *
 * @example
 * ```typescript
 * class LoggerService extends Mixin(ManagesContextConcern, OtherConcern) {
 *   // Logger service with context management
 * }
 *
 * logger.setContext('requestId', 'req_123');
 * logger.setContext('userId', 'user_456');
 * logger.info('Processing request'); // Automatically includes requestId and userId
 * ```
 */
export class ManagesContextConcern {
  /**
   * Shared context data that will be included in all logs.
   */
  protected sharedContextData: Record<string, any> = {};

  /**
   * Temporary context for withContext/withoutContext operations.
   */
  protected temporaryContext: Record<string, any> = {};

  /**
   * Logger context service instance.
   * Must be provided by the implementing class.
   */
  protected contextService?: LoggerContextService;

  /**
   * Sets a context value.
   *
   * This method stores a key-value pair that will be included with all
   * subsequent log messages. Context values persist until explicitly cleared
   * or the request ends (in REQUEST-scoped services).
   *
   * @param key - The context key/identifier
   * @param value - The context value to store
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger
   *   .setContext('requestId', 'req_123')
   *   .setContext('userId', 'user_456')
   *   .info('Request received');
   * ```
   */
  setContext(key: string, value: any): this {
    this.contextService?.set(key, value);
    return this;
  }

  /**
   * Gets a context value by key.
   *
   * This method retrieves a previously stored context value.
   * Returns undefined if the key doesn't exist or context service is not available.
   *
   * @param key - The context key to retrieve
   *
   * @returns The stored value or undefined
   *
   * @example
   * ```typescript
   * const userId = logger.getContext('userId');
   * if (userId) {
   *   logger.info('User context available', { userId });
   * }
   * ```
   */
  getContext(key: string): any {
    return this.contextService?.get(key);
  }

  /**
   * Checks if a context key exists.
   *
   * @param key - The context key to check
   *
   * @returns True if the key exists in the context
   *
   * @example
   * ```typescript
   * if (logger.hasContext('userId')) {
   *   logger.info('User is authenticated');
   * }
   * ```
   */
  hasContext(key: string): boolean {
    return this.contextService?.has(key) ?? false;
  }

  /**
   * Removes a context value by key.
   *
   * This method deletes a specific key from the context. Useful for
   * clearing sensitive data or temporary context values.
   *
   * @param key - The context key to remove
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.deleteContext('temporaryToken');
   * ```
   */
  deleteContext(key: string): this {
    this.contextService?.delete(key);
    return this;
  }

  /**
   * Clears all context data.
   *
   * This method removes all stored context values, resetting the
   * context to an empty state. Useful for cleanup between operations.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.clearContext();
   * logger.info('Context cleared'); // No contextual data included
   * ```
   */
  clearContext(): this {
    this.contextService?.clear();
    return this;
  }

  /**
   * Gets all context data as a plain object.
   *
   * This method returns a snapshot of all context data. Useful for
   * debugging or inspecting the current context state.
   *
   * @returns Plain object containing all context data
   *
   * @example
   * ```typescript
   * const context = logger.getAllContext();
   * console.log('Current context:', context);
   * // Output: { requestId: 'req_123', userId: 'user_456' }
   * ```
   */
  getAllContext(): Record<string, any> {
    return this.contextService?.getAll() ?? {};
  }

  /**
   * Merges additional context data.
   *
   * This method adds multiple key-value pairs to the context at once.
   * Existing keys will be overwritten with new values.
   *
   * @param data - Object containing key-value pairs to merge
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.mergeContext({
   *   requestId: 'req_123',
   *   userId: 'user_456',
   *   ipAddress: '192.168.1.1',
   *   userAgent: 'Mozilla/5.0...'
   * });
   * ```
   */
  mergeContext(data: Record<string, any>): this {
    this.contextService?.merge(data);
    return this;
  }

  /**
   * Gets the number of context entries.
   *
   * @returns The number of key-value pairs in the context
   *
   * @example
   * ```typescript
   * const count = logger.contextSize();
   * logger.debug(`Context has ${count} entries`);
   * ```
   */
  contextSize(): number {
    return this.contextService?.size() ?? 0;
  }

  /**
   * Creates a new logger instance with additional context.
   *
   * This method returns a new logger with the provided context merged
   * with any existing context. The original logger remains unchanged.
   *
   * @param context - Additional context data to include
   *
   * @returns New logger instance with merged context
   *
   * @example
   * ```typescript
   * const userLogger = logger.withContext({ userId: '123', tenant: 'acme' });
   * userLogger.info('User action'); // Includes userId and tenant
   * ```
   */
  withContext(context: any = []): this {
    const newLogger = Object.create(Object.getPrototypeOf(this));
    Object.assign(newLogger, this);
    newLogger.temporaryContext = { ...this.temporaryContext, ...context };
    return newLogger;
  }

  /**
   * Creates a new logger instance without specified context keys.
   *
   * This method returns a new logger with specified keys removed from
   * the context. If no keys are provided, all context is removed.
   *
   * @param keys - Optional array of keys to remove, or null to remove all
   *
   * @returns New logger instance without specified context
   *
   * @example
   * ```typescript
   * const sanitizedLogger = logger.withoutContext(['password', 'token']);
   * sanitizedLogger.info('Sanitized log'); // password and token removed
   *
   * const cleanLogger = logger.withoutContext();
   * cleanLogger.info('Clean log'); // All context removed
   * ```
   */
  withoutContext(keys: string[] | null = null): this {
    const newLogger = Object.create(Object.getPrototypeOf(this));
    Object.assign(newLogger, this);

    if (keys === null) {
      // Remove all context
      newLogger.temporaryContext = {};
    } else {
      // Remove specific keys
      const filtered = { ...this.temporaryContext };
      keys.forEach((key) => delete filtered[key]);
      newLogger.temporaryContext = filtered;
    }

    return newLogger;
  }

  /**
   * Shares context data across all logger instances.
   *
   * This method sets shared context that will be automatically included
   * in all log messages across all logger instances. Useful for setting
   * global context like application version, environment, etc.
   *
   * @param context - Context data to share
   *
   * @example
   * ```typescript
   * logger.shareContext({
   *   appVersion: '1.0.0',
   *   environment: 'production',
   *   region: 'us-east-1'
   * });
   * ```
   */
  shareContext(context: Record<string, any>): void {
    this.sharedContextData = { ...this.sharedContextData, ...context };
  }

  /**
   * Gets the current shared context.
   *
   * Returns all context data that is being shared across logger instances.
   *
   * @returns Shared context data
   *
   * @example
   * ```typescript
   * const shared = logger.sharedContext();
   * console.log('Shared context:', shared);
   * ```
   */
  sharedContext(): Record<string, any> {
    return { ...this.sharedContextData };
  }
}
