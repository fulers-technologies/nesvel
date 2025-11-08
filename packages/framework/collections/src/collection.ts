import collect from 'collect.js';

import { ICollection } from './interfaces/collection.interface';

/**
 * Collection class provides a fluent, convenient wrapper for working with arrays and objects.
 *
 * This class wraps the collect.js library and exposes all its methods with proper TypeScript typing.
 * It follows Laravel's Collection API, providing an expressive and chainable interface for data manipulation.
 *
 * The Collection class implements the ICollection and provides a static `make` method for instantiation,
 * following Laravel-like patterns for creating collection instances.
 *
 * @template T - The type of items stored in the collection
 *
 * @example
 * ```typescript
 * // Create a collection using the static make method
 * const users = Collection.make([
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 },
 *   { name: 'Bob', age: 35 }
 * ]);
 *
 * // Chain multiple operations
 * const result = users
 *   .where('age', '>', 25)
 *   .sortBy('name')
 *   .pluck('name')
 *   .all();
 *
 * console.log(result); // ['Bob', 'John']
 * ```
 */
export class Collection<T = any> implements ICollection<T> {
  /**
   * The underlying collect.js collection instance.
   * This private property holds the actual collection object from collect.js library,
   * which provides all the collection manipulation methods.
   */
  private collection: any;

  /**
   * Creates a new Collection instance.
   *
   * The constructor accepts various types of input data including arrays, objects,
   * or other collection instances. It wraps the data using collect.js to provide
   * a fluent interface for data manipulation.
   *
   * Parameters:
   *   - items: The initial data to populate the collection. Can be an array, object,
   *     another Collection instance, or any value supported by collect.js.
   *     Defaults to an empty array if not provided.
   *
   * @example
   * ```typescript
   * // Create from array
   * const collection = new Collection([1, 2, 3, 4, 5]);
   *
   * // Create from object
   * const collection = new Collection({ a: 1, b: 2, c: 3 });
   *
   * // Create empty collection
   * const collection = new Collection();
   * ```
   */
  constructor(items: any = []) {
    // Wrap the provided items using collect.js
    // This creates the underlying collection instance that powers all operations
    this.collection = collect(items);
  }

  /**
   * Static factory method to create a new Collection instance.
   *
   * This method provides a Laravel-like way to instantiate collections without using the `new` keyword.
   * It's the recommended way to create collection instances as it follows the static factory pattern
   * commonly used in Laravel and other modern frameworks.
   *
   * The make method is more expressive and allows for better method chaining and composition.
   * It also makes it easier to swap implementations or add middleware in the future.
   *
   * Parameters:
   *   - items: The initial data to populate the collection. Can be an array, object,
   *     or any value supported by collect.js. Defaults to an empty array if not provided.
   *
   * Returns:
   *   - Collection<U>: A new Collection instance containing the provided items with proper typing.
   *
   * @example
   * ```typescript
   * // Create a collection of numbers
   * const numbers = Collection.make([1, 2, 3, 4, 5]);
   *
   * // Create a collection of objects with type inference
   * interface User {
   *   name: string;
   *   email: string;
   * }
   *
   * const users = Collection.make<User>([
   *   { name: 'John Doe', email: 'john@example.com' },
   *   { name: 'Jane Smith', email: 'jane@example.com' }
   * ]);
   *
   * // Chain operations immediately
   * const result = Collection.make([1, 2, 3, 4, 5])
   *   .filter(n => n > 2)
   *   .map(n => n * 2)
   *   .all();
   * ```
   */
  static make<U = any>(items: any = []): Collection<U> {
    return new Collection<U>(items);
  }

  /**
   * Wraps a collection method call and returns the appropriate result.
   *
   * This private helper method handles the wrapping and unwrapping of collection results.
   * When a collect.js method returns a collection, this method wraps it in our Collection class
   * to maintain proper typing and method chaining. For primitive values, it returns them directly.
   *
   * This ensures that all chainable methods return properly typed Collection instances,
   * while terminal methods return their expected primitive types.
   *
   * Parameters:
   *   - result: The result from a collect.js method call. Can be a collection instance,
   *     array, object, or primitive value.
   *
   * Returns:
   *   - Collection<U> | any: A new Collection instance if the result is a collection,
   *     otherwise returns the primitive value directly.
   */
  private wrapResult<U = any>(result: any): Collection<U> | any {
    // Check if the result has collection-like methods (indicates it's a collect.js instance)
    if (result && typeof result === 'object' && typeof result.all === 'function') {
      // Wrap the collection result in our Collection class for proper typing
      return new Collection<U>(result.all());
    }
    // Return primitive values directly (numbers, strings, booleans, etc.)
    return result;
  }

  // ============================================================================
  // Collection Methods Implementation
  // ============================================================================
  // All methods below delegate to the underlying collect.js instance and wrap
  // the results appropriately to maintain type safety and method chaining.
  // ============================================================================

  /**
   * Get all items in the collection as an array or object.
   *
   * This method returns the underlying raw data structure of the collection.
   * For array-based collections, it returns an array. For object-based collections,
   * it returns an object with key-value pairs.
   *
   * This is a terminal method that breaks the chain and returns the actual data.
   *
   * Returns:
   *   - T[]: The underlying array or object containing all collection items.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([1, 2, 3, 4, 5]);
   * console.log(collection.all()); // [1, 2, 3, 4, 5]
   *
   * const objCollection = Collection.make({ a: 1, b: 2, c: 3 });
   * console.log(objCollection.all()); // { a: 1, b: 2, c: 3 }
   * ```
   */
  all(): T[] {
    return this.collection.all();
  }

  /**
   * Calculate the average value of a given key or all numeric values.
   *
   * When called without arguments on a numeric array, it calculates the average of all values.
   * When called with a key on an array of objects, it calculates the average of that property.
   * When called with a callback, it uses the callback's return value for calculation.
   *
   * Parameters:
   *   - key: Optional. Can be a string property name or a callback function that returns
   *     a numeric value for each item. If omitted, calculates average of all numeric items.
   *
   * Returns:
   *   - number: The calculated average value. Returns 0 for empty collections.
   *
   * @example
   * ```typescript
   * // Average of numeric array
   * Collection.make([1, 2, 3, 4, 5]).average(); // 3
   *
   * // Average of object property
   * Collection.make([
   *   { score: 85 },
   *   { score: 90 },
   *   { score: 95 }
   * ]).average('score'); // 90
   *
   * // Average using callback
   * Collection.make([
   *   { price: 100, quantity: 2 },
   *   { price: 50, quantity: 4 }
   * ]).average(item => item.price * item.quantity); // 175
   * ```
   */
  average(key?: string | ((item: T) => number)): number {
    return this.collection.average(key);
  }

  /**
   * Alias for the average method.
   *
   * This method provides a shorter alternative to `average()` for convenience.
   * It behaves identically to the average method in all respects.
   *
   * Parameters:
   *   - key: Optional. Can be a string property name or a callback function.
   *
   * Returns:
   *   - number: The calculated average value.
   *
   * @see average
   */
  avg(key?: string | ((item: T) => number)): number {
    return this.collection.avg(key);
  }

  /**
   * Break the collection into multiple smaller collections of a given size.
   *
   * This method divides the collection into chunks of the specified size.
   * The last chunk may contain fewer items if the collection size is not evenly divisible.
   * This is useful for pagination, batch processing, or displaying items in grids.
   *
   * Parameters:
   *   - size: The maximum number of items each chunk should contain. Must be a positive integer.
   *
   * Returns:
   *   - Collection<T[]>: A new collection where each item is an array (chunk) of the original items.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([1, 2, 3, 4, 5, 6, 7]);
   * const chunks = collection.chunk(3);
   * console.log(chunks.all()); // [[1, 2, 3], [4, 5, 6], [7]]
   *
   * // Useful for creating grids
   * const products = Collection.make(allProducts).chunk(4);
   * // Each chunk represents a row of 4 products
   * ```
   */
  chunk(size: number): Collection<T[]> {
    return this.wrapResult(this.collection.chunk(size));
  }

  /**
   * Collapse a collection of arrays into a single, flat collection.
   *
   * This method flattens a multi-dimensional array by one level.
   * It takes an array of arrays and merges them into a single array.
   * Only the first level of nesting is collapsed.
   *
   * Returns:
   *   - Collection<any>: A new flattened collection with one less level of nesting.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([[1, 2], [3, 4], [5, 6]]);
   * console.log(collection.collapse().all()); // [1, 2, 3, 4, 5, 6]
   *
   * // With objects
   * const nested = Collection.make([
   *   [{ id: 1 }, { id: 2 }],
   *   [{ id: 3 }, { id: 4 }]
   * ]);
   * console.log(nested.collapse().all());
   * // [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
   * ```
   */
  collapse(): Collection<any> {
    return this.wrapResult(this.collection.collapse());
  }

  /**
   * Combine the collection keys with another array of values.
   *
   * This method uses the current collection items as keys and combines them
   * with the provided array of values to create a new object-like collection.
   * The collection items become keys, and the provided values become the corresponding values.
   *
   * Parameters:
   *   - values: An array of values to pair with the collection's items (used as keys).
   *     Should have the same length as the collection for complete pairing.
   *
   * Returns:
   *   - Collection<any>: A new collection with items as keys and provided values as values.
   *
   * @example
   * ```typescript
   * const keys = Collection.make(['name', 'age', 'email']);
   * const values = ['John Doe', 30, 'john@example.com'];
   * const combined = keys.combine(values);
   * console.log(combined.all());
   * // { name: 'John Doe', age: 30, email: 'john@example.com' }
   * ```
   */
  combine(values: any[]): Collection<any> {
    return this.wrapResult(this.collection.combine(values));
  }

  /**
   * Concatenate the given array or collection values onto the end of the collection.
   *
   * This method appends items from another array or collection to the current collection.
   * It does not modify the original collection but returns a new one with the combined items.
   * For object-based collections, numeric keys are reindexed while string keys are preserved.
   *
   * Parameters:
   *   - source: An array or Collection instance whose items will be appended to the current collection.
   *
   * Returns:
   *   - Collection<T>: A new collection containing items from both the original and source.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([1, 2, 3]);
   * const result = collection.concat([4, 5, 6]);
   * console.log(result.all()); // [1, 2, 3, 4, 5, 6]
   *
   * // Concatenate multiple collections
   * const first = Collection.make(['a', 'b']);
   * const second = Collection.make(['c', 'd']);
   * console.log(first.concat(second).all()); // ['a', 'b', 'c', 'd']
   * ```
   */
  concat(source: any[] | Collection<any>): Collection<T> {
    const sourceData = source instanceof Collection ? source.all() : source;
    return this.wrapResult(this.collection.concat(sourceData));
  }

  /**
   * Determine whether the collection contains a given item.
   *
   * This method checks if an item exists in the collection. It can be used in multiple ways:
   * - With a callback function to test each item
   * - With a key and value to check for a specific property value
   * - With a single value to check for its presence
   *
   * Parameters:
   *   - key: A string property name or a callback function that returns boolean.
   *     When using a callback, it receives each item and should return true if found.
   *   - value: Optional. The value to compare against when key is a property name.
   *
   * Returns:
   *   - boolean: True if the item exists in the collection, false otherwise.
   *
   * @example
   * ```typescript
   * // Check with callback
   * Collection.make([1, 2, 3]).contains(item => item > 2); // true
   *
   * // Check property value
   * Collection.make([
   *   { name: 'John', age: 30 },
   *   { name: 'Jane', age: 25 }
   * ]).contains('name', 'John'); // true
   *
   * // Check simple value
   * Collection.make([1, 2, 3]).contains(2); // true
   * ```
   */
  contains(key: string | ((item: T) => boolean), value?: any): boolean {
    return this.collection.contains(key, value);
  }

  /**
   * Determine if the collection contains only a single item.
   *
   * This method checks whether the collection has exactly one item.
   * It returns false for empty collections or collections with multiple items.
   *
   * Returns:
   *   - boolean: True if the collection has exactly one item, false otherwise.
   *
   * @example
   * ```typescript
   * Collection.make([1]).containsOneItem(); // true
   * Collection.make([1, 2]).containsOneItem(); // false
   * Collection.make([]).containsOneItem(); // false
   * ```
   */
  containsOneItem(): boolean {
    return this.collection.containsOneItem();
  }

  /**
   * Count the number of items in the collection.
   *
   * This method returns the total number of items in the collection.
   * For array-based collections, it returns the array length.
   * For object-based collections, it returns the number of keys.
   *
   * Returns:
   *   - number: The total count of items in the collection.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 3, 4, 5]).count(); // 5
   * Collection.make({ a: 1, b: 2, c: 3 }).count(); // 3
   * Collection.make([]).count(); // 0
   * ```
   */
  count(): number {
    return this.collection.count();
  }

  /**
   * Count the occurrences of values in the collection.
   *
   * This method groups items by their value (or by a callback's return value)
   * and counts how many times each unique value appears.
   * It's useful for creating frequency distributions or histograms.
   *
   * Parameters:
   *   - callback: Optional. A string property name or callback function to determine
   *     what value to count by. If omitted, counts the items themselves.
   *
   * Returns:
   *   - Collection<any>: A new collection where keys are unique values and values are counts.
   *
   * @example
   * ```typescript
   * // Count occurrences of values
   * Collection.make([1, 2, 2, 3, 3, 3]).countBy().all();
   * // { '1': 1, '2': 2, '3': 3 }
   *
   * // Count by property
   * Collection.make([
   *   { type: 'apple' },
   *   { type: 'orange' },
   *   { type: 'apple' }
   * ]).countBy('type').all();
   * // { apple: 2, orange: 1 }
   *
   * // Count by callback
   * Collection.make([1, 2, 3, 4, 5, 6])
   *   .countBy(n => n % 2 === 0 ? 'even' : 'odd')
   *   .all();
   * // { odd: 3, even: 3 }
   * ```
   */
  countBy(callback?: string | ((item: T) => any)): Collection<any> {
    return this.wrapResult(this.collection.countBy(callback));
  }

  /**
   * Cross join the given arrays, returning all possible permutations.
   *
   * This method creates a Cartesian product of the collection with the provided arrays.
   * Each item in the collection is paired with each item from each provided array,
   * creating all possible combinations.
   *
   * Parameters:
   *   - arrays: Variable number of arrays to cross join with the collection.
   *
   * Returns:
   *   - Collection<any[]>: A new collection where each item is an array representing one permutation.
   *
   * @example
   * ```typescript
   * const colors = Collection.make(['red', 'blue']);
   * const sizes = ['small', 'large'];
   * const result = colors.crossJoin(sizes);
   * console.log(result.all());
   * // [
   * //   ['red', 'small'],
   * //   ['red', 'large'],
   * //   ['blue', 'small'],
   * //   ['blue', 'large']
   * // ]
   *
   * // Three-way cross join
   * Collection.make([1, 2])
   *   .crossJoin(['a', 'b'], ['x', 'y'])
   *   .all();
   * // [[1,'a','x'], [1,'a','y'], [1,'b','x'], [1,'b','y'],
   * //  [2,'a','x'], [2,'a','y'], [2,'b','x'], [2,'b','y']]
   * ```
   */
  crossJoin(...arrays: any[][]): Collection<any[]> {
    return this.wrapResult(this.collection.crossJoin(...arrays));
  }

  /**
   * Dump the collection items and end the script (die and dump).
   *
   * This method logs the collection items to the console and then terminates the process.
   * It's primarily used for debugging purposes during development.
   * Similar to Laravel's dd() helper function.
   *
   * Returns:
   *   - void: This method does not return as it terminates the process.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 3])
   *   .map(n => n * 2)
   *   .dd(); // Logs [2, 4, 6] and exits
   * ```
   */
  dd(): void {
    return this.collection.dd();
  }

  /**
   * Get the items that are not present in the given items.
   *
   * This method compares the collection with another array or collection
   * and returns items that exist in the original but not in the provided values.
   * It performs value-based comparison using strict equality.
   *
   * Parameters:
   *   - values: An array or Collection to compare against.
   *
   * Returns:
   *   - Collection<T>: A new collection containing items unique to the original collection.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([1, 2, 3, 4, 5]);
   * const result = collection.diff([2, 4, 6]);
   * console.log(result.all()); // [1, 3, 5]
   *
   * // With objects (compares by reference)
   * const obj1 = { id: 1 };
   * const obj2 = { id: 2 };
   * Collection.make([obj1, obj2]).diff([obj2]).all(); // [obj1]
   * ```
   */
  diff(values: any[] | Collection<any>): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.diff(compareData));
  }

  /**
   * Get the items whose keys and values are not present in the given items.
   *
   * This method compares both keys and values when determining differences.
   * An item is included in the result only if its key-value pair doesn't exist
   * in the provided comparison data.
   *
   * Parameters:
   *   - values: An array or Collection to compare against.
   *
   * Returns:
   *   - Collection<T>: A new collection with items that have unique key-value pairs.
   *
   * @example
   * ```typescript
   * const collection = Collection.make({ a: 1, b: 2, c: 3 });
   * const result = collection.diffAssoc({ a: 1, b: 99 });
   * console.log(result.all()); // { b: 2, c: 3 }
   * // 'a' is excluded because both key and value match
   * // 'b' is included because value differs
   * ```
   */
  diffAssoc(values: any[] | Collection<any>): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.diffAssoc(compareData));
  }

  /**
   * Get the items whose keys are not present in the given items.
   *
   * This method compares only the keys (not values) when determining differences.
   * It returns items whose keys don't exist in the provided comparison data,
   * regardless of the values.
   *
   * Parameters:
   *   - values: An array or Collection to compare keys against.
   *
   * Returns:
   *   - Collection<T>: A new collection with items that have unique keys.
   *
   * @example
   * ```typescript
   * const collection = Collection.make({ a: 1, b: 2, c: 3 });
   * const result = collection.diffKeys({ a: 99, d: 4 });
   * console.log(result.all()); // { b: 2, c: 3 }
   * // Keys 'b' and 'c' don't exist in comparison data
   * ```
   */
  diffKeys(values: any[] | Collection<any>): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.diffKeys(compareData));
  }

  /**
   * Get the items that are not present using a callback comparison.
   *
   * This method allows custom comparison logic through a callback function.
   * The callback receives two items and should return a number:
   * - Negative if first item is less than second
   * - Zero if items are equal
   * - Positive if first item is greater than second
   *
   * Parameters:
   *   - values: An array or Collection to compare against.
   *   - callback: A comparison function that determines equality.
   *
   * Returns:
   *   - Collection<T>: A new collection with items that don't match based on the callback.
   *
   * @example
   * ```typescript
   * const collection = Collection.make([
   *   { id: 1, name: 'John' },
   *   { id: 2, name: 'Jane' }
   * ]);
   *
   * const compare = [{ id: 1, name: 'Johnny' }];
   *
   * const result = collection.diffUsing(compare, (a, b) => a.id - b.id);
   * console.log(result.all()); // [{ id: 2, name: 'Jane' }]
   * // Compared by id, not by reference or full object equality
   * ```
   */
  diffUsing(values: any[] | Collection<any>, callback: (a: any, b: any) => number): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.diffUsing(compareData, callback));
  }

  /**
   * Determine whether the collection does not contain a given item.
   *
   * This is the inverse of the contains method. It returns true if the item
   * is NOT found in the collection. Supports the same parameter patterns as contains.
   *
   * Parameters:
   *   - key: A string property name or callback function.
   *   - value: Optional value to compare when key is a property name.
   *
   * Returns:
   *   - boolean: True if the item does NOT exist in the collection.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 3]).doesntContain(4); // true
   * Collection.make([1, 2, 3]).doesntContain(2); // false
   *
   * Collection.make([
   *   { name: 'John' },
   *   { name: 'Jane' }
   * ]).doesntContain('name', 'Bob'); // true
   * ```
   */
  doesntContain(key: string | ((item: T) => boolean), value?: any): boolean {
    return this.collection.doesntContain(key, value);
  }

  /**
   * Dump the collection items to the console.
   *
   * This method logs the collection items to the console for debugging purposes
   * and then returns the collection instance for continued chaining.
   * Unlike dd(), this method does not terminate the process.
   *
   * Returns:
   *   - this: The collection instance for method chaining.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 3])
   *   .map(n => n * 2)
   *   .dump() // Logs [2, 4, 6]
   *   .filter(n => n > 2)
   *   .dump() // Logs [4, 6]
   *   .all();
   * ```
   */
  dump(): this {
    this.collection.dump();
    return this;
  }

  /**
   * Retrieve duplicate items from the collection.
   *
   * This method identifies and returns items that appear more than once in the collection.
   * When a key or callback is provided, it determines duplicates based on that criteria.
   *
   * Parameters:
   *   - key: Optional. A string property name or callback function to determine
   *     what value to check for duplicates. If omitted, checks the items themselves.
   *
   * Returns:
   *   - Collection<T>: A new collection containing only the duplicate items.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 2, 3, 3, 3]).duplicates().all();
   * // [2, 3] (returns one instance of each duplicate)
   *
   * // Find duplicates by property
   * Collection.make([
   *   { id: 1, email: 'john@example.com' },
   *   { id: 2, email: 'jane@example.com' },
   *   { id: 3, email: 'john@example.com' }
   * ]).duplicates('email').all();
   * // Returns items with duplicate emails
   * ```
   */
  duplicates(key?: string | ((item: T) => any)): Collection<T> {
    return this.wrapResult(this.collection.duplicates(key));
  }

  /**
   * Iterate over the items in the collection.
   *
   * This method executes a callback function for each item in the collection.
   * If the callback returns false, the iteration stops early.
   * The collection instance is returned for method chaining.
   *
   * Parameters:
   *   - callback: A function executed for each item. Receives the item and its key.
   *     Return false to stop iteration early.
   *
   * Returns:
   *   - this: The collection instance for method chaining.
   *
   * @example
   * ```typescript
   * Collection.make([1, 2, 3, 4, 5]).each((item, index) => {
   *   console.log(`Item ${index}: ${item}`);
   * });
   *
   * // Stop iteration early
   * Collection.make([1, 2, 3, 4, 5]).each((item) => {
   *   if (item === 3) return false; // Stops at 3
   *   console.log(item);
   * }); // Logs: 1, 2
   * ```
   */
  each(callback: (item: T, key: number | string) => void | boolean): this {
    this.collection.each(callback);
    return this;
  }

  /**
   * Iterate over the items and pass each nested item to the callback.
   *
   * This method is useful when the collection contains arrays and you want to
   * spread each array's elements as separate arguments to the callback.
   *
   * Parameters:
   *   - callback: A function that receives spread array elements as arguments.
   *     Return false to stop iteration early.
   *
   * Returns:
   *   - this: The collection instance for method chaining.
   *
   * @example
   * ```typescript
   * Collection.make([
   *   ['John', 'Doe', 30],
   *   ['Jane', 'Smith', 25]
   * ]).eachSpread((firstName, lastName, age) => {
   *   console.log(`${firstName} ${lastName} is ${age} years old`);
   * });
   * // Logs:
   * // John Doe is 30 years old
   * // Jane Smith is 25 years old
   * ```
   */
  eachSpread(callback: (...args: any[]) => void | boolean): this {
    this.collection.eachSpread(callback);
    return this;
  }

  /**
   * Verify that all items pass the given truth test.
   *
   * This method tests whether all items in the collection satisfy the provided condition.
   * It returns true only if the callback returns true for every single item.
   * If any item fails the test, it immediately returns false.
   *
   * Parameters:
   *   - callback: A predicate function that tests each item. Should return boolean.
   *
   * Returns:
   *   - boolean: True if all items pass the test, false otherwise.
   *
   * @example
   * ```typescript
   * Collection.make([2, 4, 6, 8]).every(n => n % 2 === 0); // true
   * Collection.make([2, 3, 4, 6]).every(n => n % 2 === 0); // false
   *
   * Collection.make([
   *   { age: 25 },
   *   { age: 30 },
   *   { age: 35 }
   * ]).every(user => user.age >= 18); // true
   * ```
   */
  every(callback: (item: T, key: number | string) => boolean): boolean {
    return this.collection.every(callback);
  }

  except(...keys: (string | number)[]): Collection<T> {
    return this.wrapResult(this.collection.except(...keys));
  }

  filter(callback?: (item: T, key: number | string) => boolean): Collection<T> {
    return this.wrapResult(this.collection.filter(callback));
  }

  first(
    callback?: ((item: T, key: number | string) => boolean) | null,
    defaultValue?: any
  ): T | undefined {
    return this.collection.first(callback, defaultValue);
  }

  firstOrFail(callback?: (item: T, key: number | string) => boolean): T {
    return this.collection.firstOrFail(callback);
  }

  firstWhere(key: string, operator?: any, value?: any): T | undefined {
    return this.collection.firstWhere(key, operator, value);
  }

  flatMap(callback: (item: T, key: number | string) => any): Collection<any> {
    return this.wrapResult(this.collection.flatMap(callback));
  }

  flatten(depth?: number): Collection<any> {
    return this.wrapResult(this.collection.flatten(depth));
  }

  flip(): Collection<any> {
    return this.wrapResult(this.collection.flip());
  }

  forPage(page: number, perPage: number): Collection<T> {
    return this.wrapResult(this.collection.forPage(page, perPage));
  }

  forget(key: string | number): this {
    this.collection.forget(key);
    return this;
  }

  get(key: string | number, defaultValue?: any): any {
    return this.collection.get(key, defaultValue);
  }

  groupBy(key: string | ((item: T) => any)): Collection<any> {
    return this.wrapResult(this.collection.groupBy(key));
  }

  has(key: string | number): boolean {
    return this.collection.has(key);
  }

  implode(key: string, glue?: string): string {
    return this.collection.implode(key, glue);
  }

  intersect(values: any[] | Collection<any>): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.intersect(compareData));
  }

  intersectByKeys(values: any[] | Collection<any>): Collection<T> {
    const compareData = values instanceof Collection ? values.all() : values;
    return this.wrapResult(this.collection.intersectByKeys(compareData));
  }

  isEmpty(): boolean {
    return this.collection.isEmpty();
  }

  isNotEmpty(): boolean {
    return this.collection.isNotEmpty();
  }

  join(glue: string, finalGlue?: string): string {
    return this.collection.join(glue, finalGlue);
  }

  keyBy(key: string | ((item: T) => any)): Collection<any> {
    return this.wrapResult(this.collection.keyBy(key));
  }

  keys(): Collection<string | number> {
    return this.wrapResult(this.collection.keys());
  }

  last(
    callback?: ((item: T, key: number | string) => boolean) | null,
    defaultValue?: any
  ): T | undefined {
    return this.collection.last(callback, defaultValue);
  }

  macro(name: string, callback: Function): void {
    return this.collection.macro(name, callback);
  }

  make(items?: any): Collection<any> {
    return Collection.make(items);
  }

  map<U>(callback: (item: T, key: number | string) => U): Collection<U> {
    return this.wrapResult(this.collection.map(callback));
  }

  mapSpread(callback: (...args: any[]) => any): Collection<any> {
    return this.wrapResult(this.collection.mapSpread(callback));
  }

  mapToDictionary(callback: (item: T, key: number | string) => [any, any]): Collection<any> {
    return this.wrapResult(this.collection.mapToDictionary(callback));
  }

  mapInto(ClassName: new (...args: any[]) => any): Collection<any> {
    return this.wrapResult(this.collection.mapInto(ClassName));
  }

  mapToGroups(callback: (item: T, key: number | string) => [any, any]): Collection<any> {
    return this.wrapResult(this.collection.mapToGroups(callback));
  }

  mapWithKeys(callback: (item: T, key: number | string) => [any, any]): Collection<any> {
    return this.wrapResult(this.collection.mapWithKeys(callback));
  }

  max(key?: string | ((item: T) => number)): number {
    return this.collection.max(key);
  }

  median(key?: string | ((item: T) => number)): number {
    return this.collection.median(key);
  }

  merge(items: any[] | Collection<any> | object): Collection<any> {
    const mergeData = items instanceof Collection ? items.all() : items;
    return this.wrapResult(this.collection.merge(mergeData));
  }

  mergeRecursive(items: any[] | Collection<any> | object): Collection<any> {
    const mergeData = items instanceof Collection ? items.all() : items;
    return this.wrapResult(this.collection.mergeRecursive(mergeData));
  }

  min(key?: string | ((item: T) => number)): number {
    return this.collection.min(key);
  }

  mode(key?: string | ((item: T) => number)): Collection<number> {
    return this.wrapResult(this.collection.mode(key));
  }

  nth(step: number, offset?: number): Collection<T> {
    return this.wrapResult(this.collection.nth(step, offset));
  }

  only(...keys: (string | number)[]): Collection<T> {
    return this.wrapResult(this.collection.only(...keys));
  }

  pad(size: number, value: any): Collection<T> {
    return this.wrapResult(this.collection.pad(size, value));
  }

  partition(callback: (item: T, key: number | string) => boolean): [Collection<T>, Collection<T>] {
    const result = this.collection.partition(callback);
    return [this.wrapResult(result[0]), this.wrapResult(result[1])];
  }

  pipe<U>(callback: (collection: this) => U): U {
    return callback(this);
  }

  pluck(key: string, keyBy?: string): Collection<any> {
    return this.wrapResult(this.collection.pluck(key, keyBy));
  }

  pop(): T | undefined {
    return this.collection.pop();
  }

  prepend(value: any, key?: string | number): this {
    this.collection.prepend(value, key);
    return this;
  }

  pull(key: string | number, defaultValue?: any): any {
    return this.collection.pull(key, defaultValue);
  }

  push(value: any): this {
    this.collection.push(value);
    return this;
  }

  put(key: string | number, value: any): this {
    this.collection.put(key, value);
    return this;
  }

  random(count?: number): T | Collection<T> {
    const result = this.collection.random(count);
    return count ? this.wrapResult(result) : result;
  }

  reduce<U>(callback: (carry: U, item: T, key: number | string) => U, initial: U): U {
    return this.collection.reduce(callback, initial);
  }

  reject(callback: (item: T, key: number | string) => boolean): Collection<T> {
    return this.wrapResult(this.collection.reject(callback));
  }

  replace(items: any[] | Collection<any> | object): Collection<any> {
    const replaceData = items instanceof Collection ? items.all() : items;
    return this.wrapResult(this.collection.replace(replaceData));
  }

  replaceRecursive(items: any[] | Collection<any> | object): Collection<any> {
    const replaceData = items instanceof Collection ? items.all() : items;
    return this.wrapResult(this.collection.replaceRecursive(replaceData));
  }

  reverse(): Collection<T> {
    return this.wrapResult(this.collection.reverse());
  }

  search(value: any | ((item: T, key: number | string) => boolean)): number | string | false {
    return this.collection.search(value);
  }

  shift(): T | undefined {
    return this.collection.shift();
  }

  shuffle(): Collection<T> {
    return this.wrapResult(this.collection.shuffle());
  }

  skip(count: number): Collection<T> {
    return this.wrapResult(this.collection.skip(count));
  }

  skipUntil(value: any | ((item: T, key: number | string) => boolean)): Collection<T> {
    return this.wrapResult(this.collection.skipUntil(value));
  }

  skipWhile(callback: (item: T, key: number | string) => boolean): Collection<T> {
    return this.wrapResult(this.collection.skipWhile(callback));
  }

  slice(start: number, end?: number): Collection<T> {
    return this.wrapResult(this.collection.slice(start, end));
  }

  sole(key?: string | ((item: T) => boolean), operator?: any, value?: any): T {
    return this.collection.sole(key, operator, value);
  }

  some(key: string | ((item: T) => boolean), value?: any): boolean {
    return this.collection.some(key, value);
  }

  sort(callback?: (a: T, b: T) => number): Collection<T> {
    return this.wrapResult(this.collection.sort(callback));
  }

  sortDesc(callback?: (a: T, b: T) => number): Collection<T> {
    return this.wrapResult(this.collection.sortDesc(callback));
  }

  sortBy(key: string | ((item: T) => any)): Collection<T> {
    return this.wrapResult(this.collection.sortBy(key));
  }

  sortByDesc(key: string | ((item: T) => any)): Collection<T> {
    return this.wrapResult(this.collection.sortByDesc(key));
  }

  sortKeys(): Collection<T> {
    return this.wrapResult(this.collection.sortKeys());
  }

  sortKeysDesc(): Collection<T> {
    return this.wrapResult(this.collection.sortKeysDesc());
  }

  splice(start: number, deleteCount?: number, ...items: any[]): Collection<T> {
    return this.wrapResult(this.collection.splice(start, deleteCount, ...items));
  }

  split(numberOfGroups: number): Collection<Collection<T>> {
    return this.wrapResult(this.collection.split(numberOfGroups));
  }

  sum(key?: string | ((item: T) => number)): number {
    return this.collection.sum(key);
  }

  take(count: number): Collection<T> {
    return this.wrapResult(this.collection.take(count));
  }

  takeUntil(value: any | ((item: T, key: number | string) => boolean)): Collection<T> {
    return this.wrapResult(this.collection.takeUntil(value));
  }

  takeWhile(callback: (item: T, key: number | string) => boolean): Collection<T> {
    return this.wrapResult(this.collection.takeWhile(callback));
  }

  tap(callback: (collection: this) => void): this {
    callback(this);
    return this;
  }

  times(count: number, callback: (index: number) => any): Collection<any> {
    return this.wrapResult(this.collection.times(count, callback));
  }

  toArray(): any[] {
    return this.collection.toArray();
  }

  toJson(): string {
    return this.collection.toJson();
  }

  transform(callback: (item: T, key: number | string) => any): this {
    this.collection.transform(callback);
    return this;
  }

  undot(): Collection<any> {
    return this.wrapResult(this.collection.undot());
  }

  unless(
    condition: boolean,
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    if (!condition) {
      callback(this);
    } else if (defaultCallback) {
      defaultCallback(this);
    }
    return this;
  }

  unlessEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    return this.unless(this.isEmpty(), callback, defaultCallback);
  }

  unlessNotEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    return this.unless(this.isNotEmpty(), callback, defaultCallback);
  }

  union(items: any[] | Collection<any> | object): Collection<any> {
    const unionData = items instanceof Collection ? items.all() : items;
    return this.wrapResult(this.collection.union(unionData));
  }

  unique(key?: string | ((item: T) => any)): Collection<T> {
    return this.wrapResult(this.collection.unique(key));
  }

  unwrap(value: any): any {
    return this.collection.unwrap(value);
  }

  values(): Collection<T> {
    return this.wrapResult(this.collection.values());
  }

  when(
    condition: boolean,
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    if (condition) {
      callback(this);
    } else if (defaultCallback) {
      defaultCallback(this);
    }
    return this;
  }

  whenEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    return this.when(this.isEmpty(), callback, defaultCallback);
  }

  whenNotEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this {
    return this.when(this.isNotEmpty(), callback, defaultCallback);
  }

  where(key: string, operator?: any, value?: any): Collection<T> {
    return this.wrapResult(this.collection.where(key, operator, value));
  }

  whereBetween(key: string, values: [any, any]): Collection<T> {
    return this.wrapResult(this.collection.whereBetween(key, values));
  }

  whereIn(key: string, values: any[]): Collection<T> {
    return this.wrapResult(this.collection.whereIn(key, values));
  }

  whereInstanceOf(type: new (...args: any[]) => any): Collection<T> {
    return this.wrapResult(this.collection.whereInstanceOf(type));
  }

  whereNotBetween(key: string, values: [any, any]): Collection<T> {
    return this.wrapResult(this.collection.whereNotBetween(key, values));
  }

  whereNotIn(key: string, values: any[]): Collection<T> {
    return this.wrapResult(this.collection.whereNotIn(key, values));
  }

  whereNull(key?: string): Collection<T> {
    return this.wrapResult(this.collection.whereNull(key));
  }

  whereNotNull(key?: string): Collection<T> {
    return this.wrapResult(this.collection.whereNotNull(key));
  }

  wrap(value: any): Collection<any> {
    return this.wrapResult(this.collection.wrap(value));
  }

  zip(...arrays: any[][]): Collection<any[]> {
    return this.wrapResult(this.collection.zip(...arrays));
  }
}
