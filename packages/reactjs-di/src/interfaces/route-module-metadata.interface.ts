/**
 * Route Module Metadata Interface
 *
 * @description
 * Extended module metadata with route support for RouteModule decorator.
 */

import type { DynamicModule, NewableModule, Provider } from 'inversiland';
import type { interfaces } from '@inversiland/inversify';
import type { ComponentType } from 'react';
import type { RouteController } from './route-controller.interface';
import type { RouteDefinition } from './route-definition.interface';

interface DetailedExportedProvider<T = unknown> {
  provide: interfaces.ServiceIdentifier<T>;
  deep?: boolean;
  prototype?: never;
}

type Module = NewableModule | DynamicModule;

type ExportedProvider<T = unknown> = TokenExportedProvider<T> | DetailedExportedProvider<T>;

type TokenExportedProvider<T = unknown> = interfaces.ServiceIdentifier<T>;

interface ModuleMetadataArgs {
  /**
   * @description Optional list of submodules defined in this module which have to be
   * registered.
   */
  imports?: Module[];
  /**
   * @description Optional list of providers defined in this module which have to be
   * registered.
   */
  providers?: Provider[];
  /**
   * @description Optional list of providers exported from this module.
   */
  exports?: ExportedProvider[];
}

/**
 * Extended module metadata with route support
 */
export interface RouteModuleMetadata extends ModuleMetadataArgs {
  /**
   * @deprecated No longer needed - define full paths in @Route decorator instead
   * Base path for all routes in this module
   */
  path?: string;
  /** Route controllers */
  controllers?: Array<new (...args: any[]) => RouteController>;
  /** Route definitions (legacy) or route components with @Route decorator */
  routes?: (RouteDefinition | ComponentType<any>)[];
}
