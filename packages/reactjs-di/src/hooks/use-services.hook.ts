import { useContext } from 'react';
import { DIContext } from '../contexts';

/**
 * Service token tuple type helper
 */
type ServiceTokens = readonly symbol[];

/**
 * Infer service types from token array
 */
type InferServices<T extends ServiceTokens> = {
  [K in keyof T]: unknown;
};

/**
 * useServices Hook
 *
 * @template T - Tuple of service identifier symbols
 * @param tokens - Array of service identifier symbols
 * @returns Tuple of service instances matching the input tokens
 * @throws {Error} If used outside DIProvider
 * @throws {Error} If any service is not registered in the container
 *
 * @description
 * Retrieves multiple services from the DI container in a single call.
 * The return type is a tuple that matches the order of input tokens.
 *
 * This is more efficient and cleaner than multiple useDI calls:
 * - Single context access
 * - Better type inference
 * - Cleaner component code
 *
 * @example Basic usage
 * ```tsx
 * import { useServices } from '@nesvel/reactjs-di';
 * import {
 *   LOGGER_SERVICE,
 *   CONFIG_SERVICE,
 *   type ILogger,
 *   type IConfigService
 * } from '~/modules';
 *
 * function MyComponent() {
 *   const [logger, config] = useServices([
 *     LOGGER_SERVICE,
 *     CONFIG_SERVICE
 *   ]) as [ILogger, IConfigService];
 *
 *   useEffect(() => {
 *     const env = config.get('NODE_ENV');
 *     logger.info('Environment:', { env });
 *   }, []);
 *
 *   return <div>Check console</div>;
 * }
 * ```
 *
 * @example With multiple services
 * ```tsx
 * function Dashboard() {
 *   const [logger, config, analytics, cache] = useServices([
 *     LOGGER_SERVICE,
 *     CONFIG_SERVICE,
 *     ANALYTICS_SERVICE,
 *     CACHE_SERVICE
 *   ]) as [ILogger, IConfigService, IAnalyticsService, ICacheService];
 *
 *   // Use all services...
 * }
 * ```
 */
export function useServices<T extends ServiceTokens>(tokens: T): InferServices<T> {
  // Get container from context
  const container = useContext(DIContext);

  // Validate context availability
  if (!container) {
    throw new Error(
      '[useServices] Hook must be used within <DIProvider>. ' +
        'Make sure your app is wrapped with the DIProvider component.',
    );
  }

  try {
    // Resolve all services
    const services = tokens.map((token) => container.get(token));
    return services as InferServices<T>;
  } catch (error) {
    // Provide helpful error message
    throw new Error(
      '[useServices] Failed to resolve one or more services. ' +
        `Original error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
