# Contributing to NestJS Storage

Thank you for your interest in contributing to NestJS Storage! This document
provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to
follow. Please read and follow it in all your interactions with the project.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.
When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, package version)
- Code samples or error messages

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear and descriptive title
- Detailed description of the proposed feature
- Use cases and examples
- Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/fulers-technologies/nestjs-storage.git
cd nestjs-storage

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## Coding Standards

- Follow TypeScript best practices
- Use path aliases (@interfaces, @services, etc.)
- Add comprehensive JSDoc comments
- Write tests for new features
- Maintain 100% test coverage
- Follow existing code style

## Commit Messages

Use clear and meaningful commit messages:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `test: add tests`
- `refactor: improve code structure`
- `chore: update dependencies`

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
