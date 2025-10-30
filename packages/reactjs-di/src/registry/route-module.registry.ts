/**
 * Route Module Registry Constant
 *
 * @description
 * Global registry instance for route modules.
 */

import type { RouteModuleMetadata, RouteDefinition } from '../interfaces';
import { getRouteMetadata, hasRouteMetadata } from '../decorators/route.decorator';

/**
 * Convert a route item (component or definition) to RouteDefinition
 */
function toRouteDefinition(route: any): RouteDefinition | null {
  // If it's already a RouteDefinition (has 'component' property)
  if (route && typeof route === 'object' && 'component' in route) {
    return route as RouteDefinition;
  }

  // If it's a component with @Route metadata
  if (typeof route === 'function' && hasRouteMetadata(route)) {
    const metadata = getRouteMetadata(route);
    if (!metadata) return null;

    const routeDef: RouteDefinition = {
      path: metadata.path,
      component: route,
      meta: metadata.meta,
    };

    // Handle children recursively
    if (metadata.children && metadata.children.length > 0) {
      routeDef.children = metadata.children
        .map(toRouteDefinition)
        .filter((r): r is RouteDefinition => r !== null);
    }

    return routeDef;
  }

  return null;
}

/**
 * Global registry for route modules
 */
class RouteModuleRegistry {
  private modules = new Map<any, RouteModuleMetadata>();

  register(target: any, metadata: RouteModuleMetadata): void {
    this.modules.set(target, metadata);
  }

  get(target: any): RouteModuleMetadata | undefined {
    return this.modules.get(target);
  }

  getAll(): Array<[any, RouteModuleMetadata]> {
    return Array.from(this.modules.entries());
  }

  getAllRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    for (const [, metadata] of this.modules.entries()) {
      if (metadata.routes && metadata.routes.length > 0) {
        // Convert all route items to RouteDefinition
        const routeDefinitions = metadata.routes
          .map(toRouteDefinition)
          .filter((r): r is RouteDefinition => r !== null);

        // Routes already have full paths from @Route decorator
        routes.push(...routeDefinitions);
      }
    }

    return routes;
  }

  clear(): void {
    this.modules.clear();
  }
}

export const routeModuleRegistry = new RouteModuleRegistry();
