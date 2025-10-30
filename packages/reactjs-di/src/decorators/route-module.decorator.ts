/**
 * Route Module Decorator
 *
 * @description
 * Extends Inversiland's @Module decorator to support route registration.
 * Allows modules to declare routes/controllers that can be automatically
 * registered with React Router.
 *
 * @example
 * ```tsx
 * @RouteModule({
 *   path: '/users',
 *   providers: [UserService],
 *   controllers: [UserController],
 *   routes: [
 *     { path: '', component: UsersListPage },
 *     { path: ':id', component: UserDetailPage },
 *   ]
 * })
 * export class UserModule {}
 * ```
 */

import { module } from 'inversiland';
import type { RouteModuleMetadata } from '../interfaces';
import { routeModuleRegistry } from '../registry';

// ============================================================================
// Decorator
// ============================================================================

/**
 * RouteModule Decorator
 *
 * Extends @Module with route registration capabilities.
 * Combines Inversiland's DI with React Router's routing.
 *
 * @param metadata - Module configuration with route support
 *
 * @example
 * ```tsx
 * @RouteModule({
 *   path: '/products',
 *   providers: [ProductService],
 *   controllers: [ProductController],
 *   routes: [
 *     { path: '', component: ProductsList },
 *     { path: ':id', component: ProductDetail },
 *   ]
 * })
 * export class ProductModule {}
 * ```
 */
export function RouteModule(metadata: RouteModuleMetadata) {
  return function (target: new (...args: any[]) => any): void {
    // Register with route registry
    routeModuleRegistry.register(target, metadata);

    // Apply Inversiland's @module decorator
    const ModuleDecorator = module(metadata);
    ModuleDecorator(target);
  };
}
