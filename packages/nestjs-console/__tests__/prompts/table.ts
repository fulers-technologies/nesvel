/**
 * Table Tests
 *
 * @description
 * Tests for table display functionality.
 */

import { displayTable, table } from '@/prompts/table';
import { success, info } from '@/messages';

/**
 * Main Test Function
 */
function runTests() {
  console.log('\n=== Table Tests ===' + '\n');

  // Test 1: Basic table with headers
  console.log('Test 1: Basic user table');
  displayTable(
    [
      ['John Doe', 'john@example.com', 'Admin'],
      ['Jane Smith', 'jane@example.com', 'Editor'],
      ['Bob Johnson', 'bob@example.com', 'Viewer'],
    ],
    {
      head: ['Name', 'Email', 'Role'],
    },
  );

  // Test 2: Table with numbers
  console.log('Test 2: Sales data table');
  displayTable(
    [
      ['Q1 2024', 125000, 45],
      ['Q2 2024', 156000, 62],
      ['Q3 2024', 198000, 78],
      ['Q4 2024', 210000, 89],
    ],
    {
      head: ['Period', 'Revenue ($)', 'Growth (%)'],
    },
  );

  // Test 3: Status table
  console.log('Test 3: System status table');
  displayTable(
    [
      ['Web Server', 'Running', '99.9%', '0.5 GB'],
      ['Database', 'Running', '99.8%', '2.3 GB'],
      ['Cache', 'Running', '100%', '0.2 GB'],
      ['Worker', 'Stopped', '95.5%', '0.1 GB'],
    ],
    {
      head: ['Service', 'Status', 'Uptime', 'Memory'],
    },
  );

  // Test 4: Table without headers
  console.log('Test 4: Table without headers');
  displayTable([
    ['Item 1', 'Value 1'],
    ['Item 2', 'Value 2'],
    ['Item 3', 'Value 3'],
  ]);

  // Test 5: Get table as string
  console.log('Test 5: Get table as string');
  const tableStr = table(
    [
      ['Feature', 'Enabled'],
      ['Authentication', 'Yes'],
      ['Database', 'Yes'],
      ['Caching', 'No'],
    ],
    {
      head: ['Feature', 'Status'],
    },
  );
  info('Table generated as string:');
  console.log(tableStr);

  console.log('\n=== All tests completed ===' + '\n');
  success('All table tests passed');
}

// Run tests
runTests();
