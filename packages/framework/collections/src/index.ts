/**
 * Collection Wrapper - TypeScript wrapper for collect.js
 *
 * This module provides a strongly-typed TypeScript wrapper around the collect.js library,
 * offering a Laravel-like collection API for working with arrays and objects in JavaScript/TypeScript.
 *
 * The Collection class provides over 100 methods for data manipulation, transformation,
 * and querying, all with full TypeScript type safety and comprehensive documentation.
 *
 * @module collection
 * @author Your Name
 * @license MIT
 *
 * @example
 * ```typescript
 * import { Collection } from './index';
 *
 * // Create a collection
 * const users = Collection.make([
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

// Export the Collection class
export { Collection } from './collection';

// Export the interface for type checking
export type { ICollection } from './interfaces/collection.interface';

// Export a default collect function for convenience
import { Collection } from './collection';

/**
 * Create a new Collection instance using a functional approach.
 *
 * This function provides a convenient way to create collections without using
 * the class constructor or static make method. It's similar to Laravel's collect() helper.
 *
 * Parameters:
 *   - items: The initial data to populate the collection. Can be an array, object,
 *     or any value supported by collect.js. Defaults to an empty array if not provided.
 *
 * Returns:
 *   - Collection<T>: A new Collection instance containing the provided items.
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
export function collect<T = any>(items: any = []): Collection<T> {
  return Collection.make<T>(items);
}

// Set as default export
export default collect;
