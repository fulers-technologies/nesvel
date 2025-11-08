import type { Config } from 'jest';

import base from './base.js';

/**
 * NestJS Application Jest Configuration
 *
 * Extends base config with NestJS application-specific settings.
 * Configured specifically for NestJS application structure and conventions.
 *
 * @type {Config}
 * @constant
 *
 * @property {string} rootDir - Root directory set to current directory (.)
 * @property {string} testRegex - Matches all .spec.ts files (NestJS convention)
 *
 * @example
 * ```typescript
 * import type { Config } from 'jest';
 * import nestApp from '@nesvel/jest-config/nest-app';
 *
 * const config: Config = {
 *   ...nestApp,
 *   setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
 * };
 *
 * export default config;
 * ```
 */
const config: Config = {
  // Inherit all base configuration settings
  // (ts-jest, Node environment, coverage, etc.)
  ...base,

  // Set root directory to current directory for test resolution
  // Allows tests to use relative paths from project root
  rootDir: '.',

  // NestJS convention: match all .spec.ts files anywhere in the project
  // This regex matches: file.spec.ts, component.spec.ts, etc.
  testRegex: '.*\\.spec\\.ts$',
};

export default config;
