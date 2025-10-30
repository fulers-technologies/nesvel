import { getContainer } from './container.util';
import type { ServiceIdentifier, ServiceFactory } from '../types';
import type { FactoryOptions } from '../interfaces';

/**
 * Create a service factory
 *
 * @template T - The service type
 * @template Args - Factory function arguments
 * @param factory - Factory function that creates service instances
 * @param options - Factory options
 * @returns A factory function
 *
 * @description
 * Creates a factory function for dynamic service instantiation.
 * The factory can create multiple instances with different configurations.
 *
 * Supports:
 * - Runtime configuration
 * - Instance caching
 * - Custom cache keys
 *
 * @example Basic factory
 * ```ts
 * import { createServiceFactory } from '~/di/utils/factory.util';
 *
 * interface ILogger {
 *   log(msg: string): void;
 * }
 *
 * const createLogger = createServiceFactory<ILogger, [string]>((name) => ({
 *   log: (msg) => console.log(`[${name}] ${msg}`)
 * }));
 *
 * const userLogger = createLogger('User');
 * const authLogger = createLogger('Auth');
 *
 * userLogger.log('User created');
 * authLogger.log('User logged in');
 * ```
 *
 * @example With caching
 * ```ts
 * const createLogger = createServiceFactory<ILogger, [string]>(
 *   (name) => new LoggerService(name),
 *   { cache: true }
 * );
 *
 * const logger1 = createLogger('App');
 * const logger2 = createLogger('App'); // Same instance
 * console.log(logger1 === logger2); // true
 * ```
 *
 * @example With dependencies
 * ```ts
 * const createAnalytics = createServiceFactory<IAnalytics, [string]>((userId) => {
 *   const logger = getService<ILogger>(LOGGER_SERVICE);
 *   const config = getService<IConfigService>(CONFIG_SERVICE);
 *   return new AnalyticsService(userId, logger, config);
 * });
 *
 * const userAnalytics = createAnalytics('user-123');
 * ```
 */
export function createServiceFactory<T, Args extends any[] = []>(
  factory: (...args: Args) => T,
  options: FactoryOptions = {},
): ServiceFactory<T, Args> {
  const { cache = false, cacheKey } = options;
  const instances = new Map<string, T>();

  return (...args: Args): T => {
    if (cache) {
      const key = cacheKey ? cacheKey(...args) : JSON.stringify(args);

      if (instances.has(key)) {
        return instances.get(key)!;
      }

      const instance = factory(...args);
      instances.set(key, instance);
      return instance;
    }

    return factory(...args);
  };
}

/**
 * Create a service factory with DI
 *
 * @template T - The service type
 * @template Args - Factory function arguments
 * @param token - Base service token
 * @param configFactory - Function that creates configuration from args
 * @returns A factory function
 *
 * @description
 * Creates a factory that resolves a base service from DI and applies
 * runtime configuration. Useful for services that need both DI and runtime config.
 *
 * @example
 * ```ts
 * import { createServiceFactoryWithDI } from '~/di/utils/factory.util';
 *
 * const createConfiguredLogger = createServiceFactoryWithDI<ILogger, [string]>(
 *   LOGGER_SERVICE,
 *   (logger, name) => {
 *     logger.setPrefix(name);
 *     return logger;
 *   }
 * );
 *
 * const userLogger = createConfiguredLogger('UserService');
 * ```
 */
export function createServiceFactoryWithDI<T, Args extends any[] = []>(
  token: ServiceIdentifier<T>,
  configFactory: (service: T, ...args: Args) => T,
): ServiceFactory<T, Args> {
  return (...args: Args): T => {
    const container = getContainer();
    const service = container.get(token) as T;
    return configFactory(service, ...args);
  };
}

/**
 * Create a pooled service factory
 *
 * @template T - The service type
 * @param factory - Factory function that creates service instances
 * @param poolSize - Maximum pool size
 * @returns A factory function that returns services from the pool
 *
 * @description
 * Creates a factory with a service pool for resource-intensive services.
 * Services are reused from the pool instead of creating new instances.
 *
 * @example
 * ```ts
 * import { createPooledFactory } from '~/di/utils/factory.util';
 *
 * const createConnection = createPooledFactory(
 *   () => new DatabaseConnection(),
 *   5 // Pool size
 * );
 *
 * const conn1 = createConnection(); // New instance
 * const conn2 = createConnection(); // New instance
 * // ... up to 5 instances, then reuses from pool
 * ```
 */
export function createPooledFactory<T>(factory: () => T, poolSize: number): ServiceFactory<T, []> {
  const pool: T[] = [];
  let currentIndex = 0;

  return (): T => {
    if (pool.length < poolSize) {
      const instance = factory();
      pool.push(instance);
      return instance;
    }

    // Non-null assertion since we know pool is not empty
    const instance = pool[currentIndex]!;

    currentIndex = (currentIndex + 1) % poolSize;
    return instance;
  };
}

/**
 * Create a disposable service factory
 *
 * @template T - The service type
 * @param factory - Factory function that creates service instances
 * @returns Tuple of [factory function, dispose function]
 *
 * @description
 * Creates a factory that tracks created instances and provides
 * a dispose function to clean them up.
 *
 * @example
 * ```ts
 * import { createDisposableFactory } from '~/di/utils/factory.util';
 *
 * const [createService, disposeAll] = createDisposableFactory(
 *   () => new DisposableService()
 * );
 *
 * const service1 = createService();
 * const service2 = createService();
 *
 * // Clean up all instances
 * disposeAll((service) => service.dispose());
 * ```
 */
export function createDisposableFactory<T>(
  factory: () => T,
): [ServiceFactory<T, []>, (disposer: (instance: T) => void) => void] {
  const instances: T[] = [];

  const create = (): T => {
    const instance = factory();
    instances.push(instance);
    return instance;
  };

  const disposeAll = (disposer: (instance: T) => void): void => {
    instances.forEach(disposer);
    instances.length = 0; // Clear array
  };

  return [create, disposeAll];
}
