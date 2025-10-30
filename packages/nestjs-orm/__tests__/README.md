# NestJS ORM Test Suite

This directory contains comprehensive test suites for all components of the
`@nesvel/nestjs-orm` package. Each test file follows detailed documentation
patterns with thorough docblocks and comprehensive coverage.

## 📁 Directory Structure

### 🎯 **Decorators** (`/decorators`)

Comprehensive test suites for decorator functionality:

- `factory.decorator.spec.ts` - Tests @Factory decorator with registration,
  configuration, inheritance, and error handling
- `seeder.decorator.spec.ts` - Tests @Seeder decorator with priority,
  environments, dependencies, and advanced features

### 🏗️ **Entities** (`/entities`)

Entity integration tests with mixin combinations:

- `entity.integration.spec.ts` - Tests entity lifecycle, mixin integration,
  business logic, and serialization methods

### ⚠️ **Exceptions** (`/exceptions`)

Error handling and exception testing:

- `exceptions.spec.ts` - Tests all exception classes including
  DatabaseException, ModelNotFoundException, QueryException,
  ValidationException, and RelationshipException

### 🏭 **Factories** (`/factories`)

Factory pattern testing with Laravel-style features:

- `base-factory.spec.ts` - Comprehensive BaseFactory tests including states,
  sequences, relationships, conditional logic, and fluent API

### 🔀 **Mixins** (`/mixins`)

Mixin functionality and integration testing:

- `mixins.integration.spec.ts` - Tests all mixins individually and in
  combination: HasTimestamps, HasSoftDeletes, HasUserStamps, HasUuid

### 🗄️ **Repositories** (`/repositories`)

Repository pattern and query building tests:

- `repository.spec.ts` - Tests BaseRepository functionality, query building,
  scopes, and custom methods

### 🌱 **Seeders** (`/seeders`)

Database seeding functionality tests:

- `seeder.spec.ts` - Tests BaseSeeder with factory integration, environment
  checks, and rollback functionality

### 📝 **Interfaces** (`/interfaces`)

Type definition and contract testing:

- `interfaces.spec.ts` - Tests for interface definitions and type contracts

### 🔄 **Migrations** (`/migrations`)

Database migration testing:

- `migrations.spec.ts` - Tests for database schema operations and migration
  patterns

### 🔧 **Services** (`/services`)

Service layer integration testing:

- `services.spec.ts` - Tests service integration with repositories and business
  logic

### 📡 **Subscribers** (`/subscribers`)

Event subscriber testing:

- `subscribers.spec.ts` - Tests event handling and lifecycle event processing

## 🧪 Running Tests

### Run All Tests

```bash
# Run complete test suite
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Run Specific Categories

```bash
# Run decorator tests
npm test __tests__/decorators

# Run mixin tests
npm test __tests__/mixins

# Run factory tests
npm test __tests__/factories

# Run integration tests
npm test __tests__/entities __tests__/mixins
```

### Run Individual Test Files

```bash
# Run specific test file
npm test __tests__/decorators/factory.decorator.spec.ts

# Run with specific pattern
npm test --testNamePattern="basic factory registration"

# Run with verbose output
npm test --verbose __tests__/mixins/mixins.integration.spec.ts
```

## 📚 Test Patterns and Documentation

### Documentation Standards

Each test file includes:

- **Comprehensive docblocks** explaining purpose and coverage
- **Detailed inline comments** for complex test logic
- **Group descriptions** for related test scenarios
- **Individual test descriptions** explaining specific behaviors
- **Setup and teardown** explanations when applicable

### Test Structure Pattern

```typescript
/**
 * Test suite for [Component] functionality.
 *
 * Coverage:
 * - Feature 1 description
 * - Feature 2 description
 * - Error handling scenarios
 *
 * @module __tests__/category/component.spec
 */

describe('[Component]', () => {
  /**
   * Test group: Feature category
   *
   * Description of what this group tests.
   */
  describe('feature category', () => {
    /**
     * Test: Specific behavior
     *
     * Detailed description of what this test verifies.
     */
    it('should demonstrate specific behavior', () => {
      // Arrange - Setup test data
      // Act - Execute the behavior
      // Assert - Verify expectations
    });
  });
});
```

### Mocking and Test Doubles

The test suite uses various mocking strategies:

- **Mock classes** for external dependencies
- **Spy functions** for behavior verification
- **Test doubles** for complex integrations
- **In-memory implementations** for database operations

## 🔍 Key Test Categories

### **Unit Tests** 🟢

- Individual component functionality
- Isolated behavior testing
- Mock all external dependencies
- Fast execution and focused scope

### **Integration Tests** 🟡

- Component interaction testing
- Mixin combination scenarios
- Repository-service integration
- Cross-component communication

### **End-to-End Tests** 🔴

- Complete workflow testing
- Factory-to-database operations
- Seeder execution pipelines
- Error propagation chains

## 🎯 Coverage Targets

### Current Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

### Critical Path Coverage

Priority areas requiring high test coverage:

1. **Decorator functionality** - Core registration and configuration
2. **Mixin combinations** - All permutations of mixin usage
3. **Factory patterns** - State management and relationship handling
4. **Exception scenarios** - Error handling and recovery
5. **Repository queries** - Query building and execution

## 🛠️ Test Utilities and Helpers

### Available Test Helpers

- **Mock factories** for entity generation
- **Database test utilities** for setup/teardown
- **Assertion helpers** for complex object validation
- **Spy utilities** for behavior verification

### Custom Matchers

The test suite includes custom Jest matchers:

- `toBeValidEntity()` - Validates entity structure
- `toHaveMixinFeatures()` - Checks mixin integration
- `toMatchFactoryPattern()` - Validates factory behavior

## 🚀 Best Practices Demonstrated

### Test Organization

1. **Logical grouping** of related tests
2. **Descriptive naming** for test scenarios
3. **Consistent structure** across all test files
4. **Proper setup/teardown** management

### Testing Strategies

1. **Arrange-Act-Assert** pattern consistency
2. **Edge case coverage** for robustness
3. **Error scenario testing** for reliability
4. **Performance consideration** for large datasets

### Documentation Quality

1. **Comprehensive docblocks** for maintainability
2. **Inline explanations** for complex logic
3. **Usage examples** in test descriptions
4. **Cross-references** to related components

## 🔄 Continuous Integration

### CI Pipeline Integration

Tests are integrated with:

- **Pre-commit hooks** for code quality
- **Pull request validation** for safety
- **Coverage reporting** for metrics
- **Performance benchmarks** for regressions

### Quality Gates

- All tests must pass before merge
- Coverage thresholds must be met
- No test skipping without justification
- Performance regression checks

## 📖 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices Guide](../docs/testing-best-practices.md)
- [Mocking Strategies](../docs/mocking-strategies.md)
- [Coverage Analysis](../docs/coverage-analysis.md)

---

This comprehensive test suite ensures the reliability, maintainability, and
robustness of the NestJS ORM package through thorough testing of all components
and their interactions.
