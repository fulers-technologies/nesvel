import { initializeContainer, resetContainer } from './container.util';

/**
 * Create a mock service with type safety
 *
 * @template T - Service interface type
 * @param implementation - Partial implementation of the service
 * @returns Mock service instance
 *
 * @description
 * Creates a mock service for testing. Useful with testing frameworks like Vitest or Jest.
 *
 * @example With Vitest
 * ```ts
 * import { createMockService } from '~/di/utils/testing.util';
 * import { vi } from 'vitest';
 *
 * describe('MyComponent', () => {
 *   it('should log info', () => {
 *     const mockLogger = createMockService<ILogger>({
 *       info: vi.fn(),
 *       error: vi.fn(),
 *       warn: vi.fn(),
 *       debug: vi.fn()
 *     });
 *
 *     // Use in component
 *     mockLogger.info('test');
 *     expect(mockLogger.info).toHaveBeenCalledWith('test');
 *   });
 * });
 * ```
 */
export function createMockService<T>(implementation: Partial<T> | T): T {
  return implementation as T;
}

/**
 * Create a stub service with default implementations
 *
 * @template T - Service interface type
 * @param defaults - Default values to return
 * @returns Stub service instance
 *
 * @description
 * Creates a stub service that returns default values.
 * Methods return undefined unless specified.
 *
 * @example
 * ```ts
 * import { createStubService } from '~/di/utils/testing.util';
 *
 * const stubConfig = createStubService<IConfigService>({
 *   get: () => 'test-value',
 *   has: () => true
 * });
 *
 * console.log(stubConfig.get('KEY')); // 'test-value'
 * ```
 */
export function createStubService<T>(defaults: Partial<T> = {}): T {
  return new Proxy(defaults as object, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      // Return undefined for unmocked properties
      return () => undefined;
    },
  }) as T;
}

/**
 * Create a test container with mock services
 *
 * @param config - Test module configuration
 * @returns Cleanup function to reset container
 *
 * @description
 * Creates an isolated DI container for testing with custom services.
 * Returns a cleanup function to reset the container after tests.
 *
 * @example
 * ```ts
 * import { createTestContainer } from '~/di/utils/testing.util';
 * import { module } from '@nesvel/reactjs-di';
 *
 * describe('Service Tests', () => {
 *   let cleanup: () => void;
 *
 *   beforeEach(() => {
 *     @module({
 *       providers: [
 *         { provide: LOGGER_SERVICE, useValue: mockLogger }
 *       ]
 *     })
 *     class TestModule {}
 *
 *     cleanup = createTestContainer(TestModule);
 *   });
 *
 *   afterEach(() => {
 *     cleanup();
 *   });
 *
 *   it('should work', () => {
 *     // Test with isolated container
 *   });
 * });
 * ```
 */
export function createTestContainer(TestModule: any): () => void {
  // Reset any existing container
  resetContainer();

  // Initialize with test module
  initializeContainer(TestModule);

  // Return cleanup function
  return () => {
    resetContainer();
  };
}

/**
 * Spy on a service method
 *
 * @template T - Service type
 * @param service - Service instance
 * @param method - Method name to spy on
 * @param implementation - Optional spy implementation
 * @returns Spy function
 *
 * @description
 * Creates a spy on a service method for testing.
 *
 * @example With Vitest
 * ```ts
 * import { spyOnService } from '~/di/utils/testing.util';
 * import { vi } from 'vitest';
 *
 * it('should call logger', () => {
 *   const logger = getService<ILogger>(LOGGER_SERVICE);
 *   const spy = spyOnService(logger, 'info', vi.fn());
 *
 *   logger.info('test');
 *   expect(spy).toHaveBeenCalledWith('test');
 * });
 * ```
 */
export function spyOnService<T, K extends keyof T>(
  service: T,
  method: K,
  implementation?: (...args: any[]) => any,
): any {
  const original = service[method];
  const spy = implementation || ((...args: any[]) => (original as any)(...args));

  (service as any)[method] = spy;

  return spy;
}

/**
 * Create a service spy that records calls
 *
 * @template T - Service interface type
 * @returns Tuple of [spy service, call history]
 *
 * @description
 * Creates a service spy that records all method calls for verification.
 *
 * @example
 * ```ts
 * import { createServiceSpy } from '~/di/utils/testing.util';
 *
 * it('should track calls', () => {
 *   const [spyLogger, calls] = createServiceSpy<ILogger>();
 *
 *   spyLogger.info('message 1');
 *   spyLogger.error('message 2');
 *
 *   expect(calls).toHaveLength(2);
 *   expect(calls[0]).toEqual({ method: 'info', args: ['message 1'] });
 *   expect(calls[1]).toEqual({ method: 'error', args: ['message 2'] });
 * });
 * ```
 */
export function createServiceSpy<T extends object>(): [T, Array<{ method: string; args: any[] }>] {
  const calls: Array<{ method: string; args: any[] }> = [];

  const spy = new Proxy({} as T, {
    get(_, prop) {
      return (...args: any[]) => {
        calls.push({ method: String(prop), args });
        return undefined;
      };
    },
  });

  return [spy, calls];
}

/**
 * Wait for container initialization in async tests
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves when container is ready
 *
 * @description
 * Utility for waiting for container initialization in async tests.
 *
 * @example
 * ```ts
 * import { waitForContainer } from '~/di/utils/testing.util';
 *
 * it('should initialize container', async () => {
 *   initializeContainer(AppModule);
 *   await waitForContainer();
 *
 *   const logger = getService(LOGGER_SERVICE);
 *   expect(logger).toBeDefined();
 * });
 * ```
 */
export function waitForContainer(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const { isInitialized } = require('./container.util');

      if (isInitialized()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Container initialization timeout'));
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}
