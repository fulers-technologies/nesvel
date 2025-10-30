/**
 * Dependency Injection Module
 *
 * @module di
 * @description
 * Core dependency injection utilities powered by Inversiland.
 * Provides a clean, type-safe way to manage dependencies in React applications.
 *
 * ## Features
 * - 🎯 Type-safe dependency injection
 * - ⚡ React hooks for easy service access
 * - 🔧 Zero-config with sensible defaults
 * - 📦 Modular architecture with route support
 * - 🎨 Decorator-based service and route definition
 *
 * ## Quick Start
 *
 * ### 1. Initialize the container
 * ```tsx
 * import { initializeContainer } from '@nesvel/reactjs-di';
 * import { AppModule } from '~/modules/app.module';
 *
 * initializeContainer(AppModule);
 * ```
 *
 * ### 2. Wrap your app with DIProvider
 * ```tsx
 * import { DIProvider } from '@nesvel/reactjs-di';
 *
 * export default function App() {
 *   return (
 *     <DIProvider>
 *       <Outlet />
 *     </DIProvider>
 *   );
 * }
 * ```
 *
 * ### 3. Use services in components
 * ```tsx
 * import { useDI } from '@nesvel/reactjs-di';
 * import { LOGGER_SERVICE, type ILogger } from '~/modules/logger';
 *
 * export default function MyPage() {
 *   const logger = useDI<ILogger>(LOGGER_SERVICE);
 *
 *   const handleClick = () => {
 *     logger.info('Button clicked!');
 *   };
 *
 *   return <button onClick={handleClick}>Click Me</button>;
 * }
 * ```
 *
 * ### 4. Define routes with decorators
 * ```tsx
 * import { Route, RouteModule } from '@nesvel/reactjs-di';
 *
 * @Route({ path: '/users', meta: { title: 'Users' } })
 * export function UsersPage() {
 *   return <div>Users</div>;
 * }
 *
 * @RouteModule({
 *   path: '/users',
 *   providers: [UserService],
 *   routes: [UsersPage]
 * })
 * export class UserModule {}
 * ```
 */

// ============================================================================
// Core Container Utilities
// ============================================================================

export {
  initializeContainer,
  getContainer,
  isInitialized,
  resetContainer,
  getService,
} from './utils/container.util';

// ============================================================================
// React Integration
// ============================================================================

export { DIProvider } from './providers/di.provider';
export { DIContext } from './contexts/di.context';

// ============================================================================
// React Hooks
// ============================================================================

export { useDI } from './hooks/use-di.hook';
export { useOptionalDI } from './hooks/use-optional-di.hook';
export { useServices } from './hooks/use-services.hook';

// ============================================================================
// Decorators
// ============================================================================

// Inversiland decorators
export { module, injectable, inject } from 'inversiland';

// Route decorators
export { RouteModule } from './decorators/route-module.decorator';
export { Route, getRouteMetadata, hasRouteMetadata } from './decorators/route.decorator';

// ============================================================================
// Types
// ============================================================================

export type {
  ServiceIdentifier,
  ServiceToken,
  DIContainerType,
  ServiceFactory,
  LazyServiceGetter,
} from './types';

// ============================================================================
// Interfaces
// ============================================================================

export type {
  ContainerOptions,
  DIProviderProps,
  RouteDefinition,
  RouteController,
  RouteModuleMetadata,
  FactoryOptions,
  TestModuleConfig,
  ServiceMetrics,
  PerformanceState,
  PerformanceReportOptions,
} from './interfaces';

// Route decorator config
export type { RouteConfig } from './decorators/route.decorator';

// Inversiland types
export type { DynamicModule } from 'inversiland';

// ============================================================================
// Constants
// ============================================================================

export { performanceState } from './constants';

// ============================================================================
// Registry
// ============================================================================
export { routeModuleRegistry } from './registry';

// ============================================================================
// Route Builder Utilities
// ============================================================================

export {
  buildRoutesFromModules,
  getRegisteredRoutes,
  buildRouteObjects,
  generateRouteMap,
} from './utils/route-builder.util';

// ============================================================================
// Lazy Initialization Utilities
// ============================================================================

export {
  createLazyService,
  createLazyServices,
  lazyInject,
  canLoadService,
} from './utils/lazy.util';

// ============================================================================
// Service Factory Utilities
// ============================================================================

export {
  createServiceFactory,
  createServiceFactoryWithDI,
  createPooledFactory,
  createDisposableFactory,
} from './utils/factory.util';

// ============================================================================
// Type Guards & Validation
// ============================================================================

export {
  isServiceAvailable,
  validateService,
  assertServiceAvailable,
  areServicesAvailable,
  getAvailableServices,
  isServiceToken,
  validateServiceInterface,
  createServiceGuard,
} from './utils/guards.util';

// ============================================================================
// Testing Utilities
// ============================================================================

export {
  createMockService,
  createStubService,
  createTestContainer,
  spyOnService,
  createServiceSpy,
  waitForContainer,
} from './utils/testing.util';

// ============================================================================
// Performance Monitoring
// ============================================================================

export {
  enablePerformanceMonitoring,
  isPerformanceMonitoringEnabled,
  getServiceWithMetrics,
  getPerformanceMetrics,
  getServiceMetrics,
  clearPerformanceMetrics,
  getSlowestServices,
  getMostUsedServices,
  generatePerformanceReport,
} from './utils/performance.util';
