# Contributing to NestJS Swagger

First off, thank you for considering contributing to NestJS Swagger! It's people
like you that make this package better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of
Conduct. By participating, you are expected to uphold this code. Please report
unacceptable behavior to the project maintainers.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for
everyone, regardless of age, body size, disability, ethnicity, gender identity
and expression, level of experience, nationality, personal appearance, race,
religion, or sexual identity and orientation.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **Bun** (v1.3.1 or higher)
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/nesvel.git
cd nesvel/packages/nestjs-swagger
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/YOUR_USERNAME/nesvel.git
```

---

## Development Setup

### Install Dependencies

```bash
bun install
```

### Build the Project

```bash
bun run build
```

### Run Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun run test:cov

# Run tests in watch mode
bun run test:watch
```

### Run Linter

```bash
bun run lint
```

### Format Code

```bash
bun run format
```

---

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid
duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
**Describe the bug** A clear and concise description of what the bug is.

**To Reproduce** Steps to reproduce the behavior:

1. Configure module with '...'
2. Call method '....'
3. See error

**Expected behavior** A clear and concise description of what you expected to
happen.

**Environment:**

- OS: [e.g. Ubuntu 22.04, macOS 14]
- Node.js version: [e.g. 20.x]
- Bun version: [e.g. 1.3.1]
- Package version: [e.g. 1.0.0]
- NestJS version: [e.g. 11.x]

**Additional context** Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an
enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Adding New Features

To add new features to the Swagger module:

1. Create or modify services in `src/services/`
2. Update interfaces in `src/interfaces/` if needed
3. Add comprehensive tests
4. Update documentation
5. Add usage examples

**Feature Implementation Checklist:**

- [ ] Follows existing architecture patterns
- [ ] Type-safe with proper TypeScript interfaces
- [ ] Includes error handling
- [ ] Has comprehensive test coverage
- [ ] Documented with JSDoc comments
- [ ] Examples added to README
- [ ] CHANGELOG updated

---

## Coding Standards

### TypeScript Style Guide

We follow the
[TypeScript Deep Dive Style Guide](https://basarat.gitbook.io/typescript/styleguide)
with some modifications:

#### Naming Conventions

- **Classes**: PascalCase (e.g., `PubSubService`)
- **Interfaces**: PascalCase (e.g., `SwaggerConfig`)
- **Functions/Methods**: camelCase (e.g., `setupSwagger`)
- **Variables**: camelCase (e.g., `messageHandler`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SWAGGER_UI_OPTIONS`)
- **Private members**: camelCase with `_` prefix (e.g., `_driver`)

#### File Naming

- **Classes**: kebab-case (e.g., `swagger-builder.service.ts`)
- **Interfaces**: kebab-case with `.interface` suffix (e.g.,
  `swagger-config.interface.ts`)
- **Constants**: kebab-case with `.constant` suffix (e.g.,
  `swagger.constants.ts`)
- **Tests**: kebab-case with `.spec` suffix (e.g., `swagger-builder.service.spec.ts`)

#### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { Injectable } from '@nestjs/common';
import { SwaggerConfig } from '../interfaces';

// 2. Constants
const DEFAULT_TIMEOUT = 5000;

// 3. Interfaces/Types
interface InternalConfig {
  timeout: number;
}

// 4. Class implementation
@Injectable()
export class MyService {
  // 4.1 Private properties
  private readonly _config: InternalConfig;

  // 4.2 Constructor
  constructor() {
    this._config = { timeout: DEFAULT_TIMEOUT };
  }

  // 4.3 Public methods
  public async connect(): Promise<void> {
    // Implementation
  }

  // 4.4 Private methods
  private validateConfig(): void {
    // Implementation
  }
}
```

### Documentation Standards

#### JSDoc Comments

All public APIs must have comprehensive JSDoc comments:

````typescript
/**
 * Sets up Swagger documentation for the application.
 *
 * This method configures the Swagger UI and OpenAPI documentation
 * endpoint based on the provided configuration. It applies authentication
 * schemes, custom styling, and other options.
 *
 * @param app - The NestJS application instance
 * @param config - Swagger configuration options
 *
 * @returns void
 *
 * @example
 * ```typescript
 * const swaggerSetup = app.get(SwaggerSetupService);
 * swaggerSetup.setup(app, {
 *   title: 'My API',
 *   path: 'api/docs'
 * });
 * ```
 */
setup(app: INestApplication, config: SwaggerConfig): void {
  // Implementation
}
````

#### Inline Comments

Use inline comments to explain complex logic:

```typescript
// Calculate exponential backoff with jitter to prevent thundering herd
const backoff = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
```

---

## Testing Guidelines

### Test Structure

Tests should follow the Arrange-Act-Assert (AAA) pattern:

```typescript
it('should setup swagger documentation', () => {
  // Arrange
  const config = {
    title: 'Test API',
    path: 'docs'
  };

  // Act
  service.setup(app, config);

  // Assert
  expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', app, expect.any(Object));
});
```

### Test Coverage Requirements

- **Minimum coverage**: 90% for all metrics (lines, branches, functions,
  statements)
- **New features**: Must have 100% coverage
- **Bug fixes**: Must include regression tests

### Test Documentation

All tests must include comprehensive docblocks:

```typescript
/**
 * Test: Successful Swagger setup
 *
 * Ensures that when Swagger is configured, the module is set up
 * with the correct parameters and options.
 */
it('should setup swagger documentation', () => {
  // Test implementation
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test swagger-builder.service.spec.ts

# Run tests with coverage
bun run test:cov

# Run tests in watch mode
bun run test:watch
```

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/)
specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(ui): add custom theme support

Implement custom theme configuration for Swagger UI with
support for CSS variables and custom styling options.

Closes #123
```

```
fix(auth): handle missing auth scheme gracefully

Previously, missing authentication schemes would cause errors.
Now they are handled with proper defaults and warnings.

Fixes #456
```

```
docs(readme): update installation instructions

Add instructions for installing optional peer dependencies
and clarify driver selection process.
```

---

## Pull Request Process

### Before Submitting

1. **Update your fork** with the latest upstream changes:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run all checks**:

```bash
bun run lint
bun run format
bun test
bun run build
```

3. **Update documentation** if you've changed APIs or added features

4. **Add tests** for new functionality

5. **Update CHANGELOG.md** with your changes

### Submitting the PR

1. Push your changes to your fork:

```bash
git push origin feature/my-feature
```

2. Create a Pull Request on GitHub

3. Fill out the PR template completely

4. Link any related issues

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to
      not work as expected)
- [ ] Documentation update

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Testing

Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)

Add screenshots to help explain your changes.
```

### Review Process

1. At least one maintainer must approve the PR
2. All CI checks must pass
3. Code coverage must not decrease
4. Documentation must be updated
5. CHANGELOG must be updated

### After Approval

Once approved, a maintainer will merge your PR. Thank you for your contribution!

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion

### Getting Help

If you need help with your contribution:

1. Check the [README](./README.md)
2. Search existing GitHub issues
3. Ask in GitHub Discussions

---

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- The [CONTRIBUTORS.md](./CONTRIBUTORS.md) file

---

## License

By contributing to NestJS Swagger, you agree that your contributions will be
licensed under the MIT License.

---

Thank you for contributing to NestJS Swagger! 🎉
