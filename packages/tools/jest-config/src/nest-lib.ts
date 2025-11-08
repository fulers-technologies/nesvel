import type { Config } from 'jest';

import base from './base.js';

/**
 * NestJS Library Jest Configuration
 *
 * Pure base configuration suitable for NestJS libraries.
 * Libraries typically don't need special testing configurations
 * beyond the standard TypeScript + Node.js setup.
 *
 * @type {Config}
 * @constant
 *
 * @example
 * ```typescript
 * import type { Config } from 'jest';
 * import nestLib from '@nesvel/jest-config/nest-lib';
 *
 * const config: Config = {
 *   ...nestLib,
 *   collectCoverageFrom: [
 *     'src/**//*.ts',
 *     '!src/**//*.spec.ts',
 *   ],
 * };
 *
 * export default config;
 * ```
 */
const config: Config = {
  // Use base configuration as-is
  // Perfect for library packages that don't need app-specific settings
  ...base,
};

export default config;
