import { info } from '@/messages/info';

/**
 * Test Suite: Info Message
 */
console.log('\n=== Testing info() ===' + '\n');

// Test 1: Basic info message
console.log('Test 1: Basic info message');
info('This is an informational message');

// Test 2: Info message with special characters
console.log('\nTest 2: Info with special characters');
info('Database connection established: localhost:5432');

// Test 3: Info message with numbers
console.log('\nTest 3: Info with numbers');
info('Found 42 matching records');

// Test 4: Long info message
console.log('\nTest 4: Long info message');
info(
  'The system is currently processing your request. This may take several moments depending on the complexity of the operation.'
);

// Test 5: Info with emojis
console.log('\nTest 5: Info with emojis');
info('🚀 Application started successfully on port 3000');

console.log('\n=== Info tests completed ===' + '\n');
