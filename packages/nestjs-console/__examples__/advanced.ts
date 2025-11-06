/**
 * Advanced Examples
 *
 * @description
 * Advanced use cases demonstrating complex workflows, custom themes,
 * and integration patterns for the console-prompts library.
 */

import {
  text,
  select,
  multiselect,
  confirm,
  form,
  simpleSearch,
  displayTable,
  spinner,
  clear,
  clearLine,
  pause,
  success,
  error,
  info,
  warning,
  defaultTheme,
  redTheme,
  orangeTheme,
  purpleTheme,
  SpinnerType,
} from '../src';

/**
 * Simulate async operation
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Advanced Example 1: Multi-Step Wizard
 */
async function multiStepWizard() {
  console.log('\n' + defaultTheme.primary('=== MULTI-STEP PROJECT SETUP WIZARD ===') + '\n');

  // Step 1: Project Information
  info('Step 1/4: Project Information');
  const projectInfo = await form(
    [
      {
        name: 'name',
        type: 'text',
        message: 'Project name',
        required: true,
        min: 3,
      },
      {
        name: 'description',
        type: 'text',
        message: 'Project description',
      },
      {
        name: 'version',
        type: 'text',
        message: 'Initial version',
        default: '1.0.0',
      },
    ],
    { title: 'Project Information' },
  );

  // Step 2: Framework Selection
  info('\nStep 2/4: Framework Selection');
  const framework = await simpleSearch('Choose your framework', [
    { value: 'react', label: 'React', description: 'JavaScript library for UIs' },
    { value: 'vue', label: 'Vue.js', description: 'Progressive framework' },
    { value: 'angular', label: 'Angular', description: 'Full-featured framework' },
    { value: 'svelte', label: 'Svelte', description: 'Compiled framework' },
    { value: 'next', label: 'Next.js', description: 'React framework' },
    { value: 'nuxt', label: 'Nuxt', description: 'Vue framework' },
  ]);

  // Step 3: Features
  info('\nStep 3/4: Features & Tools');
  const features = await multiselect(
    'Select features to include',
    [
      { value: 'typescript', label: 'TypeScript', description: 'Type safety' },
      { value: 'eslint', label: 'ESLint', description: 'Code linting' },
      { value: 'prettier', label: 'Prettier', description: 'Code formatting' },
      { value: 'testing', label: 'Testing', description: 'Jest/Vitest' },
      { value: 'docker', label: 'Docker', description: 'Containerization' },
      { value: 'ci', label: 'CI/CD', description: 'GitHub Actions' },
    ],
    { required: true },
  );

  // Step 4: Confirmation
  info('\nStep 4/4: Review & Confirm');
  console.log('\nProject Configuration:');
  displayTable(
    [
      ['Project Name', projectInfo.name],
      ['Description', projectInfo.description || 'N/A'],
      ['Version', projectInfo.version],
      ['Framework', framework],
      ['Features', features.join(', ')],
    ],
    { header: ['Setting', 'Value'] },
  );

  const confirmed = await confirm('Create project with these settings?', {
    default: true,
  });

  if (!confirmed) {
    error('Project creation cancelled');
    return null;
  }

  // Simulate project creation with progress
  const steps = [
    'Creating project structure...',
    'Installing dependencies...',
    'Configuring tools...',
    'Initializing git repository...',
    'Setting up development environment...',
  ];

  for (const step of steps) {
    const spin = spinner(step);
    await delay(1000 + Math.random() * 1000);
    spin.succeed();
  }

  success('\nProject created successfully!');
  return { ...projectInfo, framework, features };
}

/**
 * Advanced Example 2: Theme Showcase
 */
async function themeShowcase() {
  console.log('\n' + '=== THEME SHOWCASE ===' + '\n');

  info('Demonstrating different color themes...');
  await pause();

  // Default theme
  console.log('\n' + defaultTheme.highlight('DEFAULT THEME:'));
  console.log(defaultTheme.primary('Primary color'));
  console.log(defaultTheme.success('Success color'));
  console.log(defaultTheme.error('Error color'));
  console.log(defaultTheme.warning('Warning color'));
  console.log(defaultTheme.info('Info color'));
  console.log(defaultTheme.muted('Muted color'));

  // Red theme
  console.log('\n' + redTheme.highlight('RED THEME:'));
  console.log(redTheme.primary('Primary color'));
  console.log(redTheme.success('Success color'));
  console.log(redTheme.error('Error color'));
  console.log(redTheme.warning('Warning color'));
  console.log(redTheme.info('Info color'));

  // Orange theme
  console.log('\n' + orangeTheme.highlight('ORANGE THEME:'));
  console.log(orangeTheme.primary('Primary color'));
  console.log(orangeTheme.success('Success color'));
  console.log(orangeTheme.warning('Warning color'));

  // Purple theme
  console.log('\n' + purpleTheme.highlight('PURPLE THEME:'));
  console.log(purpleTheme.primary('Primary color'));
  console.log(purpleTheme.success('Success color'));
  console.log(purpleTheme.info('Info color'));

  success('\nTheme showcase completed!');
}

/**
 * Advanced Example 3: Progress Indicator
 */
async function progressIndicator() {
  console.log('\n' + '=== CUSTOM PROGRESS INDICATOR ===' + '\n');

  info('Processing 100 items...');

  for (let i = 0; i <= 100; i += 5) {
    clearLine();
    const bars = Math.floor(i / 5);
    const spaces = 20 - bars;
    const progressBar = '█'.repeat(bars) + '░'.repeat(spaces);
    process.stdout.write(`Progress: [${progressBar}] ${i}%`);
    await delay(100);
  }

  clearLine();
  success('Processing complete! [100%]');
}

/**
 * Advanced Example 4: Database Setup Wizard
 */
async function databaseSetupWizard() {
  console.log('\n' + '=== DATABASE SETUP WIZARD ===' + '\n');

  const dbType = await select('Select database type', [
    { value: 'postgres', label: 'PostgreSQL', description: 'Robust relational DB' },
    { value: 'mysql', label: 'MySQL', description: 'Popular relational DB' },
    { value: 'mongodb', label: 'MongoDB', description: 'NoSQL document DB' },
    { value: 'redis', label: 'Redis', description: 'In-memory cache' },
  ]);

  const dbConfig = await form(
    [
      {
        name: 'host',
        type: 'text',
        message: 'Database host',
        default: 'localhost',
      },
      {
        name: 'port',
        type: 'number',
        message: 'Port',
        default: dbType === 'postgres' ? 5432 : dbType === 'mysql' ? 3306 : 27017,
      },
      {
        name: 'database',
        type: 'text',
        message: 'Database name',
        required: true,
      },
      {
        name: 'username',
        type: 'text',
        message: 'Username',
        required: true,
      },
    ],
    { title: `${dbType.toUpperCase()} Configuration` },
  );

  // Test connection
  const spin = spinner('Testing database connection...');
  await delay(2000);
  spin.succeed('Connection successful!');

  success('\nDatabase setup completed!');
  console.log('\nConnection String:');
  info(`${dbType}://${dbConfig.username}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
}

/**
 * Main Function - Run All Advanced Examples
 */
async function runAdvancedExamples() {
  try {
    const choice = await select('Choose an advanced example to run', [
      { value: '1', label: 'Multi-Step Wizard', description: 'Project setup wizard' },
      { value: '2', label: 'Theme Showcase', description: 'Display all themes' },
      { value: '3', label: 'Progress Indicator', description: 'Custom progress bar' },
      { value: '4', label: 'Database Setup', description: 'Database configuration' },
      { value: '5', label: 'Run All', description: 'Execute all examples' },
    ]);

    switch (choice) {
      case '1':
        await multiStepWizard();
        break;
      case '2':
        await themeShowcase();
        break;
      case '3':
        await progressIndicator();
        break;
      case '4':
        await databaseSetupWizard();
        break;
      case '5':
        await multiStepWizard();
        await themeShowcase();
        await progressIndicator();
        await databaseSetupWizard();
        break;
    }

    console.log('\n' + '='.repeat(60));
    success('Advanced examples completed!');
    console.log('='.repeat(60) + '\n');
  } catch (err: Error | any) {
    error(`Example failed: ${err.message}`);
    process.exit(1);
  }
}

// Run advanced examples
runAdvancedExamples();
