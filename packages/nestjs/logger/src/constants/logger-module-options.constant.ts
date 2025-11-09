/**
 * Dependency injection token for logger module options.
 *
 * This constant is used as a unique identifier for injecting logger
 * configuration options throughout the application.
 *
 * @constant
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class SomeService {
 *   constructor(
 *     @Inject(LOGGER_MODULE_OPTIONS)
 *     private readonly options: ILoggerOptions
 *   ) {}
 * }
 * ```
 */
export const LOGGER_MODULE_OPTIONS = 'LOGGER_MODULE_OPTIONS';
