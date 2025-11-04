/**
 * CLI Metadata
 *
 * Provides comprehensive metadata about the CLI package for tooling and
 * documentation purposes. This information is used for help text, version
 * display, and telemetry.
 *
 * @constant
 * @readonly
 *
 * @example
 * ```typescript
 * import { CLI_METADATA } from '@/constants/cli-metadata.constant';
 *
 * console.log(`${CLI_METADATA.name} v${CLI_METADATA.version}`);
 * console.log(CLI_METADATA.description);
 * ```
 *
 * @example
 * ```typescript
 * // Display in help text
 * console.log(`
 *   ${CLI_METADATA.name}
 *   ${CLI_METADATA.description}
 *
 *   Documentation: ${CLI_METADATA.documentation}
 *   Repository: ${CLI_METADATA.repository}
 *   License: ${CLI_METADATA.license}
 * `);
 * ```
 */
export const CLI_METADATA = {
  /**
   * Package version
   *
   * The current version of the package, loaded dynamically from package.json.
   */
  version: require('../../package.json').version,

  /**
   * Package author
   *
   * The primary author/organization responsible for the package.
   */
  author: 'Nesvel Team',

  /**
   * Package license
   *
   * The license under which the package is distributed.
   */
  license: 'MIT',

  /**
   * Repository URL
   *
   * The URL to the source code repository.
   */
  repository: 'https://github.com/nesvel/nesvel',

  /**
   * Documentation URL
   *
   * The URL to the comprehensive documentation.
   */
  documentation: 'https://docs.nesvel.dev',

  /**
   * Homepage URL
   *
   * The main website/homepage for the project.
   */
  homepage: 'https://nesvel.dev',

  /**
   * Bug tracker URL
   *
   * The URL where users can report issues.
   */
  bugs: 'https://github.com/nesvel/nesvel/issues',

  /**
   * Support email
   *
   * Email address for support inquiries.
   */
  support: 'support@nesvel.dev',
} as const;

/**
 * Package Keywords
 *
 * Keywords describing the package for search and discovery.
 *
 * @constant
 */
export const PACKAGE_KEYWORDS = ['nestjs', 'cli', 'typescript'] as const;
