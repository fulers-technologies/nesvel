import {
  handleError,
  CLI_METADATA,
  CLI_FEATURES,
  displayBanner,
  configureLogger,
  getLoggerOptions,
  getEnvironmentInfo,
  setupErrorHandlers,
  validateEnvironment,
} from '@nesvel/shared';
import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { ConsoleModule } from '@/console/console.module';

/**
 * Global logger instance for CLI operations
 *
 * @constant
 * @private
 */
const logger = new Logger('NesvelORM-CLI');

/**
 * Bootstrap CLI Application
 *
 * Main entry point for the CLI. Initializes the NestJS application context,
 * sets up error handlers, validates the environment, and runs the command.
 *
 * @async
 * @throws {Error} If bootstrap process fails
 *
 * @remarks
 * This function performs the following steps:
 * 1. Configure logger and error handlers
 * 2. Validate runtime environment
 * 3. Display CLI banner
 * 4. Initialize NestJS command factory
 * 5. Execute the requested command
 * 6. Handle cleanup and exit
 *
 * @example
 * ```typescript
 * // This function is automatically called when the CLI is invoked
 * // It handles the entire command lifecycle
 * await bootstrap();
 * ```
 */
async function bootstrap(): Promise<void> {
  try {
    // Step 1: Configure logging and error handling
    configureLogger();
    setupErrorHandlers();

    // Step 2: Validate environment
    validateEnvironment();

    // Step 3: Display banner
    displayBanner();

    // Step 4: Initialize CommandFactory with ConsoleModule
    // This creates a NestJS application context specifically for CLI commands
    logger.debug('Initializing command factory...');

    await CommandFactory.run(ConsoleModule, {
      // Use native console logger for better CLI output
      logger: getLoggerOptions(),

      // Custom error handler for command-specific errors
      errorHandler: (error: Error & { code?: string }) => {
        // Ignore help display "errors" - these are not real errors
        if (error.code === 'commander.helpDisplayed' || error.message === '(outputHelp)') {
          process.exit(0);
          return;
        }
        handleError(error, 'Command Execution', logger);
      },

      // Service options
      serviceErrorHandler: (error: Error & { code?: string }) => {
        // Ignore help display errors
        if (error.code === 'commander.helpDisplayed' || error.message === '(outputHelp)') {
          process.exit(0);
          return;
        }
        handleError(error, 'Service Error', logger);
      },

      // Enable/disable colors based on terminal support
      usePlugins: true,

      // Additional NestJS application options
      abortOnError: false, // Don't abort on help display

      // Enable command parsing
      enablePositionalOptions: true,
    });

    // Step 5: Successful completion
    logger.debug('Command completed successfully');
  } catch (error: any) {
    // Handle any bootstrap errors
    handleError(error, 'Bootstrap', logger);
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * Execute CLI Bootstrap
 *
 * This is the actual entry point when the script is run directly.
 * It calls the bootstrap function and handles any top-level errors.
 */
if (require.main === module) {
  // Log startup information in debug mode
  if (CLI_FEATURES.debug) {
    const envInfo = getEnvironmentInfo();
    logger.debug('='.repeat(60));
    logger.debug('CLI Startup Information');
    logger.debug('='.repeat(60));
    logger.debug(`Version: ${CLI_METADATA.version}`);
    logger.debug(`Node.js: ${envInfo.nodeVersion}`);
    logger.debug(`Platform: ${envInfo.platform} (${envInfo.arch})`);
    logger.debug(`Environment: ${envInfo.environment}`);
    logger.debug(`CI: ${envInfo.isCI}`);
    logger.debug(`CWD: ${envInfo.cwd}`);
    logger.debug(`Arguments: ${process.argv.slice(2).join(' ')}`);
    logger.debug(`Features: ${JSON.stringify(CLI_FEATURES, null, 2)}`);
    logger.debug('='.repeat(60));
  }

  // Start the CLI application
  bootstrap()
    .then(() => {
      // Successful execution - exit with success code
      if (CLI_FEATURES.debug) {
        logger.debug('CLI execution completed successfully');
      }
      process.exit(0);
    })
    .catch((error: any) => {
      // Fatal error during bootstrap
      handleError(error, 'Fatal Error', logger);
    });
}

// ============================================================================
// Exports for programmatic usage
// ============================================================================

/**
 * Programmatic CLI execution
 *
 * Allows the CLI to be invoked programmatically from TypeScript/JavaScript code
 * instead of only from the command line.
 *
 * @param args - Command arguments (without node and script name)
 * @returns Promise resolving when command completes
 *
 * @example
 * ```typescript
 * import { runCLI } from '@nesvel/nestjs-orm/cli';
 *
 * // Run a command programmatically
 * await runCLI(['make:model', 'User']);
 * await runCLI(['migrate']);
 * await runCLI(['db:seed', '--class=UserSeeder']);
 * ```
 */
export async function runCLI(args: string[]): Promise<void> {
  // Replace process.argv with provided arguments
  const originalArgv = process.argv;

  try {
    process.argv = [process.argv[0] || 'node', process.argv[1] || 'cli', ...args];
    await bootstrap();
  } finally {
    // Restore original argv
    process.argv = originalArgv;
  }
}
