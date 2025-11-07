import { text, select, confirm, success, error, info, warning } from '@/';

/**
 * Main Example Function
 */
async function basicExamples() {
  console.log('\n' + '='.repeat(50));
  console.log('BASIC EXAMPLES - Console Prompts Library');
  console.log('='.repeat(50) + '\n');

  try {
    // Example 1: Simple text input
    info('Example 1: Text Input');
    const name = await text('What is your name?', {
      default: 'Guest',
    });
    success(`Welcome, ${name}!`);

    // Example 2: Selection
    info('\nExample 2: Select from options');
    const color = await select('Choose your favorite color', ['Red', 'Blue', 'Green', 'Yellow']);
    success(`You selected: ${color}`);

    // Example 3: Confirmation
    info('\nExample 3: Yes/No confirmation');
    const confirmed = await confirm('Do you want to continue?', {
      default: true,
    });

    if (confirmed) {
      success('Great! Continuing...');
    } else {
      warning('Operation cancelled');
    }

    // Example 4: All message types
    console.log('\nExample 4: Message Types');
    info('This is an informational message');
    success('This is a success message');
    warning('This is a warning message');
    error('This is an error message');

    console.log('\n' + '='.repeat(50));
    success('Basic examples completed!');
    console.log('='.repeat(50) + '\n');
  } catch (err: Error | any) {
    error(`Example failed: ${err.message}`);
    process.exit(1);
  }
}

// Run examples
basicExamples();
