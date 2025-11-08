/**
 * IArr interface defines the contract for an array utility wrapper
 * that provides Laravel-like static array methods using Lodash under the hood.
 *
 * This interface exposes all array manipulation methods in a static manner,
 * providing a fluent and expressive API for common array operations including
 * filtering, mapping, sorting, accessing, and transforming array data.
 *
 * Unlike collection-based approaches, these methods are designed to work with
 * plain arrays and return plain arrays or primitive values, following the
 * functional programming paradigm.
 *
 * @interface IArr
 */
export interface IArr {
  /**
   * Determine if the given value is accessible as an array.
   *
   * This method checks whether a value can be accessed like an array,
   * including actual arrays, array-like objects, and objects implementing ArrayAccess.
   *
   * Parameters:
   *   - value: The value to check for array accessibility.
   *
   * Returns:
   *   - boolean: True if the value is accessible as an array, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.accessible([1, 2, 3]); // true
   * Arr.accessible({ 0: 'a', 1: 'b', length: 2 }); // true
   * Arr.accessible('string'); // false
   * Arr.accessible(null); // false
   * ```
   */
  accessible(value: any): boolean;

  /**
   * Determine if the given value can be converted to an array.
   *
   * This method checks if a value is arrayable, meaning it can be safely
   * converted to an array format. This includes arrays, iterables, and
   * objects with array-like properties.
   *
   * Parameters:
   *   - value: The value to check for arrayability.
   *
   * Returns:
   *   - boolean: True if the value can be converted to an array, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.arrayable([1, 2, 3]); // true
   * Arr.arrayable(new Set([1, 2, 3])); // true
   * Arr.arrayable({ a: 1, b: 2 }); // true
   * Arr.arrayable(42); // false
   * ```
   */
  arrayable(value: any): boolean;

  /**
   * Add an element to an array using dot notation if it doesn't exist.
   *
   * This method adds a new key-value pair to an array or nested object structure
   * using dot notation for nested keys. If the key already exists, the array
   * is returned unchanged.
   *
   * Parameters:
   *   - array: The array or object to add the element to.
   *   - key: The key in dot notation (e.g., 'user.profile.name').
   *   - value: The value to add at the specified key.
   *
   * Returns:
   *   - any: The modified array or object with the new element added.
   *
   * @example
   * ```typescript
   * const data = { user: { name: 'John' } };
   * Arr.add(data, 'user.email', 'john@example.com');
   * // { user: { name: 'John', email: 'john@example.com' } }
   *
   * Arr.add(data, 'user.name', 'Jane'); // Unchanged, key exists
   * ```
   */
  add(array: any, key: string, value: any): any;

  /**
   * Get an item from an array or object, with optional default value.
   *
   * This method retrieves a value from an array or object using a key.
   * Supports dot notation for nested access. Returns the default value
   * if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key to retrieve (supports dot notation).
   *   - defaultValue: Optional default value if key doesn't exist.
   *
   * Returns:
   *   - any[] | null: The value at the key, or default value if not found.
   *
   * @example
   * ```typescript
   * const data = { user: { name: 'John', age: 30 } };
   * Arr.array(data, 'user'); // { name: 'John', age: 30 }
   * Arr.array(data, 'missing', []); // []
   * ```
   */
  array(array: any, key: string | number | null, defaultValue?: any[] | null): any[] | null;

  /**
   * Get a boolean value from an array or object.
   *
   * This method retrieves a value and converts it to a boolean.
   * Supports dot notation for nested access. Returns the default boolean
   * value if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key to retrieve (supports dot notation).
   *   - defaultValue: Optional default boolean value if key doesn't exist.
   *
   * Returns:
   *   - boolean: The boolean value at the key, or default value.
   *
   * @example
   * ```typescript
   * const data = { user: { active: true, verified: 'yes' } };
   * Arr.boolean(data, 'user.active'); // true
   * Arr.boolean(data, 'user.verified'); // true (truthy conversion)
   * Arr.boolean(data, 'user.deleted', false); // false (default)
   * ```
   */
  boolean(array: any, key: string | number | null, defaultValue?: boolean | null): boolean;

  /**
   * Collapse an array of arrays into a single flat array.
   *
   * This method flattens a multi-dimensional array by one level,
   * merging all nested arrays into a single array. Only the first
   * level of nesting is collapsed.
   *
   * Parameters:
   *   - array: The array of arrays to collapse.
   *
   * Returns:
   *   - any[]: A flattened array with one less level of nesting.
   *
   * @example
   * ```typescript
   * Arr.collapse([[1, 2], [3, 4], [5, 6]]);
   * // [1, 2, 3, 4, 5, 6]
   *
   * Arr.collapse([['a'], ['b', 'c'], ['d']]);
   * // ['a', 'b', 'c', 'd']
   * ```
   */
  collapse(array: any[][]): any[];

  /**
   * Cross join the given arrays, returning all possible permutations.
   *
   * This method creates a Cartesian product of multiple arrays,
   * generating all possible combinations where one element is taken
   * from each input array.
   *
   * Parameters:
   *   - arrays: Variable number of arrays to cross join.
   *
   * Returns:
   *   - any[][]: An array of arrays, each containing one permutation.
   *
   * @example
   * ```typescript
   * Arr.crossJoin(['red', 'blue'], ['small', 'large']);
   * // [
   * //   ['red', 'small'],
   * //   ['red', 'large'],
   * //   ['blue', 'small'],
   * //   ['blue', 'large']
   * // ]
   * ```
   */
  crossJoin(...arrays: any[][]): any[][];

  /**
   * Divide an array into two arrays: keys and values.
   *
   * This method splits an array or object into two separate arrays,
   * one containing all the keys and another containing all the values.
   *
   * Parameters:
   *   - array: The array or object to divide.
   *
   * Returns:
   *   - [any[], any[]]: A tuple containing [keys, values].
   *
   * @example
   * ```typescript
   * Arr.divide({ a: 1, b: 2, c: 3 });
   * // [['a', 'b', 'c'], [1, 2, 3]]
   *
   * Arr.divide(['x', 'y', 'z']);
   * // [[0, 1, 2], ['x', 'y', 'z']]
   * ```
   */
  divide(array: any): [any[], any[]];

  /**
   * Flatten a multi-dimensional array into a single level using dot notation.
   *
   * This method converts a nested object or array structure into a flat object
   * where nested keys are represented using dot notation. This is useful for
   * serialization or working with flat data structures.
   *
   * Parameters:
   *   - array: The nested array or object to flatten.
   *   - prepend: Optional string to prepend to all keys.
   *
   * Returns:
   *   - Record<string, any>: A flat object with dot-notated keys.
   *
   * @example
   * ```typescript
   * Arr.dot({ user: { name: 'John', address: { city: 'NYC' } } });
   * // { 'user.name': 'John', 'user.address.city': 'NYC' }
   *
   * Arr.dot({ a: 1, b: 2 }, 'prefix');
   * // { 'prefix.a': 1, 'prefix.b': 2 }
   * ```
   */
  dot(array: any, prepend?: string): Record<string, any>;

  /**
   * Convert a flattened dot-notation array back into a multi-dimensional array.
   *
   * This method is the inverse of dot(). It takes an object with dot-notated keys
   * and expands it back into a nested object structure.
   *
   * Parameters:
   *   - array: The flattened object with dot-notated keys.
   *
   * Returns:
   *   - any: The expanded nested object or array structure.
   *
   * @example
   * ```typescript
   * Arr.undot({ 'user.name': 'John', 'user.age': 30 });
   * // { user: { name: 'John', age: 30 } }
   *
   * Arr.undot({ 'items.0': 'a', 'items.1': 'b' });
   * // { items: ['a', 'b'] }
   * ```
   */
  undot(array: Record<string, any>): any;

  /**
   * Get all items from an array except for those with specified keys.
   *
   * This method returns a new array or object with all items except those
   * whose keys match the provided keys. Useful for excluding specific fields.
   *
   * Parameters:
   *   - array: The source array or object.
   *   - keys: Single key or array of keys to exclude.
   *
   * Returns:
   *   - any: A new array or object without the specified keys.
   *
   * @example
   * ```typescript
   * Arr.except({ a: 1, b: 2, c: 3 }, ['a', 'c']);
   * // { b: 2 }
   *
   * Arr.except(['a', 'b', 'c', 'd'], [0, 2]);
   * // { 1: 'b', 3: 'd' }
   * ```
   */
  except(array: any, keys: string | number | (string | number)[]): any;

  /**
   * Determine if the given key exists in the provided array.
   *
   * This method checks whether a specific key exists in an array or object.
   * For arrays, it checks if the index exists. For objects, it checks for
   * the property key.
   *
   * Parameters:
   *   - array: The array or object to check.
   *   - key: The key to check for existence.
   *
   * Returns:
   *   - boolean: True if the key exists, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.exists({ a: 1, b: 2 }, 'a'); // true
   * Arr.exists({ a: 1, b: 2 }, 'c'); // false
   * Arr.exists(['x', 'y', 'z'], 1); // true
   * Arr.exists(['x', 'y', 'z'], 5); // false
   * ```
   */
  exists(array: any, key: string | number): boolean;

  /**
   * Return the first element in an array passing a given truth test.
   *
   * This method returns the first element that satisfies the provided callback.
   * If no callback is provided, returns the first element. If no element matches,
   * returns the default value.
   *
   * Parameters:
   *   - array: The array to search.
   *   - callback: Optional predicate function to test each element.
   *   - defaultValue: Optional default value if no match found.
   *
   * Returns:
   *   - any: The first matching element or default value.
   *
   * @example
   * ```typescript
   * Arr.first([1, 2, 3, 4]); // 1
   * Arr.first([1, 2, 3, 4], n => n > 2); // 3
   * Arr.first([], null, 'default'); // 'default'
   * ```
   */
  first<T = any>(
    array: T[],
    callback?: ((item: T, index: number) => boolean) | null,
    defaultValue?: any
  ): T | undefined;

  /**
   * Return the last element in an array passing a given truth test.
   *
   * This method returns the last element that satisfies the provided callback.
   * If no callback is provided, returns the last element. If no element matches,
   * returns the default value.
   *
   * Parameters:
   *   - array: The array to search.
   *   - callback: Optional predicate function to test each element.
   *   - defaultValue: Optional default value if no match found.
   *
   * Returns:
   *   - any: The last matching element or default value.
   *
   * @example
   * ```typescript
   * Arr.last([1, 2, 3, 4]); // 4
   * Arr.last([1, 2, 3, 4], n => n < 3); // 2
   * Arr.last([], null, 'default'); // 'default'
   * ```
   */
  last<T = any>(
    array: T[],
    callback?: ((item: T, index: number) => boolean) | null,
    defaultValue?: any
  ): T | undefined;

  /**
   * Take the first or last n items from an array.
   *
   * This method returns a specified number of items from the beginning or end
   * of an array. Positive numbers take from the start, negative numbers take
   * from the end.
   *
   * Parameters:
   *   - array: The source array.
   *   - limit: Number of items to take (negative for from end).
   *
   * Returns:
   *   - any[]: A new array with the taken items.
   *
   * @example
   * ```typescript
   * Arr.take([1, 2, 3, 4, 5], 3); // [1, 2, 3]
   * Arr.take([1, 2, 3, 4, 5], -2); // [4, 5]
   * Arr.take([1, 2, 3], 10); // [1, 2, 3]
   * ```
   */
  take<T = any>(array: T[], limit: number): T[];

  /**
   * Flatten a multi-dimensional array to a specified depth.
   *
   * This method recursively flattens nested arrays up to the specified depth.
   * A depth of 1 flattens one level, Infinity flattens completely.
   *
   * Parameters:
   *   - array: The nested array to flatten.
   *   - depth: Maximum depth to flatten (default: Infinity).
   *
   * Returns:
   *   - any[]: The flattened array.
   *
   * @example
   * ```typescript
   * Arr.flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
   * Arr.flatten([1, [2, [3, [4]]]], 1); // [1, 2, [3, [4]]]
   * Arr.flatten([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
   * ```
   */
  flatten(array: any[], depth?: number): any[];

  /**
   * Get a float value from an array or object.
   *
   * This method retrieves a value and converts it to a float number.
   * Supports dot notation for nested access. Returns the default float
   * value if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key to retrieve (supports dot notation).
   *   - defaultValue: Optional default float value if key doesn't exist.
   *
   * Returns:
   *   - number: The float value at the key, or default value.
   *
   * @example
   * ```typescript
   * const data = { price: '19.99', tax: 2.5 };
   * Arr.float(data, 'price'); // 19.99
   * Arr.float(data, 'tax'); // 2.5
   * Arr.float(data, 'discount', 0.0); // 0.0
   * ```
   */
  float(array: any, key: string | number | null, defaultValue?: number | null): number;

  /**
   * Remove one or many array items from an array using dot notation.
   *
   * This method removes items from an array or object by their keys,
   * modifying the original array in place. Supports dot notation for
   * nested key removal.
   *
   * Parameters:
   *   - array: The array or object to modify (passed by reference).
   *   - keys: Single key or array of keys to remove.
   *
   * Returns:
   *   - void: The array is modified in place.
   *
   * @example
   * ```typescript
   * const data = { a: 1, b: 2, c: 3 };
   * Arr.forget(data, 'b');
   * // data is now { a: 1, c: 3 }
   *
   * const nested = { user: { name: 'John', age: 30 } };
   * Arr.forget(nested, 'user.age');
   * // nested is now { user: { name: 'John' } }
   * ```
   */
  forget(array: any, keys: string | number | (string | number)[]): void;

  /**
   * Convert the given items to an array.
   *
   * This method converts various types of values into arrays.
   * Handles iterables, array-like objects, and single values.
   *
   * Parameters:
   *   - items: The value(s) to convert to an array.
   *
   * Returns:
   *   - any[]: The converted array.
   *
   * @example
   * ```typescript
   * Arr.from('hello'); // ['hello']
   * Arr.from([1, 2, 3]); // [1, 2, 3]
   * Arr.from(new Set([1, 2, 3])); // [1, 2, 3]
   * Arr.from({ a: 1, b: 2 }); // [{ a: 1, b: 2 }]
   * ```
   */
  from(items: any): any[];

  /**
   * Get an item from an array using dot notation.
   *
   * This method retrieves a value from a nested array or object structure
   * using dot notation for the key path. Returns the default value if the
   * key path doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key path in dot notation.
   *   - defaultValue: Optional default value if key doesn't exist.
   *
   * Returns:
   *   - any: The value at the key path, or default value.
   *
   * @example
   * ```typescript
   * const data = { user: { profile: { name: 'John' } } };
   * Arr.get(data, 'user.profile.name'); // 'John'
   * Arr.get(data, 'user.email', 'N/A'); // 'N/A'
   * ```
   */
  get(array: any, key: string | number | null, defaultValue?: any): any;

  /**
   * Check if an item or items exist in an array using dot notation.
   *
   * This method checks whether one or more keys exist in an array or object.
   * Returns true only if at least one of the provided keys exists.
   *
   * Parameters:
   *   - array: The array or object to check.
   *   - keys: Single key or array of keys to check.
   *
   * Returns:
   *   - boolean: True if at least one key exists, false otherwise.
   *
   * @example
   * ```typescript
   * const data = { a: 1, b: 2, c: 3 };
   * Arr.has(data, 'a'); // true
   * Arr.has(data, ['a', 'd']); // true (a exists)
   * Arr.has(data, ['x', 'y']); // false
   * ```
   */
  has(array: any, keys: string | number | (string | number)[]): boolean;

  /**
   * Check if all items exist in an array using dot notation.
   *
   * This method checks whether all provided keys exist in an array or object.
   * Returns true only if every single key exists.
   *
   * Parameters:
   *   - array: The array or object to check.
   *   - keys: Array of keys that must all exist.
   *
   * Returns:
   *   - boolean: True if all keys exist, false otherwise.
   *
   * @example
   * ```typescript
   * const data = { a: 1, b: 2, c: 3 };
   * Arr.hasAll(data, ['a', 'b']); // true
   * Arr.hasAll(data, ['a', 'b', 'd']); // false
   * ```
   */
  hasAll(array: any, keys: (string | number)[]): boolean;

  /**
   * Check if any of the items exist in an array using dot notation.
   *
   * This method checks whether at least one of the provided keys exists
   * in an array or object. Returns true if any key is found.
   *
   * Parameters:
   *   - array: The array or object to check.
   *   - keys: Array of keys to check.
   *
   * Returns:
   *   - boolean: True if any key exists, false if none exist.
   *
   * @example
   * ```typescript
   * const data = { a: 1, b: 2 };
   * Arr.hasAny(data, ['a', 'x', 'y']); // true (a exists)
   * Arr.hasAny(data, ['x', 'y', 'z']); // false
   * ```
   */
  hasAny(array: any, keys: (string | number)[]): boolean;

  /**
   * Determine if all items in the array pass the given truth test.
   *
   * This method tests whether all elements in the array satisfy the provided
   * callback function. Returns true only if the callback returns true for
   * every element.
   *
   * Parameters:
   *   - array: The array to test.
   *   - callback: Predicate function to test each element.
   *
   * Returns:
   *   - boolean: True if all elements pass the test, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.every([2, 4, 6, 8], n => n % 2 === 0); // true
   * Arr.every([2, 3, 4], n => n % 2 === 0); // false
   * ```
   */
  every<T = any>(array: T[], callback: (item: T, index: number) => boolean): boolean;

  /**
   * Determine if any items in the array pass the given truth test.
   *
   * This method tests whether at least one element in the array satisfies
   * the provided callback function. Returns true if any element passes.
   *
   * Parameters:
   *   - array: The array to test.
   *   - callback: Predicate function to test each element.
   *
   * Returns:
   *   - boolean: True if any element passes the test, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.some([1, 2, 3, 4], n => n > 3); // true
   * Arr.some([1, 2, 3], n => n > 5); // false
   * ```
   */
  some<T = any>(array: T[], callback: (item: T, index: number) => boolean): boolean;

  /**
   * Get an integer value from an array or object.
   *
   * This method retrieves a value and converts it to an integer.
   * Supports dot notation for nested access. Returns the default integer
   * value if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key to retrieve (supports dot notation).
   *   - defaultValue: Optional default integer value if key doesn't exist.
   *
   * Returns:
   *   - number: The integer value at the key, or default value.
   *
   * @example
   * ```typescript
   * const data = { count: '42', total: 100.5 };
   * Arr.integer(data, 'count'); // 42
   * Arr.integer(data, 'total'); // 100 (truncated)
   * Arr.integer(data, 'missing', 0); // 0
   * ```
   */
  integer(array: any, key: string | number | null, defaultValue?: number | null): number;

  /**
   * Determine if an array is associative.
   *
   * This method checks whether an array is associative (has string keys)
   * rather than a sequential numeric array. In JavaScript, this typically
   * means checking if it's an object rather than an array.
   *
   * Parameters:
   *   - array: The array to check.
   *
   * Returns:
   *   - boolean: True if the array is associative, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.isAssoc({ a: 1, b: 2 }); // true
   * Arr.isAssoc([1, 2, 3]); // false
   * Arr.isAssoc({ 0: 'a', 1: 'b' }); // true (object with numeric keys)
   * ```
   */
  isAssoc(array: any): boolean;

  /**
   * Determine if an array is a list with sequential numeric keys.
   *
   * This method checks whether an array is a true sequential list
   * (standard array) with numeric keys starting from 0.
   *
   * Parameters:
   *   - array: The array to check.
   *
   * Returns:
   *   - boolean: True if the array is a sequential list, false otherwise.
   *
   * @example
   * ```typescript
   * Arr.isList([1, 2, 3]); // true
   * Arr.isList({ 0: 'a', 1: 'b' }); // false (object)
   * Arr.isList({ a: 1, b: 2 }); // false
   * ```
   */
  isList(array: any): boolean;

  /**
   * Join all values of an array with a glue string.
   *
   * This method concatenates all array elements into a string using the
   * specified glue. Optionally uses a different glue for the final join.
   *
   * Parameters:
   *   - array: The array to join.
   *   - glue: The string to use between elements.
   *   - finalGlue: Optional different string for the last join.
   *
   * Returns:
   *   - string: The joined string.
   *
   * @example
   * ```typescript
   * Arr.join(['a', 'b', 'c'], ', '); // 'a, b, c'
   * Arr.join(['a', 'b', 'c'], ', ', ' and '); // 'a, b and c'
   * Arr.join([1, 2, 3], '-'); // '1-2-3'
   * ```
   */
  join(array: any[], glue: string, finalGlue?: string): string;

  /**
   * Key an array by the given key.
   *
   * This method creates an object where the keys are derived from the specified
   * property of each array element. The values are the elements themselves.
   *
   * Parameters:
   *   - array: The array to key.
   *   - keyBy: The property name or callback to determine keys.
   *
   * Returns:
   *   - Record<string, any>: An object keyed by the specified property.
   *
   * @example
   * ```typescript
   * const users = [
   *   { id: 1, name: 'John' },
   *   { id: 2, name: 'Jane' }
   * ];
   * Arr.keyBy(users, 'id');
   * // { 1: { id: 1, name: 'John' }, 2: { id: 2, name: 'Jane' } }
   * ```
   */
  keyBy(array: any[], keyBy: string | ((item: any) => string | number)): Record<string, any>;

  /**
   * Prepend a string to all keys in an array.
   *
   * This method adds a prefix to all keys in an object or array,
   * creating a new object with the modified keys.
   *
   * Parameters:
   *   - array: The array or object to modify.
   *   - prependWith: The string to prepend to each key.
   *
   * Returns:
   *   - Record<string, any>: A new object with prepended keys.
   *
   * @example
   * ```typescript
   * Arr.prependKeysWith({ a: 1, b: 2 }, 'prefix_');
   * // { prefix_a: 1, prefix_b: 2 }
   * ```
   */
  prependKeysWith(array: any, prependWith: string): Record<string, any>;

  /**
   * Get a subset of the items from the given array.
   *
   * This method returns a new array or object containing only the items
   * with the specified keys. This is the opposite of except().
   *
   * Parameters:
   *   - array: The source array or object.
   *   - keys: Single key or array of keys to include.
   *
   * Returns:
   *   - any: A new array or object with only the specified keys.
   *
   * @example
   * ```typescript
   * Arr.only({ a: 1, b: 2, c: 3 }, ['a', 'c']);
   * // { a: 1, c: 3 }
   *
   * const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
   * Arr.only(user, ['id', 'name', 'email']);
   * // { id: 1, name: 'John', email: 'john@example.com' }
   * ```
   */
  only(array: any, keys: string | number | (string | number)[]): any;

  /**
   * Alias for the only method.
   *
   * This method is an alias for only(), providing an alternative name
   * that may be more intuitive in certain contexts.
   *
   * Parameters:
   *   - array: The source array or object.
   *   - keys: Single key or array of keys to select.
   *
   * Returns:
   *   - any: A new array or object with only the specified keys.
   *
   * @see only
   */
  select(array: any, keys: string | number | (string | number)[]): any;

  /**
   * Pluck an array of values from an array.
   *
   * This method extracts a single property from each element in an array.
   * Optionally, you can specify a key to use for the resulting object.
   *
   * Parameters:
   *   - array: The array to pluck from.
   *   - value: The property name to extract.
   *   - key: Optional property name to use as keys in result.
   *
   * Returns:
   *   - any[] | Record<string, any>: Array of values or keyed object.
   *
   * @example
   * ```typescript
   * const users = [
   *   { id: 1, name: 'John' },
   *   { id: 2, name: 'Jane' }
   * ];
   * Arr.pluck(users, 'name'); // ['John', 'Jane']
   * Arr.pluck(users, 'name', 'id'); // { 1: 'John', 2: 'Jane' }
   * ```
   */
  pluck(array: any[], value: string, key?: string | null): any[] | Record<string, any>;

  /**
   * Run a map over each of the items in the array.
   *
   * This method transforms each element in the array using the provided
   * callback function, returning a new array with the transformed values.
   *
   * Parameters:
   *   - array: The array to map over.
   *   - callback: Function to transform each element.
   *
   * Returns:
   *   - any[]: A new array with transformed elements.
   *
   * @example
   * ```typescript
   * Arr.map([1, 2, 3], n => n * 2); // [2, 4, 6]
   * Arr.map(['a', 'b'], (s, i) => s + i); // ['a0', 'b1']
   * ```
   */
  map<T = any, U = any>(array: T[], callback: (item: T, index: number) => U): U[];

  /**
   * Run a map over each of the items and return key-value pairs.
   *
   * This method transforms each element into a key-value pair using the
   * callback function. The callback should return a tuple [key, value].
   *
   * Parameters:
   *   - array: The array to map over.
   *   - callback: Function that returns [key, value] tuples.
   *
   * Returns:
   *   - Record<string, any>: An object with the mapped key-value pairs.
   *
   * @example
   * ```typescript
   * const users = [
   *   { id: 1, name: 'John' },
   *   { id: 2, name: 'Jane' }
   * ];
   * Arr.mapWithKeys(users, u => [u.id, u.name]);
   * // { 1: 'John', 2: 'Jane' }
   * ```
   */
  mapWithKeys<T = any>(
    array: T[],
    callback: (item: T, index: number) => [string | number, any]
  ): Record<string, any>;

  /**
   * Run a map over each nested array and spread the results.
   *
   * This method is useful when array elements are themselves arrays,
   * and you want to spread those elements as separate arguments to
   * the callback function.
   *
   * Parameters:
   *   - array: The array of arrays to map over.
   *   - callback: Function that receives spread array elements.
   *
   * Returns:
   *   - any[]: A new array with mapped results.
   *
   * @example
   * ```typescript
   * const pairs = [['John', 30], ['Jane', 25]];
   * Arr.mapSpread(pairs, (name, age) => `${name} is ${age}`);
   * // ['John is 30', 'Jane is 25']
   * ```
   */
  mapSpread<T = any>(array: any[][], callback: (...args: any[]) => T): T[];

  /**
   * Prepend a value to the beginning of an array.
   *
   * This method adds one or more values to the start of an array.
   * Optionally, you can specify a key for object structures.
   *
   * Parameters:
   *   - array: The array to prepend to.
   *   - value: The value to prepend.
   *   - key: Optional key for the prepended value.
   *
   * Returns:
   *   - any: The array with the prepended value.
   *
   * @example
   * ```typescript
   * Arr.prepend([2, 3, 4], 1); // [1, 2, 3, 4]
   * Arr.prepend({ b: 2 }, 1, 'a'); // { a: 1, b: 2 }
   * ```
   */
  prepend(array: any, value: any, key?: string | number | null): any;

  /**
   * Remove and return an item from an array.
   *
   * This method removes an item from the array by its key and returns
   * the removed value. The original array is modified. Returns the
   * default value if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array to pull from (modified in place).
   *   - key: The key of the item to remove.
   *   - defaultValue: Optional default if key doesn't exist.
   *
   * Returns:
   *   - any: The removed value or default value.
   *
   * @example
   * ```typescript
   * const data = { a: 1, b: 2, c: 3 };
   * const value = Arr.pull(data, 'b'); // 2
   * // data is now { a: 1, c: 3 }
   * ```
   */
  pull(array: any, key: string | number, defaultValue?: any): any;

  /**
   * Convert the array into a query string.
   *
   * This method converts an object or array into a URL query string format,
   * properly encoding keys and values for use in URLs.
   *
   * Parameters:
   *   - array: The array or object to convert.
   *
   * Returns:
   *   - string: The URL-encoded query string.
   *
   * @example
   * ```typescript
   * Arr.query({ name: 'John', age: 30 });
   * // 'name=John&age=30'
   *
   * Arr.query({ search: 'hello world', page: 1 });
   * // 'search=hello%20world&page=1'
   * ```
   */
  query(array: any): string;

  /**
   * Get one or more random values from an array.
   *
   * This method returns random element(s) from the array. If number is
   * specified, returns that many random elements. The preserveKeys option
   * maintains the original array keys in the result.
   *
   * Parameters:
   *   - array: The array to pick from.
   *   - number: Optional number of items to pick.
   *   - preserveKeys: Whether to preserve original keys.
   *
   * Returns:
   *   - any | any[]: Single value or array of random values.
   *
   * @example
   * ```typescript
   * Arr.random([1, 2, 3, 4, 5]); // 3 (random single value)
   * Arr.random([1, 2, 3, 4, 5], 2); // [2, 5] (random pair)
   * ```
   */
  random<T = any>(array: T[], number?: number | null, preserveKeys?: boolean): T | T[];

  /**
   * Set an array item to a given value using dot notation.
   *
   * This method sets a value in a nested array or object structure using
   * dot notation for the key path. Creates intermediate structures as needed.
   * The original array is modified in place.
   *
   * Parameters:
   *   - array: The array or object to modify (modified in place).
   *   - key: The key path in dot notation.
   *   - value: The value to set.
   *
   * Returns:
   *   - any: The modified array or object.
   *
   * @example
   * ```typescript
   * const data = {};
   * Arr.set(data, 'user.profile.name', 'John');
   * // data is now { user: { profile: { name: 'John' } } }
   * ```
   */
  set(array: any, key: string | number | null, value: any): any;

  /**
   * Push one or more values onto the end of an array.
   *
   * This method adds one or more values to the end of an array at the
   * specified key location. Supports dot notation for nested arrays.
   *
   * Parameters:
   *   - array: The array to push to (modified in place).
   *   - key: The key where to push values (supports dot notation).
   *   - values: One or more values to push.
   *
   * Returns:
   *   - any: The modified array.
   *
   * @example
   * ```typescript
   * const data = { items: [1, 2] };
   * Arr.push(data, 'items', 3, 4);
   * // data is now { items: [1, 2, 3, 4] }
   * ```
   */
  push(array: any, key: string | number | null, ...values: any[]): any;

  /**
   * Shuffle the given array and return the result.
   *
   * This method randomly reorders the elements in an array,
   * returning a new shuffled array without modifying the original.
   *
   * Parameters:
   *   - array: The array to shuffle.
   *
   * Returns:
   *   - any[]: A new shuffled array.
   *
   * @example
   * ```typescript
   * Arr.shuffle([1, 2, 3, 4, 5]);
   * // [3, 1, 5, 2, 4] (random order)
   * ```
   */
  shuffle<T = any>(array: T[]): T[];

  /**
   * Get the sole item that passes a given truth test.
   *
   * This method returns the only element that satisfies the callback.
   * Throws an error if zero or multiple elements match, ensuring
   * exactly one match exists.
   *
   * Parameters:
   *   - array: The array to search.
   *   - callback: Optional predicate function to test elements.
   *
   * Returns:
   *   - any: The sole matching element.
   *
   * @throws Error if zero or multiple elements match.
   *
   * @example
   * ```typescript
   * Arr.sole([1, 2, 3], n => n === 2); // 2
   * Arr.sole([1, 2, 3], n => n > 1); // Error: multiple matches
   * Arr.sole([1, 2, 3], n => n > 5); // Error: no matches
   * ```
   */
  sole<T = any>(array: T[], callback?: ((item: T, index: number) => boolean) | null): T;

  /**
   * Sort the given array.
   *
   * This method sorts an array using an optional comparison callback.
   * If no callback is provided, sorts in ascending order using default
   * comparison.
   *
   * Parameters:
   *   - array: The array to sort.
   *   - callback: Optional comparison function.
   *
   * Returns:
   *   - any[]: A new sorted array.
   *
   * @example
   * ```typescript
   * Arr.sort([3, 1, 4, 1, 5]); // [1, 1, 3, 4, 5]
   * Arr.sort(['c', 'a', 'b']); // ['a', 'b', 'c']
   * Arr.sort([3, 1, 2], (a, b) => b - a); // [3, 2, 1]
   * ```
   */
  sort<T = any>(array: T[], callback?: ((a: T, b: T) => number) | null): T[];

  /**
   * Sort the given array in descending order.
   *
   * This method sorts an array in descending order using an optional
   * comparison callback.
   *
   * Parameters:
   *   - array: The array to sort.
   *   - callback: Optional comparison function.
   *
   * Returns:
   *   - any[]: A new sorted array in descending order.
   *
   * @example
   * ```typescript
   * Arr.sortDesc([1, 3, 2, 5, 4]); // [5, 4, 3, 2, 1]
   * Arr.sortDesc(['a', 'c', 'b']); // ['c', 'b', 'a']
   * ```
   */
  sortDesc<T = any>(array: T[], callback?: ((a: T, b: T) => number) | null): T[];

  /**
   * Recursively sort an array by keys and values.
   *
   * This method sorts an array or object recursively, sorting both
   * the keys and any nested structures.
   *
   * Parameters:
   *   - array: The array or object to sort recursively.
   *   - options: Sort options (SORT_REGULAR, etc.).
   *   - descending: Whether to sort in descending order.
   *
   * Returns:
   *   - any: The recursively sorted structure.
   *
   * @example
   * ```typescript
   * const data = { c: 3, a: { z: 1, x: 2 }, b: 2 };
   * Arr.sortRecursive(data);
   * // { a: { x: 2, z: 1 }, b: 2, c: 3 }
   * ```
   */
  sortRecursive(array: any, options?: number, descending?: boolean): any;

  /**
   * Recursively sort an array by keys and values in descending order.
   *
   * This method is a convenience wrapper for sortRecursive with
   * descending order enabled by default.
   *
   * Parameters:
   *   - array: The array or object to sort recursively.
   *   - options: Sort options.
   *
   * Returns:
   *   - any: The recursively sorted structure in descending order.
   *
   * @see sortRecursive
   */
  sortRecursiveDesc(array: any, options?: number): any;

  /**
   * Get a string value from an array or object.
   *
   * This method retrieves a value and converts it to a string.
   * Supports dot notation for nested access. Returns the default string
   * value if the key doesn't exist.
   *
   * Parameters:
   *   - array: The array or object to retrieve from.
   *   - key: The key to retrieve (supports dot notation).
   *   - defaultValue: Optional default string value if key doesn't exist.
   *
   * Returns:
   *   - string: The string value at the key, or default value.
   *
   * @example
   * ```typescript
   * const data = { name: 'John', age: 30 };
   * Arr.string(data, 'name'); // 'John'
   * Arr.string(data, 'age'); // '30'
   * Arr.string(data, 'email', 'N/A'); // 'N/A'
   * ```
   */
  string(array: any, key: string | number | null, defaultValue?: string | null): string;

  /**
   * Convert an array to CSS classes string.
   *
   * This method converts an array or object into a space-separated string
   * of CSS class names, filtering out falsy values.
   *
   * Parameters:
   *   - array: The array or object of class names.
   *
   * Returns:
   *   - string: A space-separated string of CSS classes.
   *
   * @example
   * ```typescript
   * Arr.toCssClasses(['btn', 'btn-primary', null, 'active']);
   * // 'btn btn-primary active'
   *
   * Arr.toCssClasses({ btn: true, 'btn-primary': true, disabled: false });
   * // 'btn btn-primary'
   * ```
   */
  toCssClasses(array: any): string;

  /**
   * Convert an array to CSS styles string.
   *
   * This method converts an object into a semicolon-separated string
   * of CSS style declarations.
   *
   * Parameters:
   *   - array: The object of CSS properties and values.
   *
   * Returns:
   *   - string: A semicolon-separated string of CSS styles.
   *
   * @example
   * ```typescript
   * Arr.toCssStyles({ color: 'red', 'font-size': '14px', display: 'block' });
   * // 'color: red; font-size: 14px; display: block'
   * ```
   */
  toCssStyles(array: Record<string, any>): string;

  /**
   * Filter the array using the given callback.
   *
   * This method returns a new array containing only the elements that
   * satisfy the provided callback function.
   *
   * Parameters:
   *   - array: The array to filter.
   *   - callback: Predicate function to test each element.
   *
   * Returns:
   *   - any[]: A new filtered array.
   *
   * @example
   * ```typescript
   * Arr.where([1, 2, 3, 4, 5], n => n > 2);
   * // [3, 4, 5]
   *
   * const users = [{ age: 25 }, { age: 30 }, { age: 20 }];
   * Arr.where(users, u => u.age >= 25);
   * // [{ age: 25 }, { age: 30 }]
   * ```
   */
  where<T = any>(array: T[], callback: (item: T, index: number) => boolean): T[];

  /**
   * Filter the array by rejecting items that pass the callback.
   *
   * This method is the inverse of where(). It returns a new array
   * containing only elements that do NOT satisfy the callback.
   *
   * Parameters:
   *   - array: The array to filter.
   *   - callback: Predicate function to test each element.
   *
   * Returns:
   *   - any[]: A new filtered array with rejected items removed.
   *
   * @example
   * ```typescript
   * Arr.reject([1, 2, 3, 4, 5], n => n > 2);
   * // [1, 2]
   *
   * const users = [{ active: true }, { active: false }];
   * Arr.reject(users, u => u.active);
   * // [{ active: false }]
   * ```
   */
  reject<T = any>(array: T[], callback: (item: T, index: number) => boolean): T[];

  /**
   * Partition the array into two arrays using the callback.
   *
   * This method splits an array into two arrays: one containing elements
   * that satisfy the callback, and another with elements that don't.
   *
   * Parameters:
   *   - array: The array to partition.
   *   - callback: Predicate function to test each element.
   *
   * Returns:
   *   - [any[], any[]]: A tuple of [passing, failing] arrays.
   *
   * @example
   * ```typescript
   * const [evens, odds] = Arr.partition([1, 2, 3, 4, 5], n => n % 2 === 0);
   * // evens: [2, 4]
   * // odds: [1, 3, 5]
   * ```
   */
  partition<T = any>(array: T[], callback: (item: T, index: number) => boolean): [T[], T[]];

  /**
   * Filter items where the value is not null.
   *
   * This method returns a new array with all null and undefined values
   * removed, keeping only truthy and defined values.
   *
   * Parameters:
   *   - array: The array to filter.
   *
   * Returns:
   *   - any[]: A new array without null or undefined values.
   *
   * @example
   * ```typescript
   * Arr.whereNotNull([1, null, 2, undefined, 3, 0, false]);
   * // [1, 2, 3, 0, false]
   * ```
   */
  whereNotNull<T = any>(array: T[]): T[];

  /**
   * Wrap the given value in an array if it's not already an array.
   *
   * This method ensures the returned value is always an array.
   * If the input is already an array, returns it unchanged.
   * Otherwise, wraps the value in a new array.
   *
   * Parameters:
   *   - value: The value to wrap.
   *
   * Returns:
   *   - any[]: The value wrapped in an array.
   *
   * @example
   * ```typescript
   * Arr.wrap([1, 2, 3]); // [1, 2, 3]
   * Arr.wrap('hello'); // ['hello']
   * Arr.wrap(42); // [42]
   * Arr.wrap(null); // [null]
   * ```
   */
  wrap(value: any): any[];
}

/**
 * Symbol namespace for IArr interface.
 *
 * This namespace exports a unique symbol identifier for the IArr interface,
 * which can be used for dependency injection, type checking, or as a unique
 * identifier in IoC containers.
 */
export namespace IArr {
  /**
   * Unique symbol identifier for the IArr interface.
   *
   * This symbol can be used as a key in dependency injection containers
   * or for runtime type identification.
   */
  export const $: unique symbol = Symbol('IArr');
}
