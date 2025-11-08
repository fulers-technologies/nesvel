# Changelog

All notable changes to `@nesvel/nestjs-hashing` will be documented in this file.

## [1.0.0] - 2025-01-07

### Added

- Initial release of @nesvel/nestjs-hashing
- Bcrypt driver with configurable rounds
- Argon2id driver with OWASP recommended defaults
- HashingService with make(), check(), needsRehash(), info(), and isHashed()
  methods
- HashingModule with forRoot() and forRootAsync() registration
- Driver factory pattern for algorithm selection
- Auto-rehashing detection via needsRehash()
- Hash algorithm detection and metadata extraction
- TypeScript support with full type definitions
- Comprehensive documentation and examples
- Zero-config support with secure defaults

### Features

- **Multiple Algorithms**: Bcrypt, Argon2id
- **Driver Pattern**: Easy algorithm switching
- **Auto-Rehashing**: Detect outdated hashes
- **Type-Safe**: Full TypeScript support
- **Async Configuration**: Dynamic module registration
- **Global Module**: Optional global registration

### Security

- Argon2id as recommended default (OWASP compliant)
- Timing-safe comparison for hash verification
- Input validation in all drivers
- Secure default parameters

### Documentation

- Comprehensive README with examples
- API reference documentation
- Best practices guide
- Migration examples
- Performance tuning guide
