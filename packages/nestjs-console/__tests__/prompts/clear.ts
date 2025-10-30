/**
 * Clear Function Tests
 *
 * @description
 * Tests for clear console functions.
 */

import { clear, clearLine, clearLines } from '@/prompts/clear';
import { success, info } from '@/messages';

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Clear Function Tests ===' + '\n');

  // Test 1: Clear line
  console.log('Test 1: Clear line');
  process.stdout.write('This text will be cleared...');
  await delay(2000);
  clearLine();
  success('Line cleared!');

  // Test 2: Clear multiple lines
  console.log('\nTest 2: Clear multiple lines');
  console.log('Line 1');
  console.log('Line 2');
  console.log('Line 3');
  await delay(2000);
  clearLines(3);
  success('Three lines cleared!');

  // Test 3: Progress indicator with clear line
  console.log('\nTest 3: Progress indicator');
  for (let i = 0; i <= 100; i += 10) {
    clearLine();
    process.stdout.write(`Progress: ${i}%`);
    await delay(200);
  }
  clearLine();
  success('Progress complete!');

  // Test 4: Full screen clear
  console.log('\nTest 4: Full screen clear in 3 seconds...');
  await delay(3000);
  clear();
  info('Screen cleared!');
  success('You should see a clean screen now');

  console.log('\n=== All tests completed ===' + '\n');
}

// Run tests
runTests();
