import { getContainer, isInitialized } from './container.util';
import type { ServiceIdentifier } from '../types';

/**
 * Check if a service is available in the container
 *
 * @param token - The service identifier symbol
 * @returns True if service is registered and can be resolved
 *
 * @description
 * Checks if a service exists in the DI container without throwing errors.
 * Useful for conditional logic and feature flags.
 *
 * @example
 * ```ts
 * import { isServiceAvailable } from '~/di/utils/guards.util';
 * import { ANALYTICS_SERVICE } from '~/modules/analytics';
 *
 * function trackEvent(name: string) {
 *   if (isServiceAvailable(ANALYTICS_SERVICE)) {
 *     const analytics = getService(ANALYTICS_SERVICE);
 *     analytics.trackEvent(name);
 *   }
 * }
 * ```
 */
export function isServiceAvailable<T>(token: ServiceIdentifier<T>): boolean {
  if (!isInitialized()) {
    return false;
  }

  try {
    const container = getContainer();
    return container.isBound(token);
  } catch {
    return false;
  }
}

/**
 * Validate that a service implements required methods
 *
 * @template T - The service interface type
 * @param service - The service instance to validate
 * @param methods - Array of method names that must exist
 * @returns True if service implements all methods
 *
 * @description
 * Runtime validation that a service implements expected methods.
 * Useful for ensuring service compatibility at runtime.
 *
 * @example
 * ```ts
 * import { validateService } from '~/di/utils/guards.util';
 *
 * const logger = getService(LOGGER_SERVICE);
 *
 * if (validateService(logger, ['info', 'error', 'warn'])) {
 *   logger.info('Valid logger service');
 * }
 * ```
 */
export function validateService<T>(service: T, methods: (keyof T)[]): service is T {
  if (!service || typeof service !== 'object') {
    return false;
  }

  return methods.every((method) => {
    return typeof (service as any)[method] === 'function';
  });
}

/**
 * Assert that a service is available
 *
 * @param token - The service identifier symbol
 * @param errorMessage - Optional custom error message
 * @throws {Error} If service is not available
 *
 * @description
 * Asserts that a service exists, throwing an error if not.
 * Useful for fail-fast validation in critical paths.
 *
 * @example
 * ```ts
 * import { assertServiceAvailable } from '~/di/utils/guards.util';
 * import { LOGGER_SERVICE } from '~/modules/logger';
 *
 * function criticalOperation() {
 *   assertServiceAvailable(LOGGER_SERVICE, 'Logger is required for audit trail');
 *   const logger = getService(LOGGER_SERVICE);
 *   logger.info('Critical operation started');
 * }
 * ```
 */
export function assertServiceAvailable<T>(
  token: ServiceIdentifier<T>,
  errorMessage?: string,
): asserts token is symbol {
  if (!isServiceAvailable(token)) {
    const tokenDesc =
      typeof token === 'symbol' ? token.description || token.toString() : String(token);
    throw new Error(errorMessage || `[DI Guards] Required service not available: ${tokenDesc}`);
  }
}

/**
 * Check if multiple services are available
 *
 * @param tokens - Array of service identifier symbols
 * @returns True if all services are available
 *
 * @description
 * Checks if all specified services exist in the container.
 *
 * @example
 * ```ts
 * import { areServicesAvailable } from '~/di/utils/guards.util';
 *
 * const tokens = [LOGGER_SERVICE, CONFIG_SERVICE, ANALYTICS_SERVICE];
 *
 * if (areServicesAvailable(tokens)) {
 *   // All services available, proceed
 * }
 * ```
 */
export function areServicesAvailable(tokens: symbol[]): boolean {
  return tokens.every(isServiceAvailable);
}

/**
 * Get available services from a list
 *
 * @param tokens - Array of service identifier symbols
 * @returns Array of tokens for services that are available
 *
 * @description
 * Filters a list of tokens to only those that are available.
 * Useful for optional feature composition.
 *
 * @example
 * ```ts
 * import { getAvailableServices } from '~/di/utils/guards.util';
 *
 * const optionalServices = [
 *   ANALYTICS_SERVICE,
 *   MONITORING_SERVICE,
 *   TELEMETRY_SERVICE
 * ];
 *
 * const available = getAvailableServices(optionalServices);
 * available.forEach(token => {
 *   const service = getService(token);
 *   // Use service...
 * });
 * ```
 */
export function getAvailableServices(tokens: symbol[]): symbol[] {
  return tokens.filter(isServiceAvailable);
}

/**
 * Type guard for checking if value is a valid service token
 *
 * @param value - Value to check
 * @returns True if value is a symbol
 *
 * @description
 * Type guard to check if a value is a valid service token (symbol).
 *
 * @example
 * ```ts
 * import { isServiceToken } from '~/di/utils/guards.util';
 *
 * function resolveService(token: unknown) {
 *   if (isServiceToken(token)) {
 *     return getService(token);
 *   }
 *   throw new Error('Invalid service token');
 * }
 * ```
 */
export function isServiceToken(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

/**
 * Validate service interface at runtime
 *
 * @template T - Expected service interface
 * @param service - Service instance to validate
 * @param schema - Object describing expected properties/methods
 * @returns Type guard indicating if service matches schema
 *
 * @description
 * Validates that a service matches an expected schema.
 * Useful for runtime type checking of dynamically loaded services.
 *
 * @example
 * ```ts
 * import { validateServiceInterface } from '~/di/utils/guards.util';
 *
 * const logger = getService(LOGGER_SERVICE);
 *
 * if (validateServiceInterface(logger, {
 *   info: 'function',
 *   error: 'function',
 *   level: 'string'
 * })) {
 *   logger.info('Valid logger');
 * }
 * ```
 */
export function validateServiceInterface<T>(
  service: unknown,
  schema: Record<string, string>,
): service is T {
  if (!service || typeof service !== 'object') {
    return false;
  }

  return Object.entries(schema).every(([key, expectedType]) => {
    const value = (service as any)[key];
    return typeof value === expectedType;
  });
}

/**
 * Create a custom type guard for a service
 *
 * @template T - Service interface type
 * @param validator - Custom validation function
 * @returns Type guard function
 *
 * @description
 * Creates a reusable type guard for service validation.
 *
 * @example
 * ```ts
 * import { createServiceGuard } from '~/di/utils/guards.util';
 *
 * interface ILogger {
 *   info(msg: string): void;
 *   error(msg: string): void;
 * }
 *
 * const isLogger = createServiceGuard<ILogger>((service) => {
 *   return typeof service.info === 'function' &&
 *          typeof service.error === 'function';
 * });
 *
 * const service = getService(LOGGER_SERVICE);
 * if (isLogger(service)) {
 *   service.info('Valid logger');
 * }
 * ```
 */
export function createServiceGuard<T>(
  validator: (service: unknown) => boolean,
): (service: unknown) => service is T {
  return (service: unknown): service is T => {
    return validator(service);
  };
}
