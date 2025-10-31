/**
 * Dynamic DI Routes
 * 
 * This component handles routes registered via the DI system.
 * It matches the current path against registered routes and renders the appropriate component.
 */

import { useLocation, matchPath } from 'react-router';
import { getRegisteredRoutes } from '../utils/route-builder.util';

export function DIRoutes() {
  const location = useLocation();
  const routes = getRegisteredRoutes();

  console.log('[DIRoutes] Current location:', location.pathname);
  console.log('[DIRoutes] Available routes:', routes.map(r => r.path));

  // Find matching route
  const matchedRoute = routes.find((route) => {
    const match = matchPath(route.path, location.pathname);
    console.log(`[DIRoutes] Trying to match ${route.path} against ${location.pathname}:`, match);
    return match !== null;
  });

  if (!matchedRoute) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">404 - Not Found</h1>
          <p>No DI route matches: {location.pathname}</p>
        </div>
      </div>
    );
  }

  const Component = matchedRoute.component;
  
  // Extract params from the path
  const match = matchPath(matchedRoute.path, location.pathname);
  const params = match?.params || {};

  return <Component params={params} />;
}

export default DIRoutes;
