/**
 * Error Message Tests
 *
 * @description
 * Tests for the error message utility function.
 */

import { error } from '@/messages/error';

/**
 * Test Suite: Error Message
 */
console.log('\n=== Testing error() ===' + '\n');

// Test 1: Basic error message
console.log('Test 1: Basic error message');
error('Operation failed');

// Test 2: Error with details
console.log('\nTest 2: Error with details');
error('Failed to connect to database: Connection refused');

// Test 3: Validation error
console.log('\nTest 3: Validation error');
error('Invalid email format: user@example');

// Test 4: File system error
console.log('\nTest 4: File system error');
error('File not found: /path/to/config.json');

// Test 5: Authentication error
console.log('\nTest 5: Authentication error');
error('Authentication failed: Invalid credentials');

console.log('\n=== Error tests completed ===' + '\n');
