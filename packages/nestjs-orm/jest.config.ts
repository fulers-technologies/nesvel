import type { Config } from 'jest';
import base from '@nesvel/jest-config/nest-lib';

/**
 * Jest configuration object
 *
 * Extends base configuration with:
 * - Custom coverage collection rules
 * - Path aliases for ORM-specific modules
 * - Transform patterns for ESM dependencies
 */
const config: Config = {
  // Inherit base configuration from shared Jest config
  ...base,

  /**
   * Coverage collection patterns
   * Collects coverage from all TypeScript files except:
   * - Interface files (type-only, no runtime code)
   * - Enum files (simple enumerations)
   * - Index files (re-exports only)
   * - Constant files (static values)
   * - Example files (documentation)
   */
  collectCoverageFrom: [
    'src/**/*.ts', // Include all TypeScript files
    '!src/**/*.interface.ts', // Exclude interfaces
    '!src/**/*.enum.ts', // Exclude enums
    '!src/**/index.ts', // Exclude index files
    '!src/**/*.constant.ts', // Exclude constants
    '!src/**/examples.ts', // Exclude examples
  ],

  /**
   * Module name mapper for path aliases
   * Maps TypeScript path aliases to actual file locations for Jest
   * Supports both file-level (@/path) and folder-level (@repositories) aliases
   */
  moduleNameMapper: {
    // Root alias: Direct access to src folder
    '^@/(.*)$': '<rootDir>/src/$1',

    // Repositories: Database repositories with specific imports
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@repositories$': '<rootDir>/src/repositories',

    // Services: ORM service implementations
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@services$': '<rootDir>/src/services',

    // Entities: Database entities/models
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@entities$': '<rootDir>/src/entities',

    // Exceptions: ORM error classes
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
    '^@exceptions$': '<rootDir>/src/exceptions',

    // Subscribers: Entity event subscribers
    '^@subscribers/(.*)$': '<rootDir>/src/subscribers/$1',
    '^@subscribers$': '<rootDir>/src/subscribers',

    // Migrations: Database migrations
    '^@migrations/(.*)$': '<rootDir>/src/migrations/$1',
    '^@migrations$': '<rootDir>/src/migrations',

    // Interfaces: TypeScript interfaces
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@interfaces$': '<rootDir>/src/interfaces',

    // Types: Type definitions
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@types$': '<rootDir>/src/types',

    // Utils: Helper functions
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@utils$': '<rootDir>/src/utils',
  },

  /**
   * Setup files to run after test environment is set up
   * Initializes database mocks, test fixtures, and utilities
   */
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  /**
   * Transform ignore patterns
   * Transforms uuid package from node_modules (ESM dependency)
   * Allows Jest to process this ESM module correctly
   */
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
};

export default config;
