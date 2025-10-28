/**
 * Constructor type for mixin
 */
export type Constructor<T = object> = new (...args: any[]) => T;
