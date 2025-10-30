/**
 * Service Factory Type
 *
 * @description
 * Function type for creating service instances.
 */

/**
 * Service factory function type
 */
export type ServiceFactory<T, Args extends any[] = []> = (...args: Args) => T;
