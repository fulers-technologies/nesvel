/**
 * Route Builder Utility
 *
 * @description
 * Generates React Router configuration from registered RouteModules.
 * Bridges the gap between DI modules and React Router's routing system.
 *
 * @example
 * ```tsx
 * // routes.ts
 * import { buildRoutesFromModules } from '@nesvel/reactjs-di';
 *
 * export default buildRoutesFromModules();
 * ```
 */

import type { RouteConfig } from '@react-router/dev/routes';
import { routeModuleRegistry } from '../registry';
import type { RouteDefinition } from '../interfaces';

// ============================================================================
// Route Builder
// ============================================================================

/**
 * Convert RouteDefinition to React Router's RouteConfig format
 */
function convertToRouteConfig(route: RouteDefinition, filePath: string): any {
  const config: any = {
    path: route.path,
    file: filePath,
  };

  if (route.children && route.children.length > 0) {
    config.children = route.children.map((child, idx) =>
      convertToRouteConfig(child, `${filePath}-child-${idx}`),
    );
  }

  return config;
}

/**
 * Build React Router configuration from registered RouteModules
 *
 * @returns React Router RouteConfig array
 *
 * @example
 * ```tsx
 * // routes.ts
 * import { buildRoutesFromModules } from '@nesvel/reactjs-di';
 * import { index, route } from '@react-router/dev/routes';
 *
 * export default [
 *   index('routes/home.tsx'),
 *   ...buildRoutesFromModules(),
 * ] satisfies RouteConfig;
 * ```
 */
export function buildRoutesFromModules(): RouteConfig[] {
  const routes = routeModuleRegistry.getAllRoutes();

  console.log('[buildRoutesFromModules] Registered routes:', routes.length);
  routes.forEach((route, idx) => {
    console.log(
      `  [${idx}] path: ${route.path}, component:`,
      route.component.name || route.component,
    );
    if (route.children) {
      route.children.forEach((child, childIdx) => {
        console.log(`    [${idx}.${childIdx}] child path: ${child.path}`);
      });
    }
  });

  const builtRoutes = routes.map((route, idx) => ({
    path: route.path,
    Component: route.component,
    children: route.children?.map((child, childIdx) => ({
      path: child.path,
      Component: child.component,
    })),
  })) as any;

  console.log('[buildRoutesFromModules] Built routes:', builtRoutes);

  return builtRoutes;
}

/**
 * Get all registered routes as plain objects
 * Useful for debugging or custom route generation
 */
export function getRegisteredRoutes(): RouteDefinition[] {
  return routeModuleRegistry.getAllRoutes();
}

/**
 * Build route object for programmatic usage
 *
 * @example
 * ```tsx
 * const router = createBrowserRouter([
 *   {
 *     path: '/',
 *     element: <Root />,
 *     children: buildRouteObjects(),
 *   }
 * ]);
 * ```
 */
export function buildRouteObjects() {
  const routes = routeModuleRegistry.getAllRoutes();

  return routes.map((route) => {
    const config: any = {
      path: route.path,
      element: <route.component />,
    };

    if (route.children && route.children.length > 0) {
      config.children = route.children.map((child) => ({
        path: child.path,
        element: <child.component />,
      }));
    }

    if (route.meta) {
      config.handle = route.meta;
    }

    return config;
  });
}

/**
 * Generate route map for type-safe navigation
 *
 * @example
 * ```tsx
 * const ROUTES = generateRouteMap();
 * navigate(ROUTES.users.detail('123')); // '/users/123'
 * ```
 */
export function generateRouteMap() {
  const routes = routeModuleRegistry.getAllRoutes();
  const map: Record<string, any> = {};

  for (const route of routes) {
    const segments = route.path.split('/').filter(Boolean);
    let current = map;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!segment) continue; // Skip if segment is undefined

      const isLast = i === segments.length - 1;

      // Handle dynamic segments
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        if (isLast) {
          current[paramName] = (value: string) => route.path.replace(`:${paramName}`, value);
        }
      } else {
        if (isLast) {
          current[segment] = route.path;
        } else {
          current[segment] = current[segment] || {};
          current = current[segment];
        }
      }
    }
  }

  return map;
}
