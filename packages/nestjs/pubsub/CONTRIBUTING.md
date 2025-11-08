# Contributing to NestJS PubSub

First off, thank you for considering contributing to NestJS PubSub! It's people
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
unacceptable behavior to
[conduct@nestjs-pubsub.dev](mailto:conduct@nestjs-pubsub.dev).

### Our Pledge

We pledge to make participation in our project a harassment-free experience for
everyone, regardless of age, body size, disability, ethnicity, gender identity
and expression, level of experience, nationality, personal appearance, race,
religion, or sexual identity and orientation.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **pnpm** (v8 or higher)
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/nestjs-pubsub.git
cd nestjs-pubsub
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/fulers-technologies/nestjs-pubsub.git
```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
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

- OS: [e.g. Ubuntu 22.04]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 1.0.0]
- Driver: [e.g. Redis, Kafka]

**Additional context** Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an
enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Adding New Drivers

To add support for a new messaging backend:

1. Create a new directory under `src/drivers/[driver-name]/`
2. Implement the `IPubSubDriver` interface
3. Create driver-specific options interface
4. Add comprehensive tests
5. Update documentation
6. Add example usage

**Driver Implementation Checklist:**

- [ ] Implements `IPubSubDriver` interface
- [ ] Handles connection lifecycle
- [ ] Supports publish/subscribe operations
- [ ] Includes error handling
- [ ] Has 100% test coverage
- [ ] Documented with JSDoc comments
- [ ] Example added to `__examples__/`
- [ ] README updated

---

## Coding Standards

### TypeScript Style Guide

We follow the
[TypeScript Deep Dive Style Guide](https://basarat.gitbook.io/typescript/styleguide)
with some modifications:

#### Naming Conventions

- **Classes**: PascalCase (e.g., `PubSubService`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IPubSubDriver`)
- **Enums**: PascalCase (e.g., `PubSubDriverType`)
- **Functions/Methods**: camelCase (e.g., `publishMessage`)
- **Variables**: camelCase (e.g., `messageHandler`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `PUBSUB_SERVICE`)
- **Private members**: camelCase with `_` prefix (e.g., `_driver`)

#### File Naming

- **Classes**: kebab-case (e.g., `pubsub.service.ts`)
- **Interfaces**: kebab-case with `.interface` suffix (e.g.,
  `pubsub-driver.interface.ts`)
- **Enums**: kebab-case with `.enum` suffix (e.g., `pubsub-driver-type.enum.ts`)
- **Constants**: kebab-case with `.constant` suffix (e.g.,
  `pubsub-service.constant.ts`)
- **Tests**: kebab-case with `.spec` suffix (e.g., `pubsub.service.spec.ts`)

#### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { Injectable } from '@nestjs/common';
import { IPubSubDriver } from '@interfaces/pubsub-driver.interface';

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
  constructor(private readonly driver: IPubSubDriver) {
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
 * Publishes a message to the specified topic.
 *
 * This method serializes the provided data and sends it to the messaging
 * backend through the configured driver. The operation is asynchronous
 * and will throw an error if the publish fails.
 *
 * @param topic - The topic to publish the message to
 * @param data - The message data to publish (will be serialized)
 * @param options - Optional driver-specific publish options
 *
 * @returns A promise that resolves when the message is published
 *
 * @throws {PublishFailedException} If the message fails to publish
 *
 * @example
 * ```typescript
 * await pubsub.publish('user.created', {
 *   userId: '123',
 *   email: 'user@example.com'
 * });
 * ```
 */
async publish(topic: string, data: any, options?: any): Promise<void> {
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
it('should publish message to topic', async () => {
  // Arrange
  const topic = 'test.topic';
  const data = { message: 'Hello' };

  // Act
  await service.publish(topic, data);

  // Assert
  expect(mockDriver.publish).toHaveBeenCalledWith(topic, data, undefined);
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
 * Test: Successful message publication
 *
 * Ensures that when a message is published to a topic, the driver's
 * publish method is called with the correct parameters.
 */
it('should publish message to topic', async () => {
  // Test implementation
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- pubsub.service.spec.ts

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
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
feat(redis): add support for Redis Cluster

Implement Redis Cluster support with automatic failover and
connection pooling. This allows the package to work with
distributed Redis deployments.

Closes #123
```

```
fix(kafka): handle connection timeout gracefully

Previously, connection timeouts would crash the application.
Now they are caught and retried according to the retry policy.

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
npm run lint
npm run format
npm test
npm run build
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
- **Discord**: Real-time chat with the community
- **Twitter**: Follow [@nestjs_pubsub](https://twitter.com/nestjs_pubsub) for
  updates

### Getting Help

If you need help with your contribution:

1. Check the [documentation](./DOCUMENTATION.md)
2. Search existing
   [GitHub issues](https://github.com/fulers-technologies/nestjs-pubsub/issues)
3. Ask in
   [GitHub Discussions](https://github.com/fulers-technologies/nestjs-pubsub/discussions)
4. Join our [Discord server](https://discord.gg/nestjs-pubsub)

---

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- The [CONTRIBUTORS.md](./CONTRIBUTORS.md) file

---

## License

By contributing to NestJS PubSub, you agree that your contributions will be
licensed under the MIT License.

---

Thank you for contributing to NestJS PubSub! 🎉
