import type { Config } from 'jest';
import base from '@nesvel/jest-config/nest-lib';

/**
 * Jest configuration object
 *
 * Extends base configuration with:
 * - Custom test root directory
 * - Setup files for CLI testing utilities
 * - Path aliases for console-specific modules
 */
const config: Config = {
  // Inherit base configuration from shared Jest config
  ...base,

  /**
   * Test root directories
   * Limits Jest to only search for tests in __tests__ directory
   */
  roots: ['<rootDir>/__tests__'],

  /**
   * Setup files to run after test environment is set up
   * Initializes console mocks, stdin/stdout handlers, and test utilities
   */
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  /**
   * Module name mapper for path aliases
   * Maps TypeScript path aliases to actual file locations for Jest
   * Ensures imports like '@decorators/command' resolve correctly in tests
   */
  moduleNameMapper: {
    // Config: Console configuration and options
    '^@config/(.*)$': '<rootDir>/src/config/$1',

    // Constants: CLI constants and defaults
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',

    // Decorators: Command and option decorators
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',

    // Drivers: Console output drivers (Terminal, File, etc.)
    '^@drivers/(.*)$': '<rootDir>/src/drivers/$1',

    // Enums: Console-related enumerations
    '^@enums/(.*)$': '<rootDir>/src/enums/$1',

    // Exceptions: CLI error classes
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',

    // Interfaces: Command and option interfaces
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',

    // Services: Console service implementations
    '^@services/(.*)$': '<rootDir>/src/services/$1',

    // Types: CLI type definitions
    '^@types/(.*)$': '<rootDir>/src/types/$1',

    // Utils: CLI helper functions
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;
