import { warning } from '@/messages/warning';

/**
 * Test Suite: Warning Message
 */
console.log('\n=== Testing warning() ===' + '\n');

// Test 1: Basic warning message
console.log('Test 1: Basic warning message');
warning('This action cannot be undone');

// Test 2: Warning with resource details
console.log('\nTest 2: Resource warning');
warning('Disk space running low: 15% remaining');

// Test 3: Deprecation warning
console.log('\nTest 3: Deprecation warning');
warning('This API endpoint is deprecated and will be removed in v2.0');

// Test 4: Configuration warning
console.log('\nTest 4: Configuration warning');
warning('Environment variable API_KEY is not set, using default');

// Test 5: Performance warning
console.log('\nTest 5: Performance warning');
warning('Query took 5.2s to execute. Consider adding an index.');

console.log('\n=== Warning tests completed ===' + '\n');
