import { success } from '@/messages/success';

/**
 * Test Suite: Success Message
 */
console.log('\n=== Testing success() ===' + '\n');

// Test 1: Basic success message
console.log('Test 1: Basic success message');
success('Operation completed successfully');

// Test 2: Success with action details
console.log('\nTest 2: Success with action details');
success('User account created: john.doe@example.com');

// Test 3: Success with numbers
console.log('\nTest 3: Success with numbers');
success('Saved 127 records to database');

// Test 4: File operation success
console.log('\nTest 4: File operation success');
success('File uploaded successfully: document.pdf (2.3 MB)');

// Test 5: Success with completion message
console.log('\nTest 5: Completion message');
success('Build completed in 3.2 seconds');

console.log('\n=== Success tests completed ===' + '\n');
