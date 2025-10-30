/**
 * Number Prompt Tests
 *
 * @description
 * Interactive tests for the number prompt function.
 */

import { number } from '@/prompts/number';
import { success, error } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Number Prompt Tests ===' + '\n');

  try {
    // Test 1: Basic number input
    console.log('Test 1: Basic number input');
    const age = await number('Enter your age');
    success(`Age: ${age}`);

    // Test 2: Number with default value
    console.log('\nTest 2: Number with default value');
    const port = await number('Enter port number', {
      default: 3000,
    });
    success(`Port: ${port}`);

    // Test 3: Number with min/max range
    console.log('\nTest 3: Number with range (1-100)');
    const percentage = await number('Enter percentage', {
      min: 1,
      max: 100,
      required: true,
    });
    success(`Percentage: ${percentage}%`);

    // Test 4: Number for quantity
    console.log('\nTest 4: Quantity input (min 1)');
    const quantity = await number('How many items?', {
      min: 1,
      default: 1,
    });
    success(`Quantity: ${quantity}`);

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
