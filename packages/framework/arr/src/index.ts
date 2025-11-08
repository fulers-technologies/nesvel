/**
 * Arr Wrapper - TypeScript wrapper for collect.js
 *
 * This module provides a strongly-typed TypeScript wrapper around the collect.js library,
 * offering a Laravel-like arr API for working with arrays and objects in JavaScript/TypeScript.
 *
 * The Arr class provides over 100 methods for data manipulation, transformation,
 * and querying, all with full TypeScript type safety and comprehensive documentation.
 *
 * @module arr
 * @author Your Name
 * @license MIT
 *
 * @example
 * ```typescript
 * import { Arr } from './index';
 *
 * // Create a arr
 * const users = Arr.make([
 *   { name: 'John', age: 30, active: true },
 *   { name: 'Jane', age: 25, active: false },
 *   { name: 'Bob', age: 35, active: true }
 * ]);
 *
 * // Chain operations
 * const activeUserNames = users
 *   .where('active', true)
 *   .sortBy('age')
 *   .pluck('name')
 *   .all();
 *
 * console.log(activeUserNames); // ['John', 'Bob']
 * ```
 */

// Export the Arr class
export { Arr } from './arr';

// Export the interface for type checking
export { IArr } from './interfaces/arr.interface';

// Export a default collect function for convenience
import { Arr } from './arr';

/**
 * Create a new Arr instance using a functional approach.
 *
 * This function provides a convenient way to create arrs without using
 * the class constructor or static make method. It's similar to Laravel's collect() helper.
 *
 * Parameters:
 *   - items: The initial data to populate the arr. Can be an array, object,
 *     or any value supported by collect.js. Defaults to an empty array if not provided.
 *
 * Returns:
 *   - Arr<T>: A new Arr instance containing the provided items.
 *
 * @example
 * ```typescript
 * import collect from './index';
 *
 * const numbers = collect([1, 2, 3, 4, 5]);
 * const doubled = numbers.map(n => n * 2).all();
 * console.log(doubled); // [2, 4, 6, 8, 10]
 * ```
 */
export function arr(): Arr {
  return Arr.make();
}

// Set as default export
export default arr;
