import { Injectable, Scope } from '@nestjs/common';

/**
 * Logger context service for managing contextual logging data.
 *
 * This service provides a mechanism to attach persistent contextual information
 * to log messages. Context is useful for adding common data like request IDs,
 * user IDs, or session information without passing it to every log call.
 *
 * The service uses request scope to ensure context isolation between requests
 * in web applications, preventing context leakage between concurrent requests.
 *
 * @class LoggerContextService
 * @injectable
 * @scope REQUEST
 *
 * @example
 * ```typescript
 * @Injectable()
 * class AuthService {
 *   constructor(
 *     private readonly logger: LoggerService,
 *     private readonly context: LoggerContextService
 *   ) {}
 *
 *   async login(userId: string) {
 *     this.context.set('userId', userId);
 *     this.context.set('requestId', ulid());
 *
 *     this.logger.info('User logging in');
 *     // Log will automatically include userId and requestId
 *   }
 * }
 * ```
 */
@Injectable({ scope: Scope.REQUEST })
export class LoggerContextService {
  /**
   * Internal storage for context data.
   * Uses a Map for efficient key-value lookups.
   */
  private readonly contextData: Map<string, any> = new Map();

  /**
   * Sets a context value.
   *
   * This method stores a key-value pair that will be included with all
   * subsequent log messages until cleared or the request ends (in REQUEST scope).
   *
   * @param key - The context key/identifier
   * @param value - The context value to store
   *
   * @returns The service instance for method chaining
   *
   * @example
   * ```typescript
   * context
   *   .set('userId', '123')
   *   .set('requestId', 'req_abc')
   *   .set('tenant', 'acme-corp');
   * ```
   */
  set(key: string, value: any): this {
    this.contextData.set(key, value);
    return this;
  }

  /**
   * Gets a context value by key.
   *
   * This method retrieves a previously stored context value.
   * Returns undefined if the key doesn't exist.
   *
   * @param key - The context key to retrieve
   *
   * @returns The stored value or undefined
   *
   * @example
   * ```typescript
   * const userId = context.get('userId');
   * if (userId) {
   *   // Use the userId
   * }
   * ```
   */
  get(key: string): any {
    return this.contextData.get(key);
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
   * if (context.has('userId')) {
   *   // User context is available
   * }
   * ```
   */
  has(key: string): boolean {
    return this.contextData.has(key);
  }

  /**
   * Removes a context value by key.
   *
   * This method deletes a specific key from the context.
   * Useful for clearing sensitive data or temporary context values.
   *
   * @param key - The context key to remove
   *
   * @returns The service instance for method chaining
   *
   * @example
   * ```typescript
   * context.delete('temporaryToken');
   * ```
   */
  delete(key: string): this {
    this.contextData.delete(key);
    return this;
  }

  /**
   * Clears all context data.
   *
   * This method removes all stored context values, resetting the
   * context to an empty state. Useful for cleanup or resetting
   * context between operations.
   *
   * @returns The service instance for method chaining
   *
   * @example
   * ```typescript
   * context.clear();
   * ```
   */
  clear(): this {
    this.contextData.clear();
    return this;
  }

  /**
   * Gets all context data as a plain object.
   *
   * This method returns a snapshot of all context data as a plain
   * JavaScript object. This is useful for including context in log
   * messages or for debugging purposes.
   *
   * @returns Plain object containing all context data
   *
   * @example
   * ```typescript
   * const context = contextService.getAll();
   * logger.info('Operation completed', context);
   * // Logs: { userId: '123', requestId: 'req_abc', ... }
   * ```
   */
  getAll(): Record<string, any> {
    return Object.fromEntries(this.contextData);
  }

  /**
   * Merges additional context data.
   *
   * This method adds multiple key-value pairs to the context at once.
   * Existing keys will be overwritten with new values.
   *
   * @param data - Object containing key-value pairs to merge
   *
   * @returns The service instance for method chaining
   *
   * @example
   * ```typescript
   * context.merge({
   *   userId: '123',
   *   requestId: 'req_abc',
   *   ipAddress: '192.168.1.1'
   * });
   * ```
   */
  merge(data: Record<string, any>): this {
    Object.entries(data).forEach(([key, value]) => {
      this.contextData.set(key, value);
    });
    return this;
  }

  /**
   * Gets the number of context entries.
   *
   * @returns The number of key-value pairs in the context
   *
   * @example
   * ```typescript
   * const count = context.size();
   * console.log(`Context has ${count} entries`);
   * ```
   */
  size(): number {
    return this.contextData.size;
  }
}
