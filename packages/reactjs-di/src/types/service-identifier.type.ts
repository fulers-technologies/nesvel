/**
 * Service Identifier Type
 *
 * @description
 * Core type for identifying services in the DI container.
 */

import type { interfaces } from '@inversiland/inversify';

/**
 * Service identifier type
 *
 * @description
 * Represents a valid service identifier that can be used to resolve services.
 * Typically a Symbol created with Symbol.for() for global registry.
 */
export type ServiceIdentifier<T = any> = interfaces.ServiceIdentifier<T>;
