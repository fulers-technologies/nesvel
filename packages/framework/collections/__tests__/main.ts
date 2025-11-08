/**
 * Collection Wrapper Examples
 *
 * This file demonstrates various usage patterns and features of the Collection wrapper.
 * Each example is commented out to prevent automatic execution.
 * Uncomment individual examples to test specific functionality.
 */

import { Collection, collect } from '../src';

/**
 * Main function that runs all example demonstrations.
 *
 * This function serves as the entry point for testing and demonstrating
 * the Collection wrapper's capabilities. Each example is self-contained
 * and showcases different aspects of the collection API.
 *
 * Returns:
 *   - void: This function doesn't return a value, it only logs output.
 */
function main(): void {
  console.log('=== Collection Wrapper Examples ===\n');

  // Uncomment the examples you want to run:

  // basicUsageExample();
  // staticMakeMethodExample();
  // chainingOperationsExample();
  // filteringAndMappingExample();
  // aggregationExample();
  // groupingAndKeyingExample();
  // conditionalExecutionExample();
  // advancedTransformationsExample();
}

/**
 * Example 1: Basic Usage
 *
 * Demonstrates the most fundamental ways to create and use collections,
 * including instantiation with different data types and accessing items.
 */
function basicUsageExample(): void {
  console.log('--- Example 1: Basic Usage ---');

  // Create a collection from an array
  const numbers = Collection.make([1, 2, 3, 4, 5]);
  console.log('Numbers:', numbers.all());

  // Create a collection from an object
  const user = Collection.make({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  });
  console.log('User:', user.all());

  // Using the collect helper function
  const fruits = collect(['apple', 'banana', 'orange']);
  console.log('Fruits:', fruits.all());
  console.log('Count:', fruits.count());

  console.log();
}

/**
 * Example 2: Static Make Method
 *
 * Showcases the Laravel-like static factory method pattern for creating
 * collections with proper TypeScript type inference.
 */
function staticMakeMethodExample(): void {
  console.log('--- Example 2: Static Make Method ---');

  // Define a User interface for type safety
  interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
  }

  // Create a strongly-typed collection
  const users = Collection.make<User>([
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true },
  ]);

  console.log('Total users:', users.count());
  console.log('First user:', users.first());
  console.log('Last user:', users.last());

  console.log();
}

/**
 * Example 3: Chaining Operations
 *
 * Demonstrates the power of method chaining to perform complex data
 * transformations in a readable and expressive way.
 */
function chainingOperationsExample(): void {
  console.log('--- Example 3: Chaining Operations ---');

  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
  }

  const products = Collection.make<Product>([
    { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
    { id: 2, name: 'Mouse', price: 25, category: 'Electronics', inStock: true },
    { id: 3, name: 'Desk', price: 299, category: 'Furniture', inStock: false },
    { id: 4, name: 'Chair', price: 199, category: 'Furniture', inStock: true },
    { id: 5, name: 'Monitor', price: 399, category: 'Electronics', inStock: true },
  ]);

  // Chain multiple operations to get available electronics sorted by price
  const availableElectronics = products
    .where('category', 'Electronics')
    .where('inStock', true)
    .sortBy('price')
    .pluck('name')
    .all();

  console.log('Available Electronics (sorted by price):', availableElectronics);

  // Calculate total value of in-stock items
  const totalValue = products.where('inStock', true).sum('price');

  console.log('Total value of in-stock items: $' + totalValue);

  console.log();
}

/**
 * Example 4: Filtering and Mapping
 *
 * Shows various ways to filter collections and transform items using
 * map operations with callbacks and property accessors.
 */
function filteringAndMappingExample(): void {
  console.log('--- Example 4: Filtering and Mapping ---');

  const numbers = Collection.make([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // Filter even numbers
  const evenNumbers = numbers.filter((n) => n % 2 === 0);
  console.log('Even numbers:', evenNumbers.all());

  // Map to squares
  const squares = numbers.map((n) => n * n);
  console.log('Squares:', squares.all());

  // Filter and map in chain
  const evenSquares = numbers
    .filter((n) => n % 2 === 0)
    .map((n) => n * n)
    .all();
  console.log('Even number squares:', evenSquares);

  // Reject (inverse of filter)
  const notDivisibleByThree = numbers.reject((n) => n % 3 === 0);
  console.log('Not divisible by 3:', notDivisibleByThree.all());

  console.log();
}

/**
 * Example 5: Aggregation Operations
 *
 * Demonstrates statistical and aggregation methods for calculating
 * sums, averages, min, max, and other aggregate values.
 */
function aggregationExample(): void {
  console.log('--- Example 5: Aggregation Operations ---');

  interface Sale {
    product: string;
    amount: number;
    quantity: number;
  }

  const sales = Collection.make<Sale>([
    { product: 'Laptop', amount: 999, quantity: 2 },
    { product: 'Mouse', amount: 25, quantity: 10 },
    { product: 'Keyboard', amount: 75, quantity: 5 },
    { product: 'Monitor', amount: 399, quantity: 3 },
  ]);

  // Calculate various statistics
  console.log('Total sales amount:', sales.sum('amount'));
  console.log('Average sale amount:', sales.avg('amount'));
  console.log('Maximum sale amount:', sales.max('amount'));
  console.log('Minimum sale amount:', sales.min('amount'));
  console.log('Median sale amount:', sales.median('amount'));

  // Calculate total revenue (amount * quantity)
  const totalRevenue = sales.reduce((total, sale) => {
    return total + sale.amount * sale.quantity;
  }, 0);
  console.log('Total revenue:', totalRevenue);

  console.log();
}

/**
 * Example 6: Grouping and Keying
 *
 * Shows how to organize and restructure collections using groupBy,
 * keyBy, and other organizational methods.
 */
function groupingAndKeyingExample(): void {
  console.log('--- Example 6: Grouping and Keying ---');

  interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
  }

  const employees = Collection.make<Employee>([
    { id: 1, name: 'John', department: 'Engineering', salary: 80000 },
    { id: 2, name: 'Jane', department: 'Marketing', salary: 70000 },
    { id: 3, name: 'Bob', department: 'Engineering', salary: 90000 },
    { id: 4, name: 'Alice', department: 'Sales', salary: 75000 },
    { id: 5, name: 'Charlie', department: 'Engineering', salary: 85000 },
  ]);

  // Group by department
  const byDepartment = employees.groupBy('department');
  console.log('Grouped by department:', byDepartment.all());

  // Key by ID for quick lookups
  const byId = employees.keyBy('id');
  console.log('Keyed by ID:', byId.all());

  // Count employees by department
  const departmentCounts = employees.countBy('department');
  console.log('Department counts:', departmentCounts.all());

  // Get unique departments
  const departments = employees.pluck('department').unique();
  console.log('Unique departments:', departments.all());

  console.log();
}

/**
 * Example 7: Conditional Execution
 *
 * Demonstrates conditional method execution using when, unless,
 * and related methods for dynamic collection manipulation.
 */
function conditionalExecutionExample(): void {
  console.log('--- Example 7: Conditional Execution ---');

  const numbers = Collection.make([1, 2, 3, 4, 5]);

  // Execute callback when condition is true
  const result1 = numbers
    .when(true, (collection) => {
      console.log('Condition is true, doubling numbers');
      return collection.map((n) => n * 2);
    })
    .all();
  console.log('Result 1:', result1);

  // Execute callback unless condition is true
  const result2 = Collection.make([1, 2, 3])
    .unless(false, (collection) => {
      console.log('Condition is false, tripling numbers');
      return collection.map((n) => n * 3);
    })
    .all();
  console.log('Result 2:', result2);

  // Execute when collection is not empty
  const emptyCollection = Collection.make([]);
  const nonEmptyCollection = Collection.make([1, 2, 3]);

  emptyCollection.whenNotEmpty((collection) => {
    console.log('This will not execute - collection is empty');
  });

  nonEmptyCollection.whenNotEmpty((collection) => {
    console.log('Collection is not empty, has', collection.count(), 'items');
  });

  console.log();
}

/**
 * Example 8: Advanced Transformations
 *
 * Showcases advanced transformation techniques including flatMap,
 * partition, chunk, and other sophisticated operations.
 */
function advancedTransformationsExample(): void {
  console.log('--- Example 8: Advanced Transformations ---');

  // FlatMap example - map and flatten in one operation
  const users = Collection.make([
    { name: 'John', tags: ['admin', 'user'] },
    { name: 'Jane', tags: ['user', 'moderator'] },
    { name: 'Bob', tags: ['user'] },
  ]);

  const allTags = users.flatMap((user) => user.tags).unique();
  console.log('All unique tags:', allTags.all());

  // Partition - split into two groups based on condition
  const numbers = Collection.make([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [evens, odds] = numbers.partition((n) => n % 2 === 0);
  console.log('Even numbers:', evens.all());
  console.log('Odd numbers:', odds.all());

  // Chunk - break into smaller groups
  const items = Collection.make([1, 2, 3, 4, 5, 6, 7, 8]);
  const chunks = items.chunk(3);
  console.log('Chunked items:', chunks.all());

  // Take and skip
  const first3 = numbers.take(3);
  console.log('First 3 numbers:', first3.all());

  const skip5 = numbers.skip(5);
  console.log('Skip first 5:', skip5.all());

  // Zip - combine multiple arrays
  const names = Collection.make(['John', 'Jane', 'Bob']);
  const ages = [30, 25, 35];
  const emails = ['john@example.com', 'jane@example.com', 'bob@example.com'];

  const combined = names.zip(ages, emails);
  console.log('Zipped data:', combined.all());

  console.log();
}

// Run the main function
// Uncomment the line below to execute the examples
// main();

export { main };
