import { Arr } from '../src';

/**
 * Main function demonstrating comprehensive usage of the Arr utility class.
 *
 * This file contains practical examples of all Arr methods, organized by category.
 * Each example is commented out by default to prevent execution conflicts.
 * Uncomment specific examples to test individual methods.
 */
function main() {
  console.log('=== Arr Utility Examples ===\n');

  // ============================================================================
  // Type Checking and Validation
  // ============================================================================

  // Example: accessible() - Check if value is array-accessible
  // const accessibleExample = () => {
  //   console.log('--- accessible() ---');
  //   console.log(Arr.accessible([1, 2, 3])); // true
  //   console.log(Arr.accessible({ 0: 'a', 1: 'b', length: 2 })); // true
  //   console.log(Arr.accessible('string')); // false
  //   console.log(Arr.accessible(null)); // false
  // };
  // accessibleExample();

  // Example: arrayable() - Check if value can be converted to array
  // const arrayableExample = () => {
  //   console.log('\n--- arrayable() ---');
  //   console.log(Arr.arrayable([1, 2, 3])); // true
  //   console.log(Arr.arrayable(new Set([1, 2, 3]))); // true
  //   console.log(Arr.arrayable({ a: 1, b: 2 })); // true
  //   console.log(Arr.arrayable(42)); // false
  // };
  // arrayableExample();

  // Example: isAssoc() - Check if array is associative (object)
  // const isAssocExample = () => {
  //   console.log('\n--- isAssoc() ---');
  //   console.log(Arr.isAssoc({ a: 1, b: 2 })); // true
  //   console.log(Arr.isAssoc([1, 2, 3])); // false
  //   console.log(Arr.isAssoc({ 0: 'a', 1: 'b' })); // true
  // };
  // isAssocExample();

  // Example: isList() - Check if value is a true array
  // const isListExample = () => {
  //   console.log('\n--- isList() ---');
  //   console.log(Arr.isList([1, 2, 3])); // true
  //   console.log(Arr.isList({ 0: 'a', 1: 'b' })); // false
  //   console.log(Arr.isList({ a: 1, b: 2 })); // false
  // };
  // isListExample();

  // ============================================================================
  // Adding and Setting Values
  // ============================================================================

  // Example: add() - Add element if key doesn't exist
  // const addExample = () => {
  //   console.log('\n--- add() ---');
  //   const data = { user: { name: 'John' } };
  //   Arr.add(data, 'user.email', 'john@example.com');
  //   console.log(data); // { user: { name: 'John', email: 'john@example.com' } }
  //
  //   Arr.add(data, 'user.name', 'Jane'); // No change, key exists
  //   console.log(data); // { user: { name: 'John', email: 'john@example.com' } }
  // };
  // addExample();

  // Example: set() - Set value using dot notation
  // const setExample = () => {
  //   console.log('\n--- set() ---');
  //   const data: any = {};
  //   Arr.set(data, 'user.profile.name', 'John');
  //   Arr.set(data, 'user.profile.age', 30);
  //   console.log(data); // { user: { profile: { name: 'John', age: 30 } } }
  // };
  // setExample();

  // Example: prepend() - Add value to beginning
  // const prependExample = () => {
  //   console.log('\n--- prepend() ---');
  //   console.log(Arr.prepend([2, 3, 4], 1)); // [1, 2, 3, 4]
  //   console.log(Arr.prepend({ b: 2 }, 1, 'a')); // { a: 1, b: 2 }
  // };
  // prependExample();

  // Example: push() - Push values to array at key
  // const pushExample = () => {
  //   console.log('\n--- push() ---');
  //   const data = { items: [1, 2] };
  //   Arr.push(data, 'items', 3, 4, 5);
  //   console.log(data); // { items: [1, 2, 3, 4, 5] }
  // };
  // pushExample();

  // ============================================================================
  // Getting and Accessing Values
  // ============================================================================

  // Example: get() - Get value using dot notation
  // const getExample = () => {
  //   console.log('\n--- get() ---');
  //   const data = { user: { profile: { name: 'John', age: 30 } } };
  //   console.log(Arr.get(data, 'user.profile.name')); // 'John'
  //   console.log(Arr.get(data, 'user.email', 'N/A')); // 'N/A'
  //   console.log(Arr.get(data, 'user.settings.theme', 'light')); // 'light'
  // };
  // getExample();

  // Example: array() - Get array value with default
  // const arrayExample = () => {
  //   console.log('\n--- array() ---');
  //   const data = { user: { tags: ['admin', 'user'] }, items: [1, 2, 3] };
  //   console.log(Arr.array(data, 'user.tags')); // ['admin', 'user']
  //   console.log(Arr.array(data, 'missing', [])); // []
  // };
  // arrayExample();

  // Example: boolean() - Get boolean value
  // const booleanExample = () => {
  //   console.log('\n--- boolean() ---');
  //   const data = { user: { active: true, verified: 'yes', deleted: 0 } };
  //   console.log(Arr.boolean(data, 'user.active')); // true
  //   console.log(Arr.boolean(data, 'user.verified')); // true
  //   console.log(Arr.boolean(data, 'user.deleted')); // false
  //   console.log(Arr.boolean(data, 'user.suspended', false)); // false
  // };
  // booleanExample();

  // Example: integer() - Get integer value
  // const integerExample = () => {
  //   console.log('\n--- integer() ---');
  //   const data = { count: '42', total: 100.5, price: '19.99' };
  //   console.log(Arr.integer(data, 'count')); // 42
  //   console.log(Arr.integer(data, 'total')); // 100
  //   console.log(Arr.integer(data, 'missing', 0)); // 0
  // };
  // integerExample();

  // Example: float() - Get float value
  // const floatExample = () => {
  //   console.log('\n--- float() ---');
  //   const data = { price: '19.99', tax: 2.5, discount: '5.50' };
  //   console.log(Arr.float(data, 'price')); // 19.99
  //   console.log(Arr.float(data, 'tax')); // 2.5
  //   console.log(Arr.float(data, 'discount')); // 5.5
  //   console.log(Arr.float(data, 'shipping', 0.0)); // 0.0
  // };
  // floatExample();

  // Example: string() - Get string value
  // const stringExample = () => {
  //   console.log('\n--- string() ---');
  //   const data = { name: 'John', age: 30, active: true };
  //   console.log(Arr.string(data, 'name')); // 'John'
  //   console.log(Arr.string(data, 'age')); // '30'
  //   console.log(Arr.string(data, 'active')); // 'true'
  //   console.log(Arr.string(data, 'email', 'N/A')); // 'N/A'
  // };
  // stringExample();

  // Example: first() - Get first element
  // const firstExample = () => {
  //   console.log('\n--- first() ---');
  //   console.log(Arr.first([1, 2, 3, 4])); // 1
  //   console.log(Arr.first([1, 2, 3, 4], n => n > 2)); // 3
  //   console.log(Arr.first([], null, 'default')); // 'default'
  //
  //   const users = [{ age: 20 }, { age: 30 }, { age: 25 }];
  //   console.log(Arr.first(users, u => u.age >= 25)); // { age: 30 }
  // };
  // firstExample();

  // Example: last() - Get last element
  // const lastExample = () => {
  //   console.log('\n--- last() ---');
  //   console.log(Arr.last([1, 2, 3, 4])); // 4
  //   console.log(Arr.last([1, 2, 3, 4], n => n < 3)); // 2
  //   console.log(Arr.last([], null, 'default')); // 'default'
  // };
  // lastExample();

  // Example: sole() - Get the only matching element
  // const soleExample = () => {
  //   console.log('\n--- sole() ---');
  //   try {
  //     console.log(Arr.sole([1, 2, 3], n => n === 2)); // 2
  //     console.log(Arr.sole([1, 2, 3], n => n > 1)); // Error: multiple matches
  //   } catch (error: any) {
  //     console.log('Error:', error.message);
  //   }
  // };
  // soleExample();

  // Example: random() - Get random element(s)
  // const randomExample = () => {
  //   console.log('\n--- random() ---');
  //   console.log(Arr.random([1, 2, 3, 4, 5])); // Random single value
  //   console.log(Arr.random([1, 2, 3, 4, 5], 2)); // Random pair
  //   console.log(Arr.random(['a', 'b', 'c', 'd'], 3)); // Random three
  // };
  // randomExample();

  // ============================================================================
  // Checking Existence
  // ============================================================================

  // Example: exists() - Check if key exists
  // const existsExample = () => {
  //   console.log('\n--- exists() ---');
  //   const data = { a: 1, b: 2, c: null };
  //   console.log(Arr.exists(data, 'a')); // true
  //   console.log(Arr.exists(data, 'c')); // true (even though value is null)
  //   console.log(Arr.exists(data, 'd')); // false
  //   console.log(Arr.exists(['x', 'y', 'z'], 1)); // true
  //   console.log(Arr.exists(['x', 'y', 'z'], 5)); // false
  // };
  // existsExample();

  // Example: has() - Check if any key exists
  // const hasExample = () => {
  //   console.log('\n--- has() ---');
  //   const data = { a: 1, b: 2, c: 3 };
  //   console.log(Arr.has(data, 'a')); // true
  //   console.log(Arr.has(data, ['a', 'd'])); // true (a exists)
  //   console.log(Arr.has(data, ['x', 'y'])); // false
  // };
  // hasExample();

  // Example: hasAll() - Check if all keys exist
  // const hasAllExample = () => {
  //   console.log('\n--- hasAll() ---');
  //   const data = { a: 1, b: 2, c: 3 };
  //   console.log(Arr.hasAll(data, ['a', 'b'])); // true
  //   console.log(Arr.hasAll(data, ['a', 'b', 'd'])); // false
  // };
  // hasAllExample();

  // Example: hasAny() - Check if any key exists
  // const hasAnyExample = () => {
  //   console.log('\n--- hasAny() ---');
  //   const data = { a: 1, b: 2 };
  //   console.log(Arr.hasAny(data, ['a', 'x', 'y'])); // true
  //   console.log(Arr.hasAny(data, ['x', 'y', 'z'])); // false
  // };
  // hasAnyExample();

  // ============================================================================
  // Removing Values
  // ============================================================================

  // Example: forget() - Remove keys using dot notation
  // const forgetExample = () => {
  //   console.log('\n--- forget() ---');
  //   const data = { a: 1, b: 2, c: 3 };
  //   Arr.forget(data, 'b');
  //   console.log(data); // { a: 1, c: 3 }
  //
  //   const nested = { user: { name: 'John', age: 30, email: 'john@example.com' } };
  //   Arr.forget(nested, ['user.age', 'user.email']);
  //   console.log(nested); // { user: { name: 'John' } }
  // };
  // forgetExample();

  // Example: pull() - Remove and return value
  // const pullExample = () => {
  //   console.log('\n--- pull() ---');
  //   const data = { a: 1, b: 2, c: 3 };
  //   const value = Arr.pull(data, 'b');
  //   console.log('Pulled value:', value); // 2
  //   console.log('Remaining data:', data); // { a: 1, c: 3 }
  // };
  // pullExample();

  // Example: except() - Get all except specified keys
  // const exceptExample = () => {
  //   console.log('\n--- except() ---');
  //   const user = { id: 1, name: 'John', password: 'secret', email: 'john@example.com' };
  //   console.log(Arr.except(user, ['password']));
  //   // { id: 1, name: 'John', email: 'john@example.com' }
  //
  //   console.log(Arr.except({ a: 1, b: 2, c: 3, d: 4 }, ['a', 'c']));
  //   // { b: 2, d: 4 }
  // };
  // exceptExample();

  // Example: only() - Get only specified keys
  // const onlyExample = () => {
  //   console.log('\n--- only() ---');
  //   const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
  //   console.log(Arr.only(user, ['id', 'name', 'email']));
  //   // { id: 1, name: 'John', email: 'john@example.com' }
  //
  //   console.log(Arr.only({ a: 1, b: 2, c: 3 }, ['a', 'c']));
  //   // { a: 1, c: 3 }
  // };
  // onlyExample();

  // Example: select() - Alias for only()
  // const selectExample = () => {
  //   console.log('\n--- select() ---');
  //   const data = { a: 1, b: 2, c: 3, d: 4 };
  //   console.log(Arr.select(data, ['b', 'd'])); // { b: 2, d: 4 }
  // };
  // selectExample();

  // ============================================================================
  // Transforming Arrays
  // ============================================================================

  // Example: map() - Transform each element
  // const mapExample = () => {
  //   console.log('\n--- map() ---');
  //   console.log(Arr.map([1, 2, 3], n => n * 2)); // [2, 4, 6]
  //   console.log(Arr.map(['a', 'b'], (s, i) => s + i)); // ['a0', 'b1']
  //
  //   const users = [{ name: 'John' }, { name: 'Jane' }];
  //   console.log(Arr.map(users, u => u.name.toUpperCase())); // ['JOHN', 'JANE']
  // };
  // mapExample();

  // Example: mapWithKeys() - Transform to key-value pairs
  // const mapWithKeysExample = () => {
  //   console.log('\n--- mapWithKeys() ---');
  //   const users = [
  //     { id: 1, name: 'John' },
  //     { id: 2, name: 'Jane' }
  //   ];
  //   console.log(Arr.mapWithKeys(users, u => [u.id, u.name]));
  //   // { 1: 'John', 2: 'Jane' }
  // };
  // mapWithKeysExample();

  // Example: mapSpread() - Map with spread arguments
  // const mapSpreadExample = () => {
  //   console.log('\n--- mapSpread() ---');
  //   const pairs = [['John', 30], ['Jane', 25], ['Bob', 35]];
  //   console.log(Arr.mapSpread(pairs, (name, age) => `${name} is ${age}`));
  //   // ['John is 30', 'Jane is 25', 'Bob is 35']
  // };
  // mapSpreadExample();

  // Example: pluck() - Extract property values
  // const pluckExample = () => {
  //   console.log('\n--- pluck() ---');
  //   const users = [
  //     { id: 1, name: 'John', email: 'john@example.com' },
  //     { id: 2, name: 'Jane', email: 'jane@example.com' }
  //   ];
  //   console.log(Arr.pluck(users, 'name')); // ['John', 'Jane']
  //   console.log(Arr.pluck(users, 'email', 'id'));
  //   // { 1: 'john@example.com', 2: 'jane@example.com' }
  // };
  // pluckExample();

  // Example: keyBy() - Key array by property
  // const keyByExample = () => {
  //   console.log('\n--- keyBy() ---');
  //   const users = [
  //     { id: 1, name: 'John' },
  //     { id: 2, name: 'Jane' }
  //   ];
  //   console.log(Arr.keyBy(users, 'id'));
  //   // { 1: { id: 1, name: 'John' }, 2: { id: 2, name: 'Jane' } }
  //
  //   console.log(Arr.keyBy(users, u => u.name.toLowerCase()));
  //   // { john: { id: 1, name: 'John' }, jane: { id: 2, name: 'Jane' } }
  // };
  // keyByExample();

  // Example: prependKeysWith() - Add prefix to keys
  // const prependKeysWithExample = () => {
  //   console.log('\n--- prependKeysWith() ---');
  //   console.log(Arr.prependKeysWith({ a: 1, b: 2 }, 'prefix_'));
  //   // { prefix_a: 1, prefix_b: 2 }
  //
  //   console.log(Arr.prependKeysWith({ name: 'John', age: 30 }, 'user_'));
  //   // { user_name: 'John', user_age: 30 }
  // };
  // prependKeysWithExample();

  // ============================================================================
  // Flattening and Collapsing
  // ============================================================================

  // Example: collapse() - Flatten one level
  // const collapseExample = () => {
  //   console.log('\n--- collapse() ---');
  //   console.log(Arr.collapse([[1, 2], [3, 4], [5, 6]]));
  //   // [1, 2, 3, 4, 5, 6]
  //
  //   console.log(Arr.collapse([['a'], ['b', 'c'], ['d']]));
  //   // ['a', 'b', 'c', 'd']
  // };
  // collapseExample();

  // Example: flatten() - Flatten to specified depth
  // const flattenExample = () => {
  //   console.log('\n--- flatten() ---');
  //   console.log(Arr.flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]
  //   console.log(Arr.flatten([1, [2, [3, [4]]]], 1)); // [1, 2, [3, [4]]]
  //   console.log(Arr.flatten([1, [2, [3, [4]]]], 2)); // [1, 2, 3, [4]]
  // };
  // flattenExample();

  // Example: dot() - Flatten with dot notation
  // const dotExample = () => {
  //   console.log('\n--- dot() ---');
  //   console.log(Arr.dot({ user: { name: 'John', address: { city: 'NYC' } } }));
  //   // { 'user.name': 'John', 'user.address.city': 'NYC' }
  //
  //   console.log(Arr.dot({ a: 1, b: { c: 2 } }, 'prefix'));
  //   // { 'prefix.a': 1, 'prefix.b.c': 2 }
  // };
  // dotExample();

  // Example: undot() - Expand dot notation
  // const undotExample = () => {
  //   console.log('\n--- undot() ---');
  //   console.log(Arr.undot({ 'user.name': 'John', 'user.age': 30 }));
  //   // { user: { name: 'John', age: 30 } }
  //
  //   console.log(Arr.undot({ 'items.0': 'a', 'items.1': 'b', 'items.2': 'c' }));
  //   // { items: ['a', 'b', 'c'] }
  // };
  // undotExample();

  // ============================================================================
  // Filtering and Selecting
  // ============================================================================

  // Example: where() - Filter by callback
  // const whereExample = () => {
  //   console.log('\n--- where() ---');
  //   console.log(Arr.where([1, 2, 3, 4, 5], n => n > 2));
  //   // [3, 4, 5]
  //
  //   const users = [{ age: 25 }, { age: 30 }, { age: 20 }];
  //   console.log(Arr.where(users, u => u.age >= 25));
  //   // [{ age: 25 }, { age: 30 }]
  // };
  // whereExample();

  // Example: reject() - Filter by rejecting matches
  // const rejectExample = () => {
  //   console.log('\n--- reject() ---');
  //   console.log(Arr.reject([1, 2, 3, 4, 5], n => n > 2));
  //   // [1, 2]
  //
  //   const users = [{ active: true }, { active: false }, { active: true }];
  //   console.log(Arr.reject(users, u => u.active));
  //   // [{ active: false }]
  // };
  // rejectExample();

  // Example: whereNotNull() - Filter out null/undefined
  // const whereNotNullExample = () => {
  //   console.log('\n--- whereNotNull() ---');
  //   console.log(Arr.whereNotNull([1, null, 2, undefined, 3, 0, false]));
  //   // [1, 2, 3, 0, false]
  // };
  // whereNotNullExample();

  // Example: partition() - Split into two arrays
  // const partitionExample = () => {
  //   console.log('\n--- partition() ---');
  //   const [evens, odds] = Arr.partition([1, 2, 3, 4, 5], n => n % 2 === 0);
  //   console.log('Evens:', evens); // [2, 4]
  //   console.log('Odds:', odds); // [1, 3, 5]
  // };
  // partitionExample();

  // ============================================================================
  // Testing and Validation
  // ============================================================================

  // Example: every() - Test if all pass
  // const everyExample = () => {
  //   console.log('\n--- every() ---');
  //   console.log(Arr.every([2, 4, 6, 8], n => n % 2 === 0)); // true
  //   console.log(Arr.every([2, 3, 4], n => n % 2 === 0)); // false
  // };
  // everyExample();

  // Example: some() - Test if any pass
  // const someExample = () => {
  //   console.log('\n--- some() ---');
  //   console.log(Arr.some([1, 2, 3, 4], n => n > 3)); // true
  //   console.log(Arr.some([1, 2, 3], n => n > 5)); // false
  // };
  // someExample();

  // ============================================================================
  // Sorting
  // ============================================================================

  // Example: sort() - Sort array
  // const sortExample = () => {
  //   console.log('\n--- sort() ---');
  //   console.log(Arr.sort([3, 1, 4, 1, 5])); // [1, 1, 3, 4, 5]
  //   console.log(Arr.sort(['c', 'a', 'b'])); // ['a', 'b', 'c']
  // };
  // sortExample();

  // Example: sortDesc() - Sort descending
  // const sortDescExample = () => {
  //   console.log('\n--- sortDesc() ---');
  //   console.log(Arr.sortDesc([1, 3, 2, 5, 4])); // [5, 4, 3, 2, 1]
  //   console.log(Arr.sortDesc(['a', 'c', 'b'])); // ['c', 'b', 'a']
  // };
  // sortDescExample();

  // Example: sortRecursive() - Sort recursively
  // const sortRecursiveExample = () => {
  //   console.log('\n--- sortRecursive() ---');
  //   const data = { c: 3, a: { z: 1, x: 2 }, b: 2 };
  //   console.log(Arr.sortRecursive(data));
  //   // { a: { x: 2, z: 1 }, b: 2, c: 3 }
  // };
  // sortRecursiveExample();

  // Example: shuffle() - Randomly shuffle array
  // const shuffleExample = () => {
  //   console.log('\n--- shuffle() ---');
  //   console.log(Arr.shuffle([1, 2, 3, 4, 5]));
  //   // Random order, e.g., [3, 1, 5, 2, 4]
  // };
  // shuffleExample();

  // ============================================================================
  // Array Operations
  // ============================================================================

  // Example: take() - Take first/last n items
  // const takeExample = () => {
  //   console.log('\n--- take() ---');
  //   console.log(Arr.take([1, 2, 3, 4, 5], 3)); // [1, 2, 3]
  //   console.log(Arr.take([1, 2, 3, 4, 5], -2)); // [4, 5]
  //   console.log(Arr.take([1, 2, 3], 10)); // [1, 2, 3]
  // };
  // takeExample();

  // Example: divide() - Split into keys and values
  // const divideExample = () => {
  //   console.log('\n--- divide() ---');
  //   console.log(Arr.divide({ a: 1, b: 2, c: 3 }));
  //   // [['a', 'b', 'c'], [1, 2, 3]]
  //
  //   console.log(Arr.divide(['x', 'y', 'z']));
  //   // [[0, 1, 2], ['x', 'y', 'z']]
  // };
  // divideExample();

  // Example: crossJoin() - Cartesian product
  // const crossJoinExample = () => {
  //   console.log('\n--- crossJoin() ---');
  //   console.log(Arr.crossJoin(['red', 'blue'], ['small', 'large']));
  //   // [
  //   //   ['red', 'small'],
  //   //   ['red', 'large'],
  //   //   ['blue', 'small'],
  //   //   ['blue', 'large']
  //   // ]
  // };
  // crossJoinExample();

  // Example: wrap() - Wrap value in array
  // const wrapExample = () => {
  //   console.log('\n--- wrap() ---');
  //   console.log(Arr.wrap([1, 2, 3])); // [1, 2, 3]
  //   console.log(Arr.wrap('hello')); // ['hello']
  //   console.log(Arr.wrap(42)); // [42]
  // };
  // wrapExample();

  // Example: from() - Convert to array
  // const fromExample = () => {
  //   console.log('\n--- from() ---');
  //   console.log(Arr.from('hello')); // ['hello']
  //   console.log(Arr.from([1, 2, 3])); // [1, 2, 3]
  //   console.log(Arr.from(new Set([1, 2, 3]))); // [1, 2, 3]
  // };
  // fromExample();

  // ============================================================================
  // String Operations
  // ============================================================================

  // Example: join() - Join array elements
  // const joinExample = () => {
  //   console.log('\n--- join() ---');
  //   console.log(Arr.join(['a', 'b', 'c'], ', ')); // 'a, b, c'
  //   console.log(Arr.join(['a', 'b', 'c'], ', ', ' and ')); // 'a, b and c'
  //   console.log(Arr.join([1, 2, 3], '-')); // '1-2-3'
  // };
  // joinExample();

  // Example: query() - Convert to query string
  // const queryExample = () => {
  //   console.log('\n--- query() ---');
  //   console.log(Arr.query({ name: 'John', age: 30 }));
  //   // 'name=John&age=30'
  //
  //   console.log(Arr.query({ search: 'hello world', page: 1 }));
  //   // 'search=hello+world&page=1'
  // };
  // queryExample();

  // Example: toCssClasses() - Convert to CSS classes
  // const toCssClassesExample = () => {
  //   console.log('\n--- toCssClasses() ---');
  //   console.log(Arr.toCssClasses(['btn', 'btn-primary', null, 'active']));
  //   // 'btn btn-primary active'
  //
  //   console.log(Arr.toCssClasses({ btn: true, 'btn-primary': true, disabled: false }));
  //   // 'btn btn-primary'
  // };
  // toCssClassesExample();

  // Example: toCssStyles() - Convert to CSS styles
  // const toCssStylesExample = () => {
  //   console.log('\n--- toCssStyles() ---');
  //   console.log(Arr.toCssStyles({ color: 'red', 'font-size': '14px', display: 'block' }));
  //   // 'color: red; font-size: 14px; display: block'
  // };
  // toCssStylesExample();

  // ============================================================================
  // Real-World Example: User Management
  // ============================================================================

  const realWorldExample = () => {
    console.log('\n=== Real-World Example: User Management ===\n');

    // Sample user data
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, active: true, role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, active: true, role: 'user' },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        age: 35,
        active: false,
        role: 'user',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@example.com',
        age: 28,
        active: true,
        role: 'moderator',
      },
    ];

    // Get all active users
    const activeUsers = Arr.where(users, (u) => u.active);
    console.log('Active users:', activeUsers.length);

    // Get user names only
    const userNames = Arr.pluck(users, 'name');
    console.log('User names:', userNames);

    // Get users keyed by ID
    const usersById = Arr.keyBy(users, 'id');
    console.log('User with ID 2:', usersById[2].name);

    // Get only safe fields (exclude sensitive data)
    const publicUser = Arr.only(users[0], ['id', 'name', 'age']);
    console.log('Public user data:', publicUser);

    // Partition users by age
    const [youngUsers, olderUsers] = Arr.partition(users, (u) => u.age < 30);
    console.log('Young users:', youngUsers.length, 'Older users:', olderUsers.length);

    // Get first admin user
    const admin = Arr.first(users, (u) => u.role === 'admin');
    console.log('First admin:', admin?.name);

    // Transform users to display format
    const displayUsers = Arr.map(activeUsers, (u) => ({
      label: `${u.name} (${u.role})`,
      value: u.id,
    }));
    console.log('Display format:', displayUsers);
  };
  realWorldExample();
}

// Uncomment to run examples
// main();

export { main };
