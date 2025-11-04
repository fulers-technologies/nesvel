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
import { Logger, Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { SearchModule } from './search.module';
import type { SearchModuleOptions } from './interfaces';

/**
 * Global logger instance for CLI operations
 *
 * @constant
 * @private
 */
const logger = new Logger('NesvelSearch-CLI');

/**
 * Load search configuration from file
 *
 * @param configPath - Path to the configuration file
 * @returns SearchModuleOptions object
 * @throws {Error} If config file doesn't exist or is invalid
 */
function loadConfig(configPath: string): SearchModuleOptions {
  const absolutePath = resolve(process.cwd(), configPath);

  if (!existsSync(absolutePath)) {
    throw new Error(
      `Configuration file not found: ${absolutePath}\n\n` +
        `Please provide a valid config file path using --config flag.\n` +
        `Example: nesvel-search --config=search.config.js index:list`,
    );
  }

  logger.debug(`Loading configuration from: ${absolutePath}`);

  try {
    // Support both .js and .json files
    let config: SearchModuleOptions;

    if (absolutePath.endsWith('.json')) {
      const content = readFileSync(absolutePath, 'utf-8');
      config = JSON.parse(content);
    } else if (
      absolutePath.endsWith('.ts') ||
      absolutePath.endsWith('.mts') ||
      absolutePath.endsWith('.cts')
    ) {
      // Use jiti for TypeScript files (like tsup, jest, etc.)
      try {
        // Dynamic import of jiti to avoid bundling it
        const jiti = require('jiti')(__filename, { esmResolve: true });
        const required = jiti(absolutePath);
        
        // Extract config - check in order of preference
        // Note: jiti may add a 'default' property for module interop
        if (required.default?.connection) {
          // required.default is the actual config object
          config = required.default;
        } else if (required.default?.searchConfig) {
          // required.default is a module wrapper with searchConfig property
          config = required.default.searchConfig;
        } else if (required.searchConfig) {
          config = required.searchConfig;
        } else if (required.config) {
          config = required.config;
        } else if (required.connection) {
          // Direct config object
          config = required;
        } else {
          throw new Error(
            'Could not find search config. Please export one of: default, searchConfig, or config',
          );
        }
      } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('jiti')) {
          throw new Error(
            `TypeScript config files require "jiti" to be installed.\n` +
              `Install it with: bun add -D jiti\n\n` +
              `Alternatively, use a .js config file instead.`,
          );
        }
        throw error;
      }
    } else {
      // Support .js, .cjs, .mjs files
      delete require.cache[absolutePath]; // Clear cache
      const required = require(absolutePath);

      // Handle different export formats:
      // - module.exports = { ... }           -> required
      // - module.exports.default = { ... }   -> required.default
      // - export default { ... }             -> required.default
      // - export const searchConfig = { ... } -> required.searchConfig
      // - exports.searchConfig = { ... }     -> required.searchConfig
      config = required.default || required.searchConfig || required.config || required;
    }

    logger.debug('Configuration loaded successfully');
    return config;
  } catch (error: any) {
    throw new Error(
      `Failed to load configuration file: ${error.message}\n\n` +
        `Make sure your config file exports a valid SearchModuleOptions object.\n` +
        `Supported formats:\n` +
        `  - module.exports = { ... }\n` +
        `  - export default { ... }\n` +
        `  - export const searchConfig = { ... }\n` +
        `  - export const config = { ... }\n\n` +
        `Supported file types: .js, .cjs, .mjs, .ts, .mts, .cts, .json\n` +
        `Note: TypeScript files require "jiti" to be installed (bun add -D jiti).`,
    );
  }
}

/**
 * Parse config path from command line arguments
 *
 * @returns Config file path or undefined if not provided
 */
function getConfigPath(): string | undefined {
  const configArg = process.argv.find((arg) => arg.startsWith('--config'));
  if (!configArg) return undefined;

  // Support both --config=path and --config path formats
  if (configArg.includes('=')) {
    return configArg.split('=')[1];
  }

  const configIndex = process.argv.indexOf(configArg);
  return process.argv[configIndex + 1];
}

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
 * 4. Load search configuration (if --config provided)
 * 5. Initialize NestJS command factory with dynamic module
 * 6. Execute the requested command
 * 7. Handle cleanup and exit
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

    // Step 4: Load configuration if provided
    let CLIModule: any;
    const configPath = getConfigPath();

    if (configPath) {
      const config = loadConfig(configPath);
      logger.debug('Creating dynamic SearchModule with configuration');

      // Create a root module that imports SearchModule.forRoot()
      @Module({
        imports: [SearchModule.forRoot(config)],
      })
      class SearchCLIModule {}

      CLIModule = SearchCLIModule;
    } else {
      // No config provided - use bare SearchModule (only help command will work)
      logger.debug('No config provided - only help command will be available');
      CLIModule = SearchModule;
    }

    // Step 5: Filter out --config from argv to prevent commander errors
    const originalArgv = process.argv;
    if (configPath) {
      // Remove --config and its value from argv
      process.argv = process.argv.filter((arg, index, arr) => {
        // Remove --config=value format
        if (arg.startsWith('--config')) return false;
        // Remove value after --config flag
        if (index > 0 && arr[index - 1] === '--config') return false;
        return true;
      });
    }

    // Step 6: Initialize CommandFactory with dynamic module
    // This creates a NestJS application context specifically for CLI commands
    logger.debug('Initializing command factory...');

    await CommandFactory.run(CLIModule, {
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
