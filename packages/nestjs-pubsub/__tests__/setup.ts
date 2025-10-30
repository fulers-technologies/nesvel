/**
 * Jest setup file for NestJS PubSub tests.
 *
 * This file is executed before each test suite and sets up the testing
 * environment, including global mocks, test utilities, and configuration.
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  toBeValidMessage(received: any) {
    const pass =
      received &&
      typeof received.id === 'string' &&
      typeof received.topic === 'string' &&
      received.data !== undefined &&
      received.timestamp instanceof Date;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid message`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid message`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMessage(): R;
    }
  }
}

// Export to make this file a module
export {};
