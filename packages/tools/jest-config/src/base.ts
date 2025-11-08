import type { Config } from 'jest';

/**
 * Base Jest Configuration
 *
 * Core testing configuration that can be extended by package-specific configs.
 * This configuration provides sensible defaults for TypeScript testing in Node.js.
 *
 * @type {Config}
 * @constant
 *
 * @property {string} preset - Uses ts-jest for TypeScript support
 * @property {string} testEnvironment - Node.js runtime environment
 * @property {string[]} moduleFileExtensions - Recognized file types (ts, js, json)
 * @property {string[]} testMatch - Patterns for test file discovery
 * @property {string[]} collectCoverageFrom - Files to include in coverage
 * @property {string} coverageDirectory - Output directory for coverage reports
 * @property {string[]} coverageReporters - Coverage report formats (text, lcov, html)
 * @property {boolean} clearMocks - Auto-clear mocks between tests
 * @property {boolean} verbose - Show detailed test results
 * @property {Object} transform - File transformation rules (ts-jest for .ts files)
 *
 * @example
 * ```typescript
 * import type { Config } from 'jest';
 * import base from '@nesvel/jest-config/base';
 *
 * const config: Config = {
 *   ...base,
 *   moduleNameMapper: {
 *     '^@/(.*)$': '<rootDir>/src/$1',
 *   },
 * };
 *
 * export default config;
 * ```
 */
const base: Config = {
  // Use ts-jest preset for TypeScript compilation and execution
  preset: 'ts-jest',

  // Run tests in Node.js environment (not browser/jsdom)
  testEnvironment: 'node',

  // File extensions to consider when resolving modules
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Glob patterns to discover test files
  // Matches: __tests__/**/*.spec.ts, __tests__/**/*.test.ts, **/*.spec.ts
  testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.test.ts', '**/*.spec.ts'],

  // Files to include in coverage collection
  collectCoverageFrom: [
    'src/**/*.ts', // All TypeScript source files
    '!src/**/*.interface.ts', // Exclude type definition files
    '!src/**/*.enum.ts', // Exclude enum definition files
    '!src/**/index.ts', // Exclude barrel export files
    '!src/**/*.constant.ts', // Exclude constant definition files
  ],

  // Directory where coverage reports are saved
  coverageDirectory: 'coverage',

  // Coverage report formats to generate
  // - text: Console output
  // - lcov: For CI/CD and coverage services (Codecov, Coveralls)
  // - html: Interactive HTML report
  coverageReporters: ['text', 'lcov', 'html'],

  // Automatically clear mock calls, instances, contexts, and results before every test
  clearMocks: true,

  // Display individual test results with the test suite hierarchy
  verbose: true,

  // File transformations (compilers)
  transform: {
    // Transform TypeScript files using ts-jest
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Use project's tsconfig.json for compilation settings
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};

export default base;
