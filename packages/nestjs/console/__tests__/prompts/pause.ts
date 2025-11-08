import { pause } from '@/prompts/pause';
import { success, info } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Pause Prompt Tests ===' + '\n');

  try {
    // Test 1: Default pause message
    console.log('Test 1: Default pause message');
    info('This is step 1');
    await pause();
    success('Continuing to step 2');

    // Test 2: Custom pause message
    console.log('\nTest 2: Custom pause message');
    info('About to perform critical operation');
    await pause('Press Enter when you are ready to proceed');
    success('Proceeding with operation');

    // Test 3: Pause in workflow
    console.log('\nTest 3: Pause in workflow');
    info('Starting backup process...');
    await pause('Press Enter to start backup');
    info('Backup in progress...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success('Backup completed');

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    console.error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
