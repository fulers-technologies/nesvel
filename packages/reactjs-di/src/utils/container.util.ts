import 'reflect-metadata';
import type { ServiceIdentifier } from '../types';
import type { ContainerOptions } from '../interfaces';

import {
  Inversiland,
  getModuleContainer,
  InversilandLogLevel,
  type ModuleContainer,
} from 'inversiland';

/**
 * Flag indicating whether the container has been initialized
 * @private
 */
let initialized = false;

/**
 * Reference to the root container instance
 * @private
 */
let rootContainer: any = null;

/**
 * Initialize the DI container with a root module
 *
 * @param RootModule - The root module class to bootstrap the container
 * @param options - Optional configuration for the container
 * @throws {Error} If container is already initialized and skipIfInitialized is false
 *
 * @example
 * ```ts
 * import { AppModule } from '~/modules/app.module';
 *
 * initializeContainer(AppModule, {
 *   logLevel: 'debug',
 *   defaultScope: 'Singleton'
 * });
 * ```
 */
export function initializeContainer(RootModule: any, options: ContainerOptions = {}): void {
  // Determine if we're in development mode
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  const {
    logLevel = isDev ? InversilandLogLevel.Debug : InversilandLogLevel.Info,
    defaultScope = 'Singleton',
    skipIfInitialized = true,
  } = options;

  // Check if already initialized
  if (initialized) {
    if (skipIfInitialized) {
      console.warn('[DI] Container already initialized - skipping re-initialization');
      return;
    }
    throw new Error('[DI] Container already initialized. Call resetContainer() first.');
  }

  // Configure Inversiland options
  Inversiland.options.defaultScope = defaultScope;
  Inversiland.options.logLevel = logLevel as InversilandLogLevel;

  try {
    // Run the root module to bootstrap DI container
    Inversiland.run(RootModule);

    // Store container reference for later access
    rootContainer = getModuleContainer(RootModule);
    initialized = true;

    const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log('[DI] Container initialized successfully', {
        module: RootModule.name,
        logLevel,
        defaultScope,
      });
    }
  } catch (error: Error | any) {
    initialized = false;
    rootContainer = null;
    console.error('[DI] Failed to initialize container:', error);
    throw error;
  }
}

/**
 * Get the initialized root container instance
 *
 * @returns The root container instance
 * @throws {Error} If container has not been initialized
 *
 * @example
 * ```ts
 * const container = getContainer();
 * const logger = container.get(LOGGER_SERVICE);
 * ```
 */
export function getContainer(): ModuleContainer {
  if (!rootContainer) {
    throw new Error('[DI] Container not initialized. Call initializeContainer() first.');
  }
  return rootContainer;
}

/**
 * Check if the container has been initialized
 *
 * @returns True if container is initialized, false otherwise
 *
 * @example
 * ```ts
 * if (isInitialized()) {
 *   const container = getContainer();
 *   // Use container...
 * }
 * ```
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Reset the container state
 *
 * @description
 * This is primarily useful for testing scenarios where you need to
 * re-initialize the container with different configurations.
 *
 * @warning Use with caution - this will clear all existing service instances
 *
 * @example
 * ```ts
 * // In test cleanup
 * afterEach(() => {
 *   resetContainer();
 * });
 * ```
 */
export function resetContainer(): void {
  initialized = false;
  rootContainer = null;

  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('[DI] Container reset');
  }
}

/**
 * Get a service directly from the container
 *
 * @template T - The service type
 * @param token - The service identifier token
 * @returns The service instance
 * @throws {Error} If container is not initialized or service is not found
 *
 * @example
 * ```ts
 * import { LOGGER_SERVICE, type ILogger } from '~/modules/logger';
 *
 * const logger = getService<ILogger>(LOGGER_SERVICE);
 * logger.info('Hello from service');
 * ```
 */
export function getService<T = unknown>(token: ServiceIdentifier<T>): T {
  const container = getContainer();
  return container.get<T>(token);
}
