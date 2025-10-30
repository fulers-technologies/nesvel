/**
 * Full Feature Examples
 *
 * @description
 * Comprehensive examples showcasing all features of the console-prompts library.
 * Demonstrates prompts, messages, spinners, tables, and more.
 */

import {
  text,
  select,
  multiselect,
  confirm,
  number,
  password,
  form,
  displayTable,
  runWithSpinner,
  success,
  error,
  info,
  warning,
  clear,
  pause,
} from '../src';

/**
 * Simulate async operation
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main Example Function
 */
async function fullExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('FULL FEATURE EXAMPLES - Console Prompts Library');
  console.log('='.repeat(60) + '\n');

  try {
    // Example 1: User Registration Form
    info('Example 1: Complete User Registration Form');
    await pause('Press Enter to start registration');

    const userData = await form(
      [
        {
          name: 'username',
          type: 'text',
          message: 'Username',
          required: true,
          min: 3,
          max: 20,
        },
        {
          name: 'email',
          type: 'text',
          message: 'Email Address',
          required: true,
          validate: (v) => v.includes('@') || 'Must be a valid email',
        },
        {
          name: 'password',
          type: 'password',
          message: 'Password',
          required: true,
          min: 8,
        },
        {
          name: 'age',
          type: 'number',
          message: 'Age',
          min: 18,
        },
        {
          name: 'role',
          type: 'select',
          message: 'Role',
          choices: ['Admin', 'Editor', 'Viewer'],
        },
      ],
      { title: 'User Registration' },
    );

    // Simulate processing with spinner
    await runWithSpinner(
      'Creating user account...',
      async () => {
        await delay(2000);
      },
      {
        successText: 'User account created successfully!',
        errorText: 'Failed to create user account',
      },
    );

    success('Registration completed!');
    console.log('\nUser Data:');
    console.log(JSON.stringify(userData, null, 2));

    // Example 2: Multiselect with Table Display
    info('\nExample 2: Feature Selection with Results Table');
    const features = await multiselect(
      'Select features to enable',
      [
        { value: 'auth', label: 'Authentication', description: 'User auth system' },
        { value: 'db', label: 'Database', description: 'Database integration' },
        { value: 'cache', label: 'Caching', description: 'Redis caching' },
        { value: 'logs', label: 'Logging', description: 'Winston logging' },
      ],
      { required: true },
    );

    // Display selected features in a table
    const tableData = features.map((f) => [f, 'Enabled', '✓']);
    displayTable(tableData, {
      head: ['Feature', 'Status', 'Active'],
    });

    // Example 3: Number Input with Validation
    info('\nExample 3: Numeric Configuration');
    const port = await number('Enter server port', {
      default: 3000,
      min: 1024,
      max: 65535,
    });

    const workers = await number('Number of worker threads', {
      default: 4,
      min: 1,
      max: 16,
    });

    success(`Server will run on port ${port} with ${workers} workers`);

    // Example 4: Conditional Flow
    info('\nExample 4: Conditional Workflow');
    const deployEnv = await select('Select deployment environment', [
      { value: 'dev', label: 'Development', description: 'Local development' },
      { value: 'staging', label: 'Staging', description: 'Pre-production' },
      { value: 'prod', label: 'Production', description: 'Live environment' },
    ]);

    if (deployEnv === 'prod') {
      warning('You are deploying to PRODUCTION!');
      const confirmDeploy = await confirm(
        'Are you absolutely sure you want to deploy to production?',
        { default: false },
      );

      if (!confirmDeploy) {
        error('Production deployment cancelled');
        return;
      }
    }

    await runWithSpinner(
      `Deploying to ${deployEnv}...`,
      async () => {
        await delay(3000);
      },
      {
        successText: `Successfully deployed to ${deployEnv}!`,
        errorText: 'Deployment failed',
      },
    );

    // Example 5: System Status Table
    info('\nExample 5: System Status Dashboard');
    displayTable(
      [
        ['API Server', 'Running', '99.9%', '512 MB', '✓'],
        ['Database', 'Running', '99.8%', '2.1 GB', '✓'],
        ['Cache', 'Running', '100%', '256 MB', '✓'],
        ['Worker Queue', 'Idle', '98.5%', '128 MB', '✓'],
      ],
      {
        head: ['Service', 'Status', 'Uptime', 'Memory', 'Health'],
      },
    );

    console.log('\n' + '='.repeat(60));
    success('All examples completed successfully!');
    console.log('='.repeat(60) + '\n');
  } catch (err: Error | any) {
    error(`Example failed: ${err.message}`);
    process.exit(1);
  }
}

// Run examples
fullExamples();
