import { useContext } from 'react';
import type { ServiceIdentifier } from '../types';
import { DIContext } from '../contexts';

/**
 * useDI Hook
 *
 * @template T - The service interface type
 * @param token - The service identifier symbol
 * @returns The service instance
 * @throws {Error} If used outside DIProvider
 * @throws {Error} If service is not registered in the container
 *
 * @description
 * Retrieves a service instance from the DI container. The service must be:
 * 1. Registered in a module
 * 2. Exported by that module
 * 3. Imported in the root AppModule (or a parent module)
 *
 * The hook must be used within a component tree wrapped by `<DIProvider>`.
 *
 * @example Basic usage
 * ```tsx
 * import { useDI } from '@nesvel/reactjs-di';
 * import { LOGGER_SERVICE, type ILogger } from '~/modules/logger';
 *
 * function MyComponent() {
 *   const logger = useDI<ILogger>(LOGGER_SERVICE);
 *
 *   useEffect(() => {
 *     logger.info('Component mounted');
 *   }, []);
 *
 *   return <div>Check console for log</div>;
 * }
 * ```
 *
 * @example Multiple services
 * ```tsx
 * import { useDI } from '@nesvel/reactjs-di';
 * import { LOGGER_SERVICE, type ILogger } from '~/modules/logger';
 * import { CONFIG_SERVICE, type IConfigService } from '~/modules/config';
 *
 * function MyComponent() {
 *   const logger = useDI<ILogger>(LOGGER_SERVICE);
 *   const config = useDI<IConfigService>(CONFIG_SERVICE);
 *
 *   const apiUrl = config.get('API_URL', 'http://localhost:3000');
 *   logger.info('API URL:', { apiUrl });
 *
 *   return <div>API: {apiUrl}</div>;
 * }
 * ```
 */
export function useDI<T = unknown>(token: ServiceIdentifier<T>): T {
  // Get container from context
  const container = useContext(DIContext);

  // Validate context availability
  if (!container) {
    throw new Error(
      '[useDI] Hook must be used within <DIProvider>. ' +
        'Make sure your app is wrapped with the DIProvider component.',
    );
  }

  try {
    // Retrieve service from container
    return container.get(token) as T;
  } catch (error: Error | any) {
    // Provide helpful error message if service not found
    const tokenDescription =
      typeof token === 'symbol' ? token.description || token.toString() : token.toString();
    throw new Error(
      `[useDI] Failed to resolve service: ${tokenDescription}. ` +
        `Make sure the service is registered and exported in a module. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
