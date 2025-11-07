import { text } from '@/prompts/text';
import { success, error } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Text Prompt Tests ===' + '\n');

  try {
    // Test 1: Basic text input
    console.log('Test 1: Basic text input');
    const name = await text('What is your name?');
    success(`Hello, ${name}!`);

    // Test 2: Text with default value
    console.log('\nTest 2: Text with default value');
    const city = await text('What city do you live in?', {
      default: 'New York',
    });
    success(`City: ${city}`);

    // Test 3: Required text input
    console.log('\nTest 3: Required text input');
    const email = await text('Enter your email', {
      required: true,
      validate: (value) => {
        if (!value.includes('@')) {
          return 'Please enter a valid email address';
        }
        return true;
      },
    });
    success(`Email: ${email}`);

    // Test 4: Text with length validation
    console.log('\nTest 4: Text with length validation');
    const username = await text('Choose a username (min 3 characters)', {
      required: true,
      validate: (value) => {
        if (value.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
          return 'Username must be less than 20 characters';
        }
        return true;
      },
    });
    success(`Username: ${username}`);

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests if executed directly
runTests();
