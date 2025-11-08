# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-08

### Added

- Initial release of @nesvel/nestjs-encryption
- Support for multiple cipher algorithms:
  - AES-128-CBC
  - AES-256-CBC
  - AES-128-GCM
  - AES-256-GCM
  - Sodium (XChaCha20-Poly1305)
- Key rotation support with automatic fallback to previous keys
- AEAD (Authenticated Encryption with Associated Data) support for GCM and
  Sodium
- EncryptionService with encrypt/decrypt methods
- EncryptionFactoryService for driver creation
- BaseEncryptionDriver abstract class for custom drivers
- Complete TypeScript type definitions
- Comprehensive documentation and examples
- Property decorators for encryption metadata
- Dependency injection decorators
- Key and IV generation utilities
- Timing-safe MAC comparison for CBC mode
- Serialization options for encrypted payloads
- Global and async module configuration support

### Security

- Encrypt-then-MAC pattern for CBC mode
- Timing-safe comparison for HMAC verification
- Cryptographically secure random key and IV generation
- AEAD support with GCM and Sodium for authenticated encryption
