/**
 * Multiselect Prompt Tests
 *
 * @description
 * Interactive tests for the multiselect prompt function.
 */

import { multiselect } from '@/prompts/multiselect';
import { success, error, info } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Multiselect Prompt Tests ===' + '\n');

  try {
    // Test 1: Simple multiselect
    console.log('Test 1: Simple multiselect');
    const colors = await multiselect('Choose colors', ['red', 'green', 'blue', 'yellow', 'purple']);
    success(`Selected colors: ${colors.join(', ')}`);

    // Test 2: Multiselect with objects
    console.log('\nTest 2: Multiselect with descriptions');
    const permissions = await multiselect('Select permissions', [
      { value: 'read', label: 'Read', description: 'View content' },
      { value: 'write', label: 'Write', description: 'Create and edit content' },
      { value: 'delete', label: 'Delete', description: 'Remove content' },
      { value: 'admin', label: 'Admin', description: 'Full access' },
    ]);
    success(`Selected permissions: ${permissions.join(', ')}`);

    // Test 3: Required multiselect
    console.log('\nTest 3: Required multiselect (must select at least one)');
    const features = await multiselect(
      'Select features to enable',
      ['Authentication', 'Database', 'Caching', 'Logging', 'Monitoring'],
      { required: true },
    );
    success(`Enabled features: ${features.join(', ')}`);

    // Test 4: Multiselect with defaults
    console.log('\nTest 4: Multiselect with default selections');
    const days = await multiselect(
      'Select available days',
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      { default: ['Monday', 'Wednesday', 'Friday'] },
    );
    success(`Selected days: ${days.join(', ')}`);

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
