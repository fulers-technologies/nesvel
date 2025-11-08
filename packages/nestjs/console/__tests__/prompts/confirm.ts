import { confirm } from '@/prompts/confirm';
import { success, error, info } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Confirm Prompt Tests ===' + '\n');

  try {
    // Test 1: Basic confirmation (default true)
    console.log('Test 1: Basic confirmation (default true)');
    const result1 = await confirm('Do you want to continue?');
    info(`Result: ${result1}`);

    // Test 2: Confirmation with default false
    console.log('\nTest 2: Confirmation with default false');
    const result2 = await confirm('Delete all files?', { default: false });
    info(`Result: ${result2}`);

    // Test 3: Critical operation confirmation
    console.log('\nTest 3: Critical operation');
    const confirmed = await confirm('This will permanently delete your account. Are you sure?', {
      default: false,
    });

    if (confirmed) {
      error('Account deletion confirmed');
    } else {
      success('Account deletion cancelled');
    }

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
