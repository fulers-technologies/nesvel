import type { Config } from 'jest';
import base from '@nesvel/jest-config/nest-lib';

/**
 * Jest configuration object
 *
 * Extends base configuration with:
 * - Custom test root directory
 * - Path aliases for logger modules
 * - Setup files for logger driver mocking
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
   * Initializes logger driver mocks (Pino, Console, File) and test utilities
   */
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  /**
   * Module name mapper for path aliases
   * Maps TypeScript path aliases to actual file locations for Jest
   * Ensures imports like '@drivers/pino' resolve correctly in tests
   */
  moduleNameMapper: {
    // Config: Logger configuration and options
    '^@config/(.*)$': '<rootDir>/src/config/$1',

    // Constants: Default log levels, DI tokens
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',

    // Decorators: Logger decorators for dependency injection
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',

    // Drivers: Logger backend implementations (Pino, Console, File)
    '^@drivers/(.*)$': '<rootDir>/src/drivers/$1',

    // Enums: Log levels and driver types
    '^@enums/(.*)$': '<rootDir>/src/enums/$1',

    // Exceptions: Logger error classes
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',

    // Interfaces: Logger and driver interfaces
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',

    // Services: Logger service implementations
    '^@services/(.*)$': '<rootDir>/src/services/$1',

    // Types: Log context and transport types
    '^@types/(.*)$': '<rootDir>/src/types/$1',

    // Utils: Log formatting and level mapping helpers
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;
