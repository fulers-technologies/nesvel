# Contributing to @nesvel/reactjs-di

Thank you for your interest in contributing to `@nesvel/reactjs-di`! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Bun >= 1.3.1 (recommended) or npm/yarn
- Git

### Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/reactjs-di.git
cd reactjs-di/packages/reactjs-di
```

2. **Install dependencies**

```bash
bun install
# or
npm install
```

3. **Run tests**

```bash
bun run test
# or
npm test
```

4. **Build the package**

```bash
bun run build
# or
npm run build
```

## 📝 Development Workflow

### Project Structure

```
reactjs-di/
├── src/
│   ├── constants/      # Global constants and registries
│   ├── contexts/       # React contexts
│   ├── decorators/     # Decorator implementations
│   ├── hooks/          # React hooks
│   ├── interfaces/     # TypeScript interfaces
│   ├── providers/      # React providers
│   ├── registry/       # Route registry implementation
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── __tests__/          # Test files
├── docs/               # Documentation
└── examples/           # Example implementations
```

### Available Scripts

- `bun run build` - Build the package
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage
- `bun run lint` - Lint the codebase
- `bun run lint:fix` - Lint and fix issues
- `bun run typecheck` - Type-check the codebase

### Making Changes

1. **Create a new branch**

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make your changes**

- Write clean, readable code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed

3. **Test your changes**

```bash
bun run test
bun run typecheck
bun run lint
```

4. **Commit your changes**

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in useDI hook"
git commit -m "docs: update README examples"
git commit -m "test: add tests for RouteModule"
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

5. **Push and create a Pull Request**

```bash
git push origin feature/your-feature-name
```

## 🧪 Testing Guidelines

### Writing Tests

- Place tests in `__tests__/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Aim for high code coverage

Example:

```tsx
import { useDI } from '../src/hooks/use-di.hook';
import { renderHook } from '@testing-library/react';

describe('useDI', () => {
  it('should retrieve service from container', () => {
    const { result } = renderHook(() => useDI(LOGGER_SERVICE));
    expect(result.current).toBeDefined();
  });

  it('should throw error if service not found', () => {
    expect(() => {
      renderHook(() => useDI(MISSING_SERVICE));
    }).toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test:coverage

# Specific test file
bun run test use-di.hook.test.ts
```

## 📚 Documentation

### Adding Documentation

- Update README.md for major features
- Add JSDoc comments to all public APIs
- Include code examples in documentation
- Update CHANGELOG.md

Example JSDoc:

````tsx
/**
 * Retrieves a service from the DI container
 *
 * @template T - The service interface type
 * @param token - The service identifier symbol
 * @returns The service instance
 * @throws {Error} If used outside DIProvider or service not found
 *
 * @example
 * ```tsx
 * const logger = useDI<ILogger>(LOGGER_SERVICE);
 * logger.info('Hello world');
 * ```
 */
export function useDI<T>(token: ServiceIdentifier<T>): T {
  // implementation
}
````

## 🎨 Code Style

### TypeScript Guidelines

- Use explicit types for public APIs
- Prefer interfaces over type aliases for object shapes
- Use `const` for immutable values
- Use descriptive variable and function names
- Avoid `any` - use `unknown` or generics instead

### React Guidelines

- Use function components
- Extract complex logic into custom hooks
- Use TypeScript for props and state
- Document component props with JSDoc

### General Guidelines

- Keep functions small and focused
- Extract magic numbers into constants
- Use early returns to reduce nesting
- Add comments for complex logic

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's reproducible
- Test with latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Initialize container with...
2. Call useDI with...
3. See error

**Expected behavior**
What you expected to happen

**Environment:**

- OS: [e.g. macOS 13.0]
- Node version: [e.g. 20.0.0]
- Package version: [e.g. 1.0.0]
- React version: [e.g. 18.2.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

We welcome feature requests! Please:

- Check if it already exists
- Clearly describe the use case
- Explain why it would be useful
- Provide examples if possible

## 🔍 Code Review Process

### Pull Request Requirements

- All tests pass
- Code coverage maintained or improved
- Lint checks pass
- TypeScript type-checks pass
- Documentation updated
- Follows conventional commits
- Reasonable commit history

### Review Process

1. Automated checks run (tests, lint, types)
2. Maintainers review code
3. Address feedback if any
4. Approval and merge

## 📋 Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Publish to npm
5. Create GitHub release

## 🤝 Community

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Communication

- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Pull Requests for contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Feel free to open an issue or start a discussion if you have any questions!

Thank you for contributing! 🎉
