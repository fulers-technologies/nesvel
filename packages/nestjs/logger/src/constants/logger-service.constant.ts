/**
 * Injection token for the Logger service.
 *
 * Use this token to inject the LoggerService instance into your classes.
 *
 * @constant
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject(LOGGER_SERVICE) private readonly logger: LoggerService) {}
 *
 *   doSomething() {
 *     this.logger.info('Doing something...');
 *   }
 * }
 * ```
 */
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');
