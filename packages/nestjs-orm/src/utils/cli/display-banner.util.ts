import * as figlet from 'figlet';

/**
 * Display CLI Banner
 *
 * Shows a branded ASCII art banner with version information when the CLI starts.
 * Uses figlet to generate professional-looking ASCII art.
 *
 * @remarks
 * Banner display is skipped when:
 * - NESVEL_CLI_NO_BANNER environment variable is set to 'true'
 * - Running help commands (--help, -h)
 * - Running version commands (--version)
 * - Running in CI environments (when appropriate)
 *
 * @example
 * ```typescript
 * // Display banner at CLI startup
 * displayBanner();
 * ```
 *
 * @example
 * ```bash
 * # Disable banner via environment variable
 * NESVEL_CLI_NO_BANNER=true npx @nesvel/nestjs-orm migrate
 * ```
 */
export function displayBanner(): void {
  // Skip banner if explicitly disabled
  if (process.env.NESVEL_CLI_NO_BANNER === 'true') {
    return;
  }

  // Don't show banner for help or version commands
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.includes('--version')) {
    return;
  }

  // Skip banner in CI environments (unless explicitly enabled)
  if (process.env.CI === 'true' && process.env.NESVEL_CLI_BANNER !== 'true') {
    return;
  }

  const packageJson = require('../../../package.json');

  try {
    // Generate NESVEL ORM text with figlet
    const nesvelText = figlet.textSync('NESVEL  ORM', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 100,
      whitespaceBreak: true,
    });

    console.log('\n' + nesvelText);
    console.log('\n  Laravel-inspired ORM for NestJS • Powered by MikroORM');
    console.log(`  Version ${packageJson.version}\n`);
  } catch (error: Error | any) {
    // Fallback to simple banner if figlet fails
    displayFallbackBanner(packageJson.version);
  }
}

/**
 * Display fallback banner
 *
 * Used when figlet fails or is not available.
 * Provides a simple but elegant fallback design.
 *
 * @param version - Package version
 * @private
 */
function displayFallbackBanner(version: string): void {
  const banner = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║    _   _ _____ ______     _______ _         ___  ____  __  __    ║
║   | \ | | ____/ ___\ \   / / ____| |       / _ \|  _ \|  \/  |   ║
║   |  \| |  _| \___ \\ \ / /|  _| | |      | | | | |_) | |\/| |   ║
║   | |\  | |___ ___) |\ V / | |___| |___   | |_| |  _ <| |  | |   ║
║   |_| \_|_____|____/  \_/  |_____|_____|   \___/|_| \_\_|  |_|   ║
║                                                                  ║
║   Laravel-inspired ORM for NestJS • Powered by MikroORM          ║
║   Version ${version.padEnd(67)}                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`;

  console.log(banner);
}

/**
 * Display simplified CLI header
 *
 * Shows a minimal header without ASCII art, useful for CI/CD environments
 * or when a full banner is not desired.
 *
 * @example
 * ```typescript
 * displaySimpleHeader();
 * // Output: "Nesvel ORM CLI v1.0.0"
 * ```
 */
export function displaySimpleHeader(): void {
  const packageJson = require('../../../package.json');
  console.log(`\nNesvel ORM CLI v${packageJson.version}\n`);
}

/**
 * Check if banner should be displayed
 *
 * Determines whether the CLI banner should be shown based on
 * environment variables and command-line arguments.
 *
 * @returns True if banner should be displayed, false otherwise
 *
 * @example
 * ```typescript
 * if (shouldDisplayBanner()) {
 *   displayBanner();
 * }
 * ```
 */
export function shouldDisplayBanner(): boolean {
  // Check explicit disable
  if (process.env.NESVEL_CLI_NO_BANNER === 'true') {
    return false;
  }

  // Check for help/version commands
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.includes('--version')) {
    return false;
  }

  // Check CI environment (unless explicitly enabled)
  if (process.env.CI === 'true' && process.env.NESVEL_CLI_BANNER !== 'true') {
    return false;
  }

  return true;
}
