/**
 * Jest Setup File
 *
 * Global test configuration and setup for the ORM package tests.
 * This file is loaded before each test suite runs.
 */

// Set test timeout
jest.setTimeout(30000);

// Mock process.env
process.env.NODE_ENV = 'test';

// Setup global mocks that might be needed across tests
beforeEach(() => {
  // Reset all mocks before each test
});

afterEach(() => {
  // Clean up after each test
});
