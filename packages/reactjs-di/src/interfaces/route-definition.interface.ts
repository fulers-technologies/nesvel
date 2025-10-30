import type { ComponentType } from 'react';

/**
 * Route definition for a module
 */
export interface RouteDefinition {
  /** Route path (relative to module path) */
  path: string;
  /** Component to render */
  component: ComponentType<any>;
  /** Child routes */
  children?: RouteDefinition[];
  /** Route metadata */
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    layout?: ComponentType<any>;
    [key: string]: any;
  };
}
