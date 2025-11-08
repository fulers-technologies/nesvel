/**
 * ICollection defines the contract for a collection wrapper
 * that provides Laravel-like collection methods for working with arrays and objects.
 *
 * This interface exposes all methods available in collect.js, providing a fluent,
 * chainable API for data manipulation and transformation operations.
 *
 * @template T - The type of items stored in the collection
 */
export interface ICollection<T = any> {
  /**
   * Get all items in the collection as an array or object.
   *
   * @returns The underlying array or object
   */
  all(): T[];

  /**
   * Calculate the average value of a given key or all numeric values.
   *
   * @param key - Optional key to calculate average for
   * @returns The average value
   */
  average(key?: string | ((item: T) => number)): number;

  /**
   * Alias for average method.
   *
   * @param key - Optional key to calculate average for
   * @returns The average value
   */
  avg(key?: string | ((item: T) => number)): number;

  /**
   * Break the collection into multiple smaller collections of a given size.
   *
   * @param size - The size of each chunk
   * @returns A new collection of chunked items
   */
  chunk(size: number): ICollection<T[]>;

  /**
   * Collapse a collection of arrays into a single, flat collection.
   *
   * @returns A new flattened collection
   */
  collapse(): ICollection<any>;

  /**
   * Combine the collection keys with another array of values.
   *
   * @param values - Array of values to combine with keys
   * @returns A new collection with combined keys and values
   */
  combine(values: any[]): ICollection<any>;

  /**
   * Concatenate the given array or collection values onto the end of the collection.
   *
   * @param source - Array or collection to concatenate
   * @returns A new collection with concatenated values
   */
  concat(source: any[] | ICollection<any>): ICollection<T>;

  /**
   * Determine whether the collection contains a given item.
   *
   * @param key - Key or callback function to check
   * @param value - Optional value to compare
   * @returns True if the item exists, false otherwise
   */
  contains(key: string | ((item: T) => boolean), value?: any): boolean;

  /**
   * Determine if the collection contains only a single item.
   *
   * @returns True if collection has exactly one item
   */
  containsOneItem(): boolean;

  /**
   * Count the number of items in the collection.
   *
   * @returns The number of items
   */
  count(): number;

  /**
   * Count the occurrences of values in the collection.
   *
   * @param callback - Optional callback to determine the value to count by
   * @returns A new collection with counted values
   */
  countBy(callback?: string | ((item: T) => any)): ICollection<any>;

  /**
   * Cross join the given arrays, returning all possible permutations.
   *
   * @param arrays - Arrays to cross join
   * @returns A new collection of cross-joined items
   */
  crossJoin(...arrays: any[][]): ICollection<any[]>;

  /**
   * Dump the collection items and end the script (die and dump).
   *
   * @returns void
   */
  dd(): void;

  /**
   * Get the items that are not present in the given items.
   *
   * @param values - Values to diff against
   * @returns A new collection with different items
   */
  diff(values: any[] | ICollection<any>): ICollection<T>;

  /**
   * Get the items whose keys and values are not present in the given items.
   *
   * @param values - Values to diff against
   * @returns A new collection with different items
   */
  diffAssoc(values: any[] | ICollection<any>): ICollection<T>;

  /**
   * Get the items whose keys are not present in the given items.
   *
   * @param values - Values to diff against
   * @returns A new collection with different keys
   */
  diffKeys(values: any[] | ICollection<any>): ICollection<T>;

  /**
   * Get the items that are not present using a callback comparison.
   *
   * @param values - Values to diff against
   * @param callback - Comparison callback
   * @returns A new collection with different items
   */
  diffUsing(values: any[] | ICollection<any>, callback: (a: any, b: any) => number): ICollection<T>;

  /**
   * Determine whether the collection does not contain a given item.
   *
   * @param key - Key or callback function to check
   * @param value - Optional value to compare
   * @returns True if the item does not exist
   */
  doesntContain(key: string | ((item: T) => boolean), value?: any): boolean;

  /**
   * Dump the collection items to the console.
   *
   * @returns The collection instance for chaining
   */
  dump(): this;

  /**
   * Retrieve duplicate items from the collection.
   *
   * @param key - Optional key or callback to determine duplicates
   * @returns A new collection of duplicate items
   */
  duplicates(key?: string | ((item: T) => any)): ICollection<T>;

  /**
   * Iterate over the items in the collection.
   *
   * @param callback - Function to execute for each item
   * @returns The collection instance for chaining
   */
  each(callback: (item: T, key: number | string) => void | boolean): this;

  /**
   * Iterate over the items and pass each nested item to the callback.
   *
   * @param callback - Function to execute for each spread item
   * @returns The collection instance for chaining
   */
  eachSpread(callback: (...args: any[]) => void | boolean): this;

  /**
   * Verify that all items pass the given truth test.
   *
   * @param callback - Truth test function
   * @returns True if all items pass the test
   */
  every(callback: (item: T, key: number | string) => boolean): boolean;

  /**
   * Get all items except for those with the specified keys.
   *
   * @param keys - Keys to exclude
   * @returns A new collection without specified keys
   */
  except(...keys: (string | number)[]): ICollection<T>;

  /**
   * Filter the collection using the given callback.
   *
   * @param callback - Filter function
   * @returns A new filtered collection
   */
  filter(callback?: (item: T, key: number | string) => boolean): ICollection<T>;

  /**
   * Get the first item from the collection.
   *
   * @param callback - Optional filter callback
   * @param defaultValue - Default value if no item found
   * @returns The first item or default value
   */
  first(
    callback?: ((item: T, key: number | string) => boolean) | null,
    defaultValue?: any
  ): T | undefined;

  /**
   * Get the first item or throw an exception.
   *
   * @param callback - Optional filter callback
   * @returns The first item
   * @throws Error if no item found
   */
  firstOrFail(callback?: (item: T, key: number | string) => boolean): T;

  /**
   * Get the first item by the given key value pair.
   *
   * @param key - Key to search
   * @param operator - Comparison operator
   * @param value - Value to compare
   * @returns The first matching item
   */
  firstWhere(key: string, operator?: any, value?: any): T | undefined;

  /**
   * Map a callback over each item and flatten the result by one level.
   *
   * @param callback - Mapping function
   * @returns A new flattened collection
   */
  flatMap(callback: (item: T, key: number | string) => any): ICollection<any>;

  /**
   * Flatten a multi-dimensional collection into a single dimension.
   *
   * @param depth - Depth to flatten (default: Infinity)
   * @returns A new flattened collection
   */
  flatten(depth?: number): ICollection<any>;

  /**
   * Flip the items in the collection (swap keys with values).
   *
   * @returns A new collection with flipped items
   */
  flip(): ICollection<any>;

  /**
   * Get a paginated slice of the collection.
   *
   * @param page - Page number
   * @param perPage - Items per page
   * @returns A new collection with paginated items
   */
  forPage(page: number, perPage: number): ICollection<T>;

  /**
   * Remove an item from the collection by key.
   *
   * @param key - Key to remove
   * @returns The collection instance for chaining
   */
  forget(key: string | number): this;

  /**
   * Get an item from the collection by key.
   *
   * @param key - Key to retrieve
   * @param defaultValue - Default value if key not found
   * @returns The item value or default
   */
  get(key: string | number, defaultValue?: any): any;

  /**
   * Group the collection items by a given key.
   *
   * @param key - Key or callback to group by
   * @returns A new grouped collection
   */
  groupBy(key: string | ((item: T) => any)): ICollection<any>;

  /**
   * Determine if an item exists in the collection by key.
   *
   * @param key - Key to check
   * @returns True if key exists
   */
  has(key: string | number): boolean;

  /**
   * Concatenate values of a given key as a string.
   *
   * @param key - Key to implode
   * @param glue - String to join with
   * @returns Imploded string
   */
  implode(key: string, glue?: string): string;

  /**
   * Intersect the collection with the given items.
   *
   * @param values - Values to intersect with
   * @returns A new collection with intersected items
   */
  intersect(values: any[] | ICollection<any>): ICollection<T>;

  /**
   * Intersect the collection with the given items by keys.
   *
   * @param values - Values to intersect with
   * @returns A new collection with intersected items
   */
  intersectByKeys(values: any[] | ICollection<any>): ICollection<T>;

  /**
   * Determine if the collection is empty.
   *
   * @returns True if collection is empty
   */
  isEmpty(): boolean;

  /**
   * Determine if the collection is not empty.
   *
   * @returns True if collection is not empty
   */
  isNotEmpty(): boolean;

  /**
   * Join all items from the collection using a string.
   *
   * @param glue - String to join with
   * @param finalGlue - Optional final glue for last item
   * @returns Joined string
   */
  join(glue: string, finalGlue?: string): string;

  /**
   * Key the collection by the given key.
   *
   * @param key - Key or callback to key by
   * @returns A new keyed collection
   */
  keyBy(key: string | ((item: T) => any)): ICollection<any>;

  /**
   * Get the keys of the collection items.
   *
   * @returns A new collection of keys
   */
  keys(): ICollection<string | number>;

  /**
   * Get the last item from the collection.
   *
   * @param callback - Optional filter callback
   * @param defaultValue - Default value if no item found
   * @returns The last item or default value
   */
  last(
    callback?: ((item: T, key: number | string) => boolean) | null,
    defaultValue?: any
  ): T | undefined;

  /**
   * Register a custom macro.
   *
   * @param name - Macro name
   * @param callback - Macro function
   * @returns void
   */
  macro(name: string, callback: Function): void;

  /**
   * Create a new collection instance (static method exposed as instance method).
   *
   * @param items - Items to create collection from
   * @returns A new collection instance
   */
  make(items?: any): ICollection<any>;

  /**
   * Map a callback over each item in the collection.
   *
   * @param callback - Mapping function
   * @returns A new mapped collection
   */
  map<U>(callback: (item: T, key: number | string) => U): ICollection<U>;

  /**
   * Map a callback over each nested item and spread the result.
   *
   * @param callback - Mapping function
   * @returns A new mapped collection
   */
  mapSpread(callback: (...args: any[]) => any): ICollection<any>;

  /**
   * Map items to a dictionary (grouped by key).
   *
   * @param callback - Mapping function
   * @returns A new collection dictionary
   */
  mapToDictionary(callback: (item: T, key: number | string) => [any, any]): ICollection<any>;

  /**
   * Map items into a new class instance.
   *
   * @param ClassName - Class constructor
   * @returns A new collection of class instances
   */
  mapInto(ClassName: new (...args: any[]) => any): ICollection<any>;

  /**
   * Map items to groups.
   *
   * @param callback - Grouping function
   * @returns A new grouped collection
   */
  mapToGroups(callback: (item: T, key: number | string) => [any, any]): ICollection<any>;

  /**
   * Map items with keys.
   *
   * @param callback - Mapping function that returns [key, value]
   * @returns A new collection with mapped keys
   */
  mapWithKeys(callback: (item: T, key: number | string) => [any, any]): ICollection<any>;

  /**
   * Get the maximum value of a given key.
   *
   * @param key - Optional key to get max from
   * @returns The maximum value
   */
  max(key?: string | ((item: T) => number)): number;

  /**
   * Get the median value of a given key.
   *
   * @param key - Optional key to get median from
   * @returns The median value
   */
  median(key?: string | ((item: T) => number)): number;

  /**
   * Merge the collection with the given items.
   *
   * @param items - Items to merge
   * @returns A new merged collection
   */
  merge(items: any[] | ICollection<any> | object): ICollection<any>;

  /**
   * Recursively merge the collection with the given items.
   *
   * @param items - Items to merge recursively
   * @returns A new merged collection
   */
  mergeRecursive(items: any[] | ICollection<any> | object): ICollection<any>;

  /**
   * Get the minimum value of a given key.
   *
   * @param key - Optional key to get min from
   * @returns The minimum value
   */
  min(key?: string | ((item: T) => number)): number;

  /**
   * Get the mode value of a given key.
   *
   * @param key - Optional key to get mode from
   * @returns The mode value(s)
   */
  mode(key?: string | ((item: T) => number)): ICollection<number>;

  /**
   * Get every nth item from the collection.
   *
   * @param step - Step size
   * @param offset - Starting offset
   * @returns A new collection with every nth item
   */
  nth(step: number, offset?: number): ICollection<T>;

  /**
   * Get the items with the specified keys.
   *
   * @param keys - Keys to include
   * @returns A new collection with only specified keys
   */
  only(...keys: (string | number)[]): ICollection<T>;

  /**
   * Pad the collection to the specified length with a value.
   *
   * @param size - Target size
   * @param value - Value to pad with
   * @returns A new padded collection
   */
  pad(size: number, value: any): ICollection<T>;

  /**
   * Partition the collection into two arrays using the given callback.
   *
   * @param callback - Partitioning function
   * @returns Array of two collections [passing, failing]
   */
  partition(callback: (item: T, key: number | string) => boolean): [ICollection<T>, ICollection<T>];

  /**
   * Pass the collection to the given callback and return the result.
   *
   * @param callback - Pipe function
   * @returns The result of the callback
   */
  pipe<U>(callback: (collection: this) => U): U;

  /**
   * Get the values of a given key.
   *
   * @param key - Key to pluck
   * @param keyBy - Optional key to key the results by
   * @returns A new collection of plucked values
   */
  pluck(key: string, keyBy?: string): ICollection<any>;

  /**
   * Remove and return the last item from the collection.
   *
   * @returns The last item
   */
  pop(): T | undefined;

  /**
   * Prepend an item to the beginning of the collection.
   *
   * @param value - Value to prepend
   * @param key - Optional key for the value
   * @returns The collection instance for chaining
   */
  prepend(value: any, key?: string | number): this;

  /**
   * Remove and return an item from the collection by key.
   *
   * @param key - Key to pull
   * @param defaultValue - Default value if key not found
   * @returns The pulled value
   */
  pull(key: string | number, defaultValue?: any): any;

  /**
   * Push an item onto the end of the collection.
   *
   * @param value - Value to push
   * @returns The collection instance for chaining
   */
  push(value: any): this;

  /**
   * Put an item in the collection by key.
   *
   * @param key - Key to put
   * @param value - Value to put
   * @returns The collection instance for chaining
   */
  put(key: string | number, value: any): this;

  /**
   * Get one or more items randomly from the collection.
   *
   * @param count - Optional number of items to get
   * @returns Random item(s)
   */
  random(count?: number): T | ICollection<T>;

  /**
   * Reduce the collection to a single value.
   *
   * @param callback - Reducer function
   * @param initial - Initial value
   * @returns The reduced value
   */
  reduce<U>(callback: (carry: U, item: T, key: number | string) => U, initial: U): U;

  /**
   * Filter items by rejecting those that pass the given truth test.
   *
   * @param callback - Rejection function
   * @returns A new filtered collection
   */
  reject(callback: (item: T, key: number | string) => boolean): ICollection<T>;

  /**
   * Replace the collection items with the given items.
   *
   * @param items - Items to replace with
   * @returns A new collection with replaced items
   */
  replace(items: any[] | ICollection<any> | object): ICollection<any>;

  /**
   * Recursively replace the collection items with the given items.
   *
   * @param items - Items to replace with recursively
   * @returns A new collection with replaced items
   */
  replaceRecursive(items: any[] | ICollection<any> | object): ICollection<any>;

  /**
   * Reverse the order of items in the collection.
   *
   * @returns A new reversed collection
   */
  reverse(): ICollection<T>;

  /**
   * Search the collection for a given value and return the key.
   *
   * @param value - Value or callback to search for
   * @returns The key of the found item or false
   */
  search(value: any | ((item: T, key: number | string) => boolean)): number | string | false;

  /**
   * Remove and return the first item from the collection.
   *
   * @returns The first item
   */
  shift(): T | undefined;

  /**
   * Shuffle the items in the collection.
   *
   * @returns A new shuffled collection
   */
  shuffle(): ICollection<T>;

  /**
   * Skip the first n items.
   *
   * @param count - Number of items to skip
   * @returns A new collection without the first n items
   */
  skip(count: number): ICollection<T>;

  /**
   * Skip items until the given callback returns true.
   *
   * @param value - Value or callback to skip until
   * @returns A new collection starting from where callback returns true
   */
  skipUntil(value: any | ((item: T, key: number | string) => boolean)): ICollection<T>;

  /**
   * Skip items while the given callback returns true.
   *
   * @param callback - Callback to skip while true
   * @returns A new collection starting from where callback returns false
   */
  skipWhile(callback: (item: T, key: number | string) => boolean): ICollection<T>;

  /**
   * Get a slice of the collection.
   *
   * @param start - Start index
   * @param end - Optional end index
   * @returns A new sliced collection
   */
  slice(start: number, end?: number): ICollection<T>;

  /**
   * Get the sole item that passes the given truth test.
   *
   * @param key - Optional key or callback
   * @param operator - Optional operator
   * @param value - Optional value
   * @returns The sole item
   * @throws Error if zero or multiple items found
   */
  sole(key?: string | ((item: T) => boolean), operator?: any, value?: any): T;

  /**
   * Alias for contains method.
   *
   * @param key - Key or callback function to check
   * @param value - Optional value to compare
   * @returns True if the item exists
   */
  some(key: string | ((item: T) => boolean), value?: any): boolean;

  /**
   * Sort the collection items.
   *
   * @param callback - Optional comparison function
   * @returns A new sorted collection
   */
  sort(callback?: (a: T, b: T) => number): ICollection<T>;

  /**
   * Sort the collection in descending order.
   *
   * @param callback - Optional comparison function
   * @returns A new sorted collection
   */
  sortDesc(callback?: (a: T, b: T) => number): ICollection<T>;

  /**
   * Sort the collection by a given key.
   *
   * @param key - Key or callback to sort by
   * @returns A new sorted collection
   */
  sortBy(key: string | ((item: T) => any)): ICollection<T>;

  /**
   * Sort the collection by a given key in descending order.
   *
   * @param key - Key or callback to sort by
   * @returns A new sorted collection
   */
  sortByDesc(key: string | ((item: T) => any)): ICollection<T>;

  /**
   * Sort the collection keys.
   *
   * @returns A new collection with sorted keys
   */
  sortKeys(): ICollection<T>;

  /**
   * Sort the collection keys in descending order.
   *
   * @returns A new collection with sorted keys
   */
  sortKeysDesc(): ICollection<T>;

  /**
   * Splice a portion of the collection.
   *
   * @param start - Start index
   * @param deleteCount - Number of items to delete
   * @param items - Items to insert
   * @returns A new collection of removed items
   */
  splice(start: number, deleteCount?: number, ...items: any[]): ICollection<T>;

  /**
   * Split the collection into a number of groups.
   *
   * @param numberOfGroups - Number of groups to split into
   * @returns A new collection of groups
   */
  split(numberOfGroups: number): ICollection<ICollection<T>>;

  /**
   * Get the sum of the given values.
   *
   * @param key - Optional key or callback to sum
   * @returns The sum
   */
  sum(key?: string | ((item: T) => number)): number;

  /**
   * Take the first or last n items.
   *
   * @param count - Number of items to take (negative for last n)
   * @returns A new collection with taken items
   */
  take(count: number): ICollection<T>;

  /**
   * Take items until the given callback returns true.
   *
   * @param value - Value or callback to take until
   * @returns A new collection up to where callback returns true
   */
  takeUntil(value: any | ((item: T, key: number | string) => boolean)): ICollection<T>;

  /**
   * Take items while the given callback returns true.
   *
   * @param callback - Callback to take while true
   * @returns A new collection while callback returns true
   */
  takeWhile(callback: (item: T, key: number | string) => boolean): ICollection<T>;

  /**
   * Pass the collection to the given callback and then return it.
   *
   * @param callback - Tap function
   * @returns The collection instance for chaining
   */
  tap(callback: (collection: this) => void): this;

  /**
   * Create a new collection by invoking the callback a given number of times.
   *
   * @param count - Number of times to invoke
   * @param callback - Callback function
   * @returns A new collection
   */
  times(count: number, callback: (index: number) => any): ICollection<any>;

  /**
   * Get the collection as a plain array.
   *
   * @returns Array representation
   */
  toArray(): any[];

  /**
   * Get the collection as JSON.
   *
   * @returns JSON string representation
   */
  toJson(): string;

  /**
   * Transform each item in the collection using a callback.
   *
   * @param callback - Transform function
   * @returns The collection instance for chaining
   */
  transform(callback: (item: T, key: number | string) => any): this;

  /**
   * Convert a flattened "dot" notation array into an expanded array.
   *
   * @returns A new collection with undotted keys
   */
  undot(): ICollection<any>;

  /**
   * Execute the given callback unless the given condition is true.
   *
   * @param condition - Condition to check
   * @param callback - Callback to execute if condition is false
   * @param defaultCallback - Optional callback if condition is true
   * @returns The collection instance for chaining
   */
  unless(
    condition: boolean,
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Execute the given callback unless the collection is empty.
   *
   * @param callback - Callback to execute if not empty
   * @param defaultCallback - Optional callback if empty
   * @returns The collection instance for chaining
   */
  unlessEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Execute the given callback unless the collection is not empty.
   *
   * @param callback - Callback to execute if empty
   * @param defaultCallback - Optional callback if not empty
   * @returns The collection instance for chaining
   */
  unlessNotEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Union the collection with the given items.
   *
   * @param items - Items to union with
   * @returns A new collection with union
   */
  union(items: any[] | ICollection<any> | object): ICollection<any>;

  /**
   * Return only unique items from the collection.
   *
   * @param key - Optional key or callback to determine uniqueness
   * @returns A new collection with unique items
   */
  unique(key?: string | ((item: T) => any)): ICollection<T>;

  /**
   * Unwrap the given value if it is a collection.
   *
   * @param value - Value to unwrap
   * @returns Unwrapped value
   */
  unwrap(value: any): any;

  /**
   * Get all values from the collection.
   *
   * @returns A new collection of values
   */
  values(): ICollection<T>;

  /**
   * Execute the given callback when the given condition is true.
   *
   * @param condition - Condition to check
   * @param callback - Callback to execute if condition is true
   * @param defaultCallback - Optional callback if condition is false
   * @returns The collection instance for chaining
   */
  when(
    condition: boolean,
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Execute the given callback when the collection is empty.
   *
   * @param callback - Callback to execute if empty
   * @param defaultCallback - Optional callback if not empty
   * @returns The collection instance for chaining
   */
  whenEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Execute the given callback when the collection is not empty.
   *
   * @param callback - Callback to execute if not empty
   * @param defaultCallback - Optional callback if empty
   * @returns The collection instance for chaining
   */
  whenNotEmpty(
    callback: (collection: this) => void,
    defaultCallback?: (collection: this) => void
  ): this;

  /**
   * Filter items by the given key value pair.
   *
   * @param key - Key to filter by
   * @param operator - Comparison operator or value
   * @param value - Optional value to compare
   * @returns A new filtered collection
   */
  where(key: string, operator?: any, value?: any): ICollection<T>;

  /**
   * Filter items where the value is between given values.
   *
   * @param key - Key to check
   * @param values - Array of [min, max] values
   * @returns A new filtered collection
   */
  whereBetween(key: string, values: [any, any]): ICollection<T>;

  /**
   * Filter items by the given key value pair using "in" comparison.
   *
   * @param key - Key to filter by
   * @param values - Array of values to match
   * @returns A new filtered collection
   */
  whereIn(key: string, values: any[]): ICollection<T>;

  /**
   * Filter items by checking if they are instances of the given class.
   *
   * @param type - Class constructor to check against
   * @returns A new filtered collection
   */
  whereInstanceOf(type: new (...args: any[]) => any): ICollection<T>;

  /**
   * Filter items where the value is not between given values.
   *
   * @param key - Key to check
   * @param values - Array of [min, max] values
   * @returns A new filtered collection
   */
  whereNotBetween(key: string, values: [any, any]): ICollection<T>;

  /**
   * Filter items by the given key value pair using "not in" comparison.
   *
   * @param key - Key to filter by
   * @param values - Array of values to exclude
   * @returns A new filtered collection
   */
  whereNotIn(key: string, values: any[]): ICollection<T>;

  /**
   * Filter items where the given key is null.
   *
   * @param key - Optional key to check for null
   * @returns A new filtered collection
   */
  whereNull(key?: string): ICollection<T>;

  /**
   * Filter items where the given key is not null.
   *
   * @param key - Optional key to check for not null
   * @returns A new filtered collection
   */
  whereNotNull(key?: string): ICollection<T>;

  /**
   * Wrap the given value in a collection if applicable.
   *
   * @param value - Value to wrap
   * @returns A new collection
   */
  wrap(value: any): ICollection<any>;

  /**
   * Zip the collection together with one or more arrays.
   *
   * @param arrays - Arrays to zip with
   * @returns A new zipped collection
   */
  zip(...arrays: any[][]): ICollection<any[]>;
}
