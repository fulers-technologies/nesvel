import {
  setTheme,
  resetTheme,
  getAvailableThemes,
  ThemeType,
  SpinnerType,
  success,
  error,
  warning,
  info,
  spinner,
  runWithSpinner,
  displayTable,
  text,
  select,
  pause,
} from '../src';

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Demonstrate Messages with Different Themes
 */
async function demonstrateThemes() {
  console.log('\\n' + '='.repeat(60));
  console.log('THEME SYSTEM DEMONSTRATION');
  console.log('='.repeat(60) + '\\n');

  const themes = getAvailableThemes();

  for (const themeType of themes) {
    // Set the theme
    setTheme(themeType);

    console.log(`\\n--- ${themeType.toUpperCase()} THEME ---\\n`);

    // Show all message types
    success(`Success message in ${themeType} theme`);
    error(`Error message in ${themeType} theme`);
    warning(`Warning message in ${themeType} theme`);
    info(`Info message in ${themeType} theme`);

    // Small delay for readability
    await delay(800);
  }

  // Reset to default
  resetTheme();
  console.log('\\n\\nTheme reset to default\\n');
}

/**
 * Demonstrate Spinner Types
 */
async function demonstrateSpinners() {
  console.log('\\n' + '='.repeat(60));
  console.log('SPINNER TYPES DEMONSTRATION');
  console.log('='.repeat(60) + '\\n');

  const spinnerTypes: SpinnerType[] = [
    SpinnerType.DOTS,
    SpinnerType.DOTS2,
    SpinnerType.DOTS3,
    SpinnerType.LINE,
    SpinnerType.CIRCLE,
    SpinnerType.ARROW,
  ];

  for (const spinnerType of spinnerTypes) {
    info(`Testing spinner type: ${spinnerType}`);

    const spin = spinner(`Loading with ${spinnerType}...`, { type: spinnerType });
    await delay(1500);
    spin.succeed(`${spinnerType} spinner complete`);

    await delay(500);
  }
}

/**
 * Demonstrate Theme with Spinner
 */
async function demonstrateThemeWithSpinner() {
  console.log('\\n' + '='.repeat(60));
  console.log('THEMES + SPINNERS COMBINATION');
  console.log('='.repeat(60) + '\\n');

  // Red theme with dots3 spinner
  setTheme(ThemeType.RED);
  info('Using RED theme with DOTS3 spinner');
  await runWithSpinner(
    'Critical operation in progress',
    async () => {
      await delay(1500);
    },
    {
      successText: 'Critical operation completed!',
      errorText: 'Critical operation failed',
      spinnerType: SpinnerType.DOTS3,
    },
  );

  await delay(300);

  // Orange theme with line spinner
  setTheme(ThemeType.ORANGE);
  warning('Using ORANGE theme with LINE spinner');
  await runWithSpinner(
    'Processing with orange theme',
    async () => {
      await delay(1500);
    },
    {
      successText: 'Processing complete!',
      errorText: 'Processing failed',
      spinnerType: SpinnerType.LINE,
    },
  );

  await delay(300);

  // Purple theme with star spinner
  setTheme(ThemeType.PURPLE);
  info('Using PURPLE theme with STAR spinner');
  await runWithSpinner(
    'Creative task running',
    async () => {
      await delay(1500);
    },
    {
      successText: 'Creative task complete!',
      errorText: 'Creative task failed',
      spinnerType: SpinnerType.STAR,
    },
  );

  resetTheme();
}

/**
 * Demonstrate Theme with Table
 */
function demonstrateThemeWithTable() {
  console.log('\\n' + '='.repeat(60));
  console.log('THEMES WITH TABLES');
  console.log('='.repeat(60) + '\\n');

  const themes: ThemeType[] = [ThemeType.DEFAULT, ThemeType.RED, ThemeType.PURPLE];

  for (const themeType of themes) {
    setTheme(themeType);

    info(`Table with ${themeType.toUpperCase()} theme:`);
    displayTable(
      [
        ['Feature', 'Enabled'],
        ['Theme System', 'Yes'],
        ['Spinner Types', 'Yes'],
        ['Custom Colors', 'Yes'],
      ],
      {
        header: ['Setting', 'Status'],
      },
    );
  }

  resetTheme();
}

/**
 * Interactive Theme Selector
 */
async function interactiveThemeDemo() {
  console.log('\\n' + '='.repeat(60));
  console.log('INTERACTIVE THEME DEMO');
  console.log('='.repeat(60) + '\\n');

  info('You can now select a theme interactively!');

  const selectedTheme = await select<ThemeType>('Choose a theme to try', [
    {
      value: ThemeType.DEFAULT,
      label: 'Default (Cyan/Green)',
      description: 'Professional default theme',
    },
    { value: ThemeType.RED, label: 'Red', description: 'Bold and critical' },
    { value: ThemeType.ORANGE, label: 'Orange', description: 'Warm and friendly' },
    { value: ThemeType.PURPLE, label: 'Purple', description: 'Creative and vibrant' },
  ]);

  // Apply selected theme
  setTheme(selectedTheme);

  success(`Theme changed to ${selectedTheme}!`);
  info('All messages will now use this theme');
  warning('Including warnings');
  error('And errors');

  await pause('\\nPress Enter to see a spinner in this theme');

  const spin = spinner('Working...', { type: SpinnerType.DOTS3 });
  await delay(2000);
  spin.succeed('Done!');

  resetTheme();
  info('Theme reset to default');
}

/**
 * Main Function
 */
async function main() {
  try {
    const demo = await select('What would you like to see?', [
      { value: '1', label: 'All Theme Styles', description: 'Show all 4 themes' },
      { value: '2', label: 'Spinner Types', description: 'Show different spinner animations' },
      { value: '3', label: 'Themes + Spinners', description: 'Combine themes with spinners' },
      { value: '4', label: 'Themes with Tables', description: 'See themed tables' },
      { value: '5', label: 'Interactive Demo', description: 'Choose your own theme' },
      { value: '6', label: 'Run All', description: 'Show everything' },
    ]);

    switch (demo) {
      case '1':
        await demonstrateThemes();
        break;
      case '2':
        await demonstrateSpinners();
        break;
      case '3':
        await demonstrateThemeWithSpinner();
        break;
      case '4':
        demonstrateThemeWithTable();
        break;
      case '5':
        await interactiveThemeDemo();
        break;
      case '6':
        await demonstrateThemes();
        await demonstrateSpinners();
        await demonstrateThemeWithSpinner();
        demonstrateThemeWithTable();
        await interactiveThemeDemo();
        break;
    }

    console.log('\\n' + '='.repeat(60));
    success('Theme demonstration complete!');
    console.log('='.repeat(60) + '\\n');
  } catch (err: Error | any) {
    error(`Demo failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the demo
main();
