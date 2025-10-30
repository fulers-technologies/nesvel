/**
 * Spinner Tests
 *
 * @description
 * Tests for spinner functionality with async operations.
 */

import { spinner, runWithSpinner } from '@/prompts/spinner';
import { success, error } from '@/messages';

/**
 * Simulates an async operation
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Spinner Tests ===' + '\n');

  try {
    // Test 1: Basic spinner usage
    console.log('Test 1: Basic spinner');
    const spin1 = spinner('Loading data...');
    await delay(2000);
    spin1.succeed('Data loaded successfully');

    // Test 2: Spinner with failure
    console.log('\nTest 2: Spinner with failure');
    const spin2 = spinner('Attempting connection...');
    await delay(1500);
    spin2.fail('Connection failed');

    // Test 3: Spinner with warning
    console.log('\nTest 3: Spinner with warning');
    const spin3 = spinner('Checking dependencies...');
    await delay(1000);
    spin3.warn('Some dependencies are outdated');

    // Test 4: Spinner with info
    console.log('\nTest 4: Spinner with info');
    const spin4 = spinner('Scanning files...');
    await delay(1500);
    spin4.info('Found 42 files');

    // Test 5: Using runWithSpinner helper
    console.log('\nTest 5: Using runWithSpinner helper (success)');
    await runWithSpinner(
      'Processing items...',
      async () => {
        await delay(2000);
        return { processed: 100 };
      },
      {
        successText: 'Processed 100 items',
        errorText: 'Failed to process items',
      },
    );

    // Test 6: runWithSpinner with error
    console.log('\nTest 6: Using runWithSpinner helper (error)');
    try {
      await runWithSpinner(
        'Attempting risky operation...',
        async () => {
          await delay(1000);
          throw new Error('Operation failed');
        },
        {
          successText: 'Operation succeeded',
          errorText: 'Operation failed as expected',
        },
      );
    } catch (err: Error | any) {
      // Expected to fail
    }

    console.log('\n=== All tests completed ===' + '\n');
    success('All spinner tests passed');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
