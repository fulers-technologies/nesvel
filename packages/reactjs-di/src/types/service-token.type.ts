/**
 * Service Token Type
 *
 * @description
 * Alias for ServiceIdentifier for backwards compatibility.
 */

import type { ServiceIdentifier } from './service-identifier.type';

/**
 * Service token type (alias for backwards compatibility)
 */
export type ServiceToken<T = any> = ServiceIdentifier<T>;
