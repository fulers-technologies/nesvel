import { password } from '@/prompts/password';
import { success, error, warning } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Password Prompt Tests ===' + '\n');

  try {
    // Test 1: Basic password input
    console.log('Test 1: Basic password input');
    const pwd1 = await password('Enter password');
    success('Password received (hidden)');

    // Test 2: Password with minimum length
    console.log('\nTest 2: Password with minimum length (8 characters)');
    const pwd2 = await password('Enter secure password', {
      minLength: 8,
    });
    success('Secure password set');

    // Test 3: Password with custom validation
    console.log('\nTest 3: Password with uppercase requirement');
    const pwd3 = await password('Enter password (must contain uppercase)', {
      minLength: 6,
      validate: (value) => {
        if (!/[A-Z]/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/[0-9]/.test(value)) {
          return 'Password must contain at least one number';
        }
        return true;
      },
    });
    success('Strong password set');

    // Test 4: Optional password
    console.log('\nTest 4: Optional password');
    const pwd4 = await password('Enter password (optional)', {
      required: false,
    });
    if (pwd4) {
      success('Password provided');
    } else {
      warning('No password provided');
    }

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
