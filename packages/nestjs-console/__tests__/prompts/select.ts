/**
 * Select Prompt Tests
 *
 * @description
 * Interactive tests for the select prompt function.
 */

import { select } from '@/prompts/select';
import { success, error } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Select Prompt Tests ===' + '\n');

  try {
    // Test 1: Simple string choices
    console.log('Test 1: Simple string choices');
    const color = await select('Choose a color', ['red', 'green', 'blue', 'yellow']);
    success(`Selected color: ${color}`);

    // Test 2: Object choices with labels
    console.log('\nTest 2: Object choices with labels and descriptions');
    const role = await select('Select your role', [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
      { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
    ]);
    success(`Selected role: ${role}`);

    // Test 3: Select with default value
    console.log('\nTest 3: Select with default value');
    const env = await select('Select environment', ['development', 'staging', 'production'], {
      default: 'development',
    });
    success(`Selected environment: ${env}`);

    // Test 4: Framework selection
    console.log('\nTest 4: Framework selection');
    const framework = await select('Choose a framework', [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue.js' },
      { value: 'angular', label: 'Angular' },
      { value: 'svelte', label: 'Svelte' },
    ]);
    success(`Selected framework: ${framework}`);

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
