import { Logger } from '@nestjs/common';

/**
 * Logger instance for validation messages
 *
 * @constant
 * @private
 */
const logger = new Logger('NesvelORM-CLI');

/**
 * Minimum required Node.js major version
 *
 * @constant
 */
export const MINIMUM_NODE_VERSION = 20;

/**
 * Validate Environment
 *
 * Performs comprehensive environment validation to ensure the CLI can run properly.
 * Checks for required Node.js version and critical environment configurations.
 *
 * @throws {Error} If environment validation fails
 *
 * @remarks
 * This function validates:
 * - Node.js version (minimum v20)
 * - Production environment warnings
 * - Critical environment variables
 * - File system permissions (if needed)
 *
 * @example
 * ```typescript
 * try {
 *   validateEnvironment();
 *   // Environment is valid, proceed
 * } catch (error: Error | any) {
 *   console.error('Environment validation failed:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
export function validateEnvironment(): void {
  // Validate Node.js version
  validateNodeVersion();

  // Warn if running in production
  warnIfProduction();

  // Validate critical environment variables
  validateEnvironmentVariables();

  logger.debug('✓ Environment validation passed');
}

/**
 * Validate Node.js Version
 *
 * Checks if the current Node.js version meets the minimum requirements.
 *
 * @throws {Error} If Node.js version is below the minimum required
 *
 * @example
 * ```typescript
 * validateNodeVersion(); // Throws if version < 20
 * ```
 */
export function validateNodeVersion(): void {
  const nodeVersion = process.versions.node;
  const majorVersion = parseInt(nodeVersion.split('.')[0], 10);

  if (majorVersion < MINIMUM_NODE_VERSION) {
    throw new Error(
      `Node.js version ${nodeVersion} is not supported. ` +
        `Please upgrade to Node.js ${MINIMUM_NODE_VERSION} or higher.\n` +
        `Current version: ${nodeVersion}\n` +
        `Required version: >=${MINIMUM_NODE_VERSION}.0.0`,
    );
  }

  logger.debug(`✓ Node.js version check passed (v${nodeVersion})`);
}

/**
 * Warn if running in production environment
 *
 * Displays warnings when running CLI commands in production environment
 * without explicit acknowledgment via --force flag.
 *
 * @remarks
 * Does not throw an error, only displays warnings to make users aware
 * of potentially dangerous operations in production.
 */
export function warnIfProduction(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasForceFlag = process.argv.includes('--force');

  if (isProduction && !hasForceFlag) {
    logger.warn('⚠️  Running CLI in production environment');
    logger.warn('   Use --force flag to bypass safety checks');
    logger.warn('   Some operations may be restricted for safety');
  }
}

/**
 * Validate critical environment variables
 *
 * Checks for required environment variables and validates their values.
 * Add any critical environment variable validations here.
 *
 * @throws {Error} If required environment variables are missing or invalid
 *
 * @example
 * ```typescript
 * validateEnvironmentVariables();
 * ```
 */
export function validateEnvironmentVariables(): void {
  // Add validation for critical environment variables
  // Example:
  // if (!process.env.DATABASE_URL) {
  //   throw new Error('DATABASE_URL environment variable is required');
  // }

  // Validate NODE_ENV if set
  if (process.env.NODE_ENV) {
    const validEnvironments = ['development', 'production', 'test', 'staging'];
    if (!validEnvironments.includes(process.env.NODE_ENV)) {
      logger.warn(
        `⚠️  NODE_ENV="${process.env.NODE_ENV}" is not a standard value. ` +
          `Expected one of: ${validEnvironments.join(', ')}`,
      );
    }
  }

  logger.debug('✓ Environment variables check passed');
}

/**
 * Check if running in CI environment
 *
 * Detects if the CLI is running in a CI/CD environment based on
 * common CI environment variables.
 *
 * @returns True if running in CI environment
 *
 * @example
 * ```typescript
 * if (isCI()) {
 *   // Adjust behavior for CI environment
 *   console.log('Running in CI mode');
 * }
 * ```
 */
export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    Boolean(process.env.GITHUB_ACTIONS) ||
    Boolean(process.env.GITLAB_CI) ||
    Boolean(process.env.CIRCLECI) ||
    Boolean(process.env.TRAVIS) ||
    Boolean(process.env.JENKINS_URL) ||
    Boolean(process.env.BITBUCKET_PIPELINE_UUID)
  );
}

/**
 * Get environment information
 *
 * Returns detailed information about the current environment
 * for debugging and diagnostic purposes.
 *
 * @returns Object containing environment details
 *
 * @example
 * ```typescript
 * const envInfo = getEnvironmentInfo();
 * console.log('Running on:', envInfo.platform);
 * console.log('Node.js:', envInfo.nodeVersion);
 * ```
 */
export function getEnvironmentInfo(): {
  nodeVersion: string;
  platform: string;
  arch: string;
  isCI: boolean;
  environment: string;
  cwd: string;
} {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    isCI: isCI(),
    environment: process.env.NODE_ENV || 'development',
    cwd: process.cwd(),
  };
}

/**
 * Validate file system permissions
 *
 * Checks if the CLI has necessary permissions to perform file operations
 * in the current working directory.
 *
 * @param directory - Directory to check (defaults to current working directory)
 * @throws {Error} If file system permissions are insufficient
 *
 * @example
 * ```typescript
 * validateFileSystemPermissions(); // Check current directory
 * validateFileSystemPermissions('/custom/path'); // Check specific directory
 * ```
 */
export function validateFileSystemPermissions(directory?: string): void {
  const fs = require('fs');
  const path = require('path');

  const targetDir = directory || process.cwd();

  try {
    // Check if directory exists and is readable
    fs.accessSync(targetDir, fs.constants.R_OK);

    // Check if directory is writable
    fs.accessSync(targetDir, fs.constants.W_OK);

    logger.debug(`✓ File system permissions check passed for: ${targetDir}`);
  } catch (error: any) {
    throw new Error(
      `Insufficient file system permissions for directory: ${targetDir}\n` +
        `Error: ${error.message}\n` +
        `Please ensure you have read and write permissions.`,
    );
  }
}
