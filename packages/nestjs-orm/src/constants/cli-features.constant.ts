/**
 * CLI Feature Flags
 *
 * Feature flags that can be enabled/disabled via environment variables
 * to control CLI behavior and experimental features. These flags provide
 * fine-grained control over CLI functionality.
 *
 * @constant
 * @readonly
 *
 * @remarks
 * All feature flags are controlled via environment variables with the
 * prefix `NESVEL_CLI_`. Set them to 'true' to enable a feature.
 *
 * @example
 * ```typescript
 * import { CLI_FEATURES } from '@/constants/cli-features.constant';
 *
 * if (CLI_FEATURES.experimental) {
 *   console.log('Experimental features are enabled!');
 * }
 * ```
 *
 * @example
 * ```bash
 * # Enable experimental features
 * NESVEL_CLI_EXPERIMENTAL=true npx @nesvel/nestjs-orm make:model User
 *
 * # Enable profiling
 * NESVEL_CLI_PROFILE=true npx @nesvel/nestjs-orm migrate
 *
 * # Enable debug mode
 * NESVEL_CLI_DEBUG=true npx @nesvel/nestjs-orm db:seed
 * ```
 */
export const CLI_FEATURES = {
  /**
   * Enable experimental commands
   *
   * When enabled, experimental and preview commands become available.
   * These features may be unstable or subject to breaking changes.
   *
   * Environment variable: `NESVEL_CLI_EXPERIMENTAL`
   *
   * @example
   * ```bash
   * NESVEL_CLI_EXPERIMENTAL=true npx @nesvel/nestjs-orm make:advanced-model User
   * ```
   */
  experimental: process.env.NESVEL_CLI_EXPERIMENTAL === 'true',

  /**
   * Enable performance profiling
   *
   * When enabled, the CLI collects and displays performance metrics
   * for command execution, including timing and resource usage.
   *
   * Environment variable: `NESVEL_CLI_PROFILE`
   *
   * @example
   * ```bash
   * NESVEL_CLI_PROFILE=true npx @nesvel/nestjs-orm migrate
   * # Output: Command completed in 1.23s (CPU: 45%, Memory: 128MB)
   * ```
   */
  profiling: process.env.NESVEL_CLI_PROFILE === 'true',

  /**
   * Enable debug mode
   *
   * When enabled, provides verbose debugging information including
   * internal state, detailed error traces, and diagnostic data.
   *
   * Environment variables: `DEBUG`, `NESVEL_CLI_DEBUG`
   *
   * @example
   * ```bash
   * NESVEL_CLI_DEBUG=true npx @nesvel/nestjs-orm db:seed
   * # Shows detailed debugging information
   * ```
   */
  debug: process.env.DEBUG === 'true' || process.env.NESVEL_CLI_DEBUG === 'true',

  /**
   * Disable telemetry
   *
   * When enabled, disables anonymous usage telemetry collection.
   * Telemetry helps improve the CLI by understanding usage patterns.
   *
   * Environment variable: `NESVEL_CLI_NO_TELEMETRY`
   *
   * @example
   * ```bash
   * NESVEL_CLI_NO_TELEMETRY=true npx @nesvel/nestjs-orm migrate
   * ```
   */
  noTelemetry: process.env.NESVEL_CLI_NO_TELEMETRY === 'true',

  /**
   * Enable auto-completion hints
   *
   * When enabled, provides command and option auto-completion hints
   * in supported terminals.
   *
   * Environment variable: `NESVEL_CLI_AUTOCOMPLETE` (default: true)
   *
   * @example
   * ```bash
   * # Disable auto-completion
   * NESVEL_CLI_AUTOCOMPLETE=false npx @nesvel/nestjs-orm
   * ```
   */
  autoComplete: process.env.NESVEL_CLI_AUTOCOMPLETE !== 'false',

  /**
   * Enable interactive prompts
   *
   * When enabled, commands may use interactive prompts for input.
   * Disable this for CI/CD environments or scripted usage.
   *
   * Environment variable: `NESVEL_CLI_INTERACTIVE` (default: true)
   *
   * @example
   * ```bash
   * # Disable interactive prompts for CI
   * NESVEL_CLI_INTERACTIVE=false npx @nesvel/nestjs-orm make:model User
   * ```
   */
  interactive: process.env.NESVEL_CLI_INTERACTIVE !== 'false' && process.env.CI !== 'true',

  /**
   * Enable colored output
   *
   * When enabled, uses colors and formatting in terminal output.
   * Automatically disabled in CI environments.
   *
   * Environment variables: `NO_COLOR`, `FORCE_COLOR`
   *
   * @example
   * ```bash
   * # Disable colors
   * NO_COLOR=true npx @nesvel/nestjs-orm migrate
   * ```
   */
  colors: process.env.NO_COLOR !== 'true' && process.env.FORCE_COLOR !== '0',

  /**
   * Enable update notifications
   *
   * When enabled, checks for CLI updates and displays notifications.
   *
   * Environment variable: `NESVEL_CLI_UPDATE_CHECK` (default: true)
   *
   * @example
   * ```bash
   * # Disable update checks
   * NESVEL_CLI_UPDATE_CHECK=false npx @nesvel/nestjs-orm migrate
   * ```
   */
  updateCheck: process.env.NESVEL_CLI_UPDATE_CHECK !== 'false',

  /**
   * Enable banner display
   *
   * When enabled, displays the CLI banner at startup.
   * Can be disabled for cleaner output in scripts.
   *
   * Environment variable: `NESVEL_CLI_NO_BANNER`
   *
   * @example
   * ```bash
   * # Disable banner
   * NESVEL_CLI_NO_BANNER=true npx @nesvel/nestjs-orm migrate
   * ```
   */
  banner: process.env.NESVEL_CLI_NO_BANNER !== 'true',
} as const;

/**
 * Check if running in CI environment
 *
 * Detects common CI environment variables to determine if
 * the CLI is running in a CI/CD pipeline.
 *
 * @constant
 */
export const IS_CI =
  process.env.CI === 'true' ||
  Boolean(process.env.GITHUB_ACTIONS) ||
  Boolean(process.env.GITLAB_CI) ||
  Boolean(process.env.CIRCLECI) ||
  Boolean(process.env.TRAVIS) ||
  Boolean(process.env.JENKINS_URL) ||
  Boolean(process.env.BITBUCKET_PIPELINE_UUID);

/**
 * Feature flag names
 *
 * List of all available feature flag names for documentation
 * and validation purposes.
 *
 * @constant
 */
export const FEATURE_FLAG_NAMES = [
  'experimental',
  'profiling',
  'debug',
  'noTelemetry',
  'autoComplete',
  'interactive',
  'colors',
  'updateCheck',
  'banner',
] as const;

/**
 * Get feature flags as a plain object
 *
 * Returns feature flags in a format suitable for logging or serialization.
 *
 * @returns Object with feature flag values
 *
 * @example
 * ```typescript
 * const features = getFeatureFlags();
 * console.log('Active features:', features);
 * ```
 */
export function getFeatureFlags(): Record<string, boolean> {
  return { ...CLI_FEATURES };
}

/**
 * Check if a specific feature is enabled
 *
 * @param featureName - Name of the feature to check
 * @returns True if feature is enabled
 *
 * @example
 * ```typescript
 * if (isFeatureEnabled('experimental')) {
 *   // Use experimental features
 * }
 * ```
 */
export function isFeatureEnabled(featureName: keyof typeof CLI_FEATURES): boolean {
  return CLI_FEATURES[featureName];
}
