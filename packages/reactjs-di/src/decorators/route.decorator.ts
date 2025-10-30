/**
 * Route Decorator
 *
 * @description
 * Decorator for marking components as routes with metadata.
 * Used in conjunction with @RouteModule to automatically register routes.
 *
 * @example
 * ```tsx
 * @Route({
 *   path: '/users',
 *   meta: { title: 'Users List' }
 * })
 * export class UserListPage extends Component {
 *   render() {
 *     return <div>Users</div>;
 *   }
 * }
 *
 * // Or with function components
 * @Route({ path: '/users/:id' })
 * export function UserDetailPage() {
 *   return <div>User Detail</div>;
 * }
 * ```
 */

import type { ComponentType } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Route metadata configuration
 */
export interface RouteConfig {
  /** Route path (relative to module path) */
  path: string;
  /** Route index (for layout routes with index: true) */
  index?: boolean;
  /** Child routes */
  children?: ComponentType<any>[];
  /** Route metadata */
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    layout?: ComponentType<any>;
    [key: string]: any;
  };
  /** Loader function for data fetching */
  loader?: (...args: any[]) => any;
  /** Action function for mutations */
  action?: (...args: any[]) => any;
}

// ============================================================================
// Metadata Storage
// ============================================================================

const ROUTE_METADATA_KEY = Symbol.for('route:metadata');

/**
 * Store route metadata on a component
 */
function setRouteMetadata(target: any, metadata: RouteConfig): void {
  Reflect.defineMetadata(ROUTE_METADATA_KEY, metadata, target);
}

/**
 * Retrieve route metadata from a component
 */
export function getRouteMetadata(target: any): RouteConfig | undefined {
  return Reflect.getMetadata(ROUTE_METADATA_KEY, target);
}

/**
 * Check if a component has route metadata
 */
export function hasRouteMetadata(target: any): boolean {
  return Reflect.hasMetadata(ROUTE_METADATA_KEY, target);
}

// ============================================================================
// Decorator
// ============================================================================

/**
 * Route Decorator
 *
 * Marks a component as a route with configuration metadata.
 * The component will be automatically registered when used in a RouteModule.
 *
 * @param config - Route configuration
 *
 * @example Basic route
 * ```tsx
 * @Route({ path: '/about' })
 * export function AboutPage() {
 *   return <div>About Us</div>;
 * }
 * ```
 *
 * @example Route with metadata
 * ```tsx
 * @Route({
 *   path: '/admin/users',
 *   meta: {
 *     title: 'User Management',
 *     requiresAuth: true,
 *     requiresRole: 'admin'
 *   }
 * })
 * export function AdminUsersPage() {
 *   return <div>Admin Users</div>;
 * }
 * ```
 *
 * @example Class component route
 * ```tsx
 * @Route({
 *   path: '/dashboard',
 *   meta: { title: 'Dashboard' }
 * })
 * export class DashboardPage extends Component {
 *   render() {
 *     return <div>Dashboard</div>;
 *   }
 * }
 * ```
 *
 * @example Index route
 * ```tsx
 * @Route({ path: '', index: true })
 * export function HomePage() {
 *   return <div>Home</div>;
 * }
 * ```
 */
export function Route(config: RouteConfig): ClassDecorator & ((target: any) => any) {
  return function (target: any): any {
    // Store metadata on the component
    setRouteMetadata(target, config);
    return target;
  } as any;
}
