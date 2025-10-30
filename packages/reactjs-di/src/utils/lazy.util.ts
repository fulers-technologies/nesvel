import { getService } from './container.util';
import type { ServiceIdentifier, LazyServiceGetter } from '../types';

/**
 * Create a lazy service getter
 *
 * @template T - The service type
 * @param token - The service identifier symbol
 * @returns A function that returns the service instance (lazy-loaded)
 *
 * @description
 * Creates a function that lazily resolves a service from the container.
 * The service is only resolved when the returned function is first called.
 * Subsequent calls return the cached instance.
 *
 * This is useful for:
 * - Performance optimization (defer expensive instantiation)
 * - Breaking circular dependencies
 * - Conditional service usage
 *
 * @example Basic usage
 * ```ts
 * import { createLazyService } from '~/di/utils/lazy.util';
 * import { ANALYTICS_SERVICE, type IAnalyticsService } from '~/modules/analytics';
 *
 * // Create lazy getter
 * const getAnalytics = createLazyService<IAnalyticsService>(ANALYTICS_SERVICE);
 *
 * // Use conditionally
 * function trackEvent(name: string) {
 *   if (shouldTrack()) {
 *     const analytics = getAnalytics(); // Only loaded when needed
 *     analytics.trackEvent(name);
 *   }
 * }
 * ```
 *
 * @example In a service
 * ```ts
 * @injectable()
 * class MyService {
 *   private getAnalytics = createLazyService<IAnalyticsService>(ANALYTICS_SERVICE);
 *
 *   doSomething() {
 *     // Analytics only loaded if this method is called
 *     this.getAnalytics().trackEvent('something');
 *   }
 * }
 * ```
 */
export function createLazyService<T>(token: ServiceIdentifier<T>): LazyServiceGetter<T> {
  let instance: T | null = null;
  let resolved = false;

  return (): T => {
    if (!resolved) {
      instance = getService<T>(token);
      resolved = true;
    }
    return instance!;
  };
}

/**
 * Create multiple lazy service getters
 *
 * @template T - Tuple of service types
 * @param tokens - Array of service identifier symbols
 * @returns Object with lazy getter functions for each service
 *
 * @description
 * Creates lazy getters for multiple services at once.
 * Returns an object with getter functions keyed by token description.
 *
 * @example
 * ```ts
 * import { createLazyServices } from '~/di/utils/lazy.util';
 * import { LOGGER_SERVICE, CONFIG_SERVICE } from '~/modules';
 *
 * const services = createLazyServices([
 *   LOGGER_SERVICE,
 *   CONFIG_SERVICE
 * ]);
 *
 * // Access when needed
 * services[0]().info('Hello'); // Logger
 * services[1]().get('API_KEY'); // Config
 * ```
 */
export function createLazyServices<T extends readonly symbol[]>(
  tokens: T,
): { [K in keyof T]: LazyServiceGetter<unknown> } {
  return tokens.map((token) => createLazyService(token)) as {
    [K in keyof T]: LazyServiceGetter<unknown>;
  };
}

/**
 * Lazy initialization decorator
 *
 * @description
 * Method decorator that lazily initializes a service on first access.
 * The service is resolved from the container when the method is first called.
 *
 * @example
 * ```ts
 * class MyComponent {
 *   @lazyInject(LOGGER_SERVICE)
 *   private logger!: ILogger;
 *
 *   handleClick() {
 *     // Logger resolved on first access
 *     this.logger.info('Clicked');
 *   }
 * }
 * ```
 */
export function lazyInject<T>(token: ServiceIdentifier<T>) {
  return function (target: any, propertyKey: string) {
    let instance: any = null;
    let resolved = false;

    Object.defineProperty(target, propertyKey, {
      get() {
        if (!resolved) {
          instance = getService(token);
          resolved = true;
        }
        return instance;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Check if a service can be lazily loaded
 *
 * @param token - The service identifier symbol
 * @returns True if service exists and can be loaded
 *
 * @description
 * Checks if a service is available without actually loading it.
 * Useful for conditional logic based on service availability.
 *
 * @example
 * ```ts
 * import { canLoadService } from '~/di/utils/lazy.util';
 * import { ANALYTICS_SERVICE } from '~/modules/analytics';
 *
 * if (canLoadService(ANALYTICS_SERVICE)) {
 *   const getAnalytics = createLazyService(ANALYTICS_SERVICE);
 *   // Use analytics...
 * }
 * ```
 */
export function canLoadService<T>(token: ServiceIdentifier<T>): boolean {
  try {
    getService(token);
    return true;
  } catch {
    return false;
  }
}
