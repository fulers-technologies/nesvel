import { Collection } from '@nesvel/collections';
import { Injectable, Scope } from '@nestjs/common';

/**
 * Logger context service for managing contextual logging data.
 *
 * This service extends Collection to provide a fluent, Laravel-style API for managing
 * contextual information attached to log messages. Context is useful for adding common
 * data like request IDs, user IDs, or session information without passing it to every log call.
 *
 * By extending Collection, this service inherits 100+ methods for data manipulation,
 * filtering, transformation, and querying with full TypeScript type safety.
 *
 * The service uses request scope to ensure context isolation between requests
 * in web applications, preventing context leakage between concurrent requests.
 *
 * @class LoggerContextService
 * @extends {Collection<any>}
 * @injectable
 * @scope REQUEST
 *
 * @example Basic usage
 * ```typescript
 * @Injectable()
 * class AuthService {
 *   constructor(
 *     private readonly logger: LoggerService,
 *     private readonly context: LoggerContextService
 *   ) {}
 *
 *   async login(userId: string) {
 *     this.context.put('userId', userId);
 *     this.context.put('requestId', ulid());
 *
 *     this.logger.info('User logging in');
 *     // Log will automatically include userId and requestId
 *   }
 * }
 * ```
 *
 * @example Using Collection methods
 * ```typescript
 * // Filter context data
 * const sensitiveKeys = context.filter((value, key) =>
 *   key.includes('token') || key.includes('secret')
 * );
 *
 * // Transform context values
 * const masked = context.map((value, key) =>
 *   key.includes('password') ? '***' : value
 * );
 *
 * // Check if context contains specific data
 * if (context.has('userId') && context.has('sessionId')) {
 *   // Both user and session context available
 * }
 * ```
 */
@Injectable({ scope: Scope.REQUEST })
export class LoggerContextService extends Collection<any> {
  /**
   * Creates a new logger context service instance.
   *
   * Initializes the service with an empty collection.
   */
  constructor() {
    super({});
  }

  /**
   * Static factory method to create a new logger context service instance.
   *
   * This method provides a fluent interface for creating service instances
   * following the static factory pattern commonly used in Laravel and similar frameworks.
   *
   * @returns A new LoggerContextService instance
   *
   * @example
   * ```typescript
   * const contextService = LoggerContextService.make();
   * ```
   */
  static override make(): LoggerContextService {
    return new LoggerContextService();
  }
}
