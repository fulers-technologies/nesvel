# @nesvel/nestjs-encryption

Laravel-inspired encryption module for NestJS with multiple cipher support
(AES-CBC, AES-GCM, Sodium).

## Features

- 🔐 **Multiple Cipher Algorithms**: AES-128-CBC, AES-256-CBC, AES-128-GCM,
  AES-256-GCM, and Sodium (XChaCha20-Poly1305)
- 🔄 **Key Rotation Support**: Automatic fallback to previous keys for seamless
  key rotation
- 🛡️ **Authenticated Encryption**: AEAD support with GCM and Sodium ciphers
- 🎯 **TypeScript First**: Fully typed with comprehensive interfaces
- 🔌 **Plug & Play**: Easy integration with NestJS dependency injection
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🎨 **Laravel-like API**: Familiar interface for Laravel developers

## Installation

```bash
# Using bun
bun add @nesvel/nestjs-encryption

# Using npm
npm install @nesvel/nestjs-encryption

# Using yarn
yarn add @nesvel/nestjs-encryption
```

## Quick Start

### 1. Generate an Encryption Key

```typescript
import { KeyGenerator, CipherAlgorithm } from '@nesvel/nestjs-encryption';

// Generate a key for AES-256-GCM (recommended)
const key = KeyGenerator.generate(CipherAlgorithm.AES_256_GCM);
console.log(key); // Store this in your environment variables
```

### 2. Configure the Module

```typescript
import { Module } from '@nestjs/common';
import { EncryptionModule, CipherAlgorithm } from '@nesvel/nestjs-encryption';

@Module({
  imports: [
    EncryptionModule.forRoot({
      key: process.env.APP_KEY, // Your base64-encoded encryption key
      cipher: CipherAlgorithm.AES_256_GCM,
      isGlobal: true, // Makes the service available globally
    }),
  ],
})
export class AppModule {}
```

### 3. Use the Service

```typescript
import { Injectable } from '@nestjs/common';
import { EncryptionService } from '@nesvel/nestjs-encryption';

@Injectable()
export class UserService {
  constructor(private readonly encryption: EncryptionService) {}

  async encryptSensitiveData(data: string): Promise<string> {
    return await this.encryption.encryptString(data);
  }

  async decryptSensitiveData(encrypted: string): Promise<string> {
    return await this.encryption.decrypt(encrypted);
  }
}
```

## Configuration

### Synchronous Configuration

```typescript
EncryptionModule.forRoot({
  key: 'base64-encoded-key',
  cipher: CipherAlgorithm.AES_256_GCM,
  previousKeys: ['old-key-1', 'old-key-2'], // For key rotation
  serialize: true, // Serialize as JSON (default: true)
  isGlobal: true, // Register as global module
});
```

### Asynchronous Configuration

```typescript
EncryptionModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    key: configService.get('APP_KEY'),
    cipher: configService.get('ENCRYPTION_CIPHER') as CipherAlgorithm,
    previousKeys: configService.get('PREVIOUS_KEYS')?.split(','),
  }),
  inject: [ConfigService],
  isGlobal: true,
});
```

## Cipher Algorithms

### AES-256-GCM (Recommended)

Modern authenticated encryption with associated data (AEAD).

```typescript
EncryptionModule.forRoot({
  key: process.env.APP_KEY,
  cipher: CipherAlgorithm.AES_256_GCM, // Default
});
```

**Pros:**

- AEAD (built-in authentication)
- Fast and secure
- Industry standard

### Sodium (XChaCha20-Poly1305)

Modern encryption using libsodium - recommended for new applications.

```typescript
EncryptionModule.forRoot({
  key: process.env.APP_KEY,
  cipher: CipherAlgorithm.SODIUM,
});
```

**Pros:**

- Modern cryptographic primitives
- Excellent security properties
- Resistant to timing attacks

### AES-256-CBC

Traditional AES encryption with HMAC authentication.

```typescript
EncryptionModule.forRoot({
  key: process.env.APP_KEY,
  cipher: CipherAlgorithm.AES_256_CBC,
});
```

**Note:** Uses HMAC-SHA256 for authentication (encrypt-then-MAC pattern).

## Usage Examples

### Basic Encryption/Decryption

```typescript
@Injectable()
export class DataService {
  constructor(private readonly encryption: EncryptionService) {}

  async protectData(data: string) {
    // Encrypt and get JSON string
    const encrypted = await this.encryption.encryptString(data);
    return encrypted; // Store in database
  }

  async retrieveData(encrypted: string) {
    // Decrypt
    const plaintext = await this.encryption.decrypt(encrypted);
    return plaintext;
  }
}
```

### Key Rotation

```typescript
// Old setup
EncryptionModule.forRoot({
  key: 'new-key',
  previousKeys: ['old-key-1', 'old-key-2'], // Decryption fallback
  cipher: CipherAlgorithm.AES_256_GCM,
});

// Service automatically tries previous keys if primary fails
const decrypted = await encryption.decrypt(oldEncryptedData);
// ✓ Works with old keys, but new encryptions use the new key
```

### Property Decorator (Metadata)

```typescript
import { Encrypted } from '@nesvel/nestjs-encryption';

export class User {
  @Encrypted()
  password: string; // Marked for encryption

  @Encrypted()
  ssn: string; // Marked for encryption

  email: string; // Not encrypted
}
```

**Note:** The `@Encrypted()` decorator only adds metadata. You need to implement
the encryption logic in your ORM integration.

### Dependency Injection

```typescript
import { InjectEncryption } from '@nesvel/nestjs-encryption';

@Injectable()
export class AuthService {
  constructor(
    @InjectEncryption() private readonly encryption: EncryptionService
  ) {}

  async hashPassword(password: string) {
    return await this.encryption.encryptString(password);
  }
}
```

### Working with Objects

```typescript
// Encrypt object as JSON
const user = { name: 'John', email: 'john@example.com' };
const encrypted = await encryption.encryptString(JSON.stringify(user));

// Decrypt back to object
const decrypted = await encryption.decrypt(encrypted);
const user = JSON.parse(decrypted);
```

## Utility Functions

### Generate Keys

```typescript
import { KeyGenerator, CipherAlgorithm } from '@nesvel/nestjs-encryption';

// Generate single key
const key = KeyGenerator.generate(CipherAlgorithm.AES_256_GCM);

// Generate with custom length
const customKey = KeyGenerator.generateWithLength(32, 'base64');

// Generate multiple keys (for key rotation)
const keys = KeyGenerator.generateMultiple(3, CipherAlgorithm.AES_256_GCM);
```

### Generate IVs

```typescript
import { IVGenerator, CipherAlgorithm } from '@nesvel/nestjs-encryption';

// Generate IV for specific cipher
const iv = IVGenerator.generate(CipherAlgorithm.AES_256_GCM);

// Generate as string
const ivString = IVGenerator.generateString(
  CipherAlgorithm.AES_256_GCM,
  'base64'
);
```

## API Reference

### EncryptionService

#### Methods

- `encrypt(plaintext: string, serialize?: boolean): Promise<string | EncryptedPayload>`
  - Encrypts plaintext with optional serialization control
- `encryptString(plaintext: string): Promise<string>`
  - Encrypts and always returns a JSON string
- `decrypt(payload: string | EncryptedPayload): Promise<string>`
  - Decrypts with automatic key rotation support
- `getCipher(): CipherAlgorithm`
  - Returns the current cipher algorithm
- `hasPreviousKeys(): boolean`
  - Checks if key rotation is configured
- `getPreviousKeyCount(): number`
  - Returns the number of previous keys

### CipherAlgorithm

```typescript
enum CipherAlgorithm {
  AES_128_CBC = 'aes-128-cbc',
  AES_256_CBC = 'aes-256-cbc',
  AES_128_GCM = 'aes-128-gcm',
  AES_256_GCM = 'aes-256-gcm',
  SODIUM = 'sodium',
}
```

## Error Handling

```typescript
import {
  DecryptionException,
  MissingKeyException,
} from '@nesvel/nestjs-encryption';

try {
  await encryption.decrypt(corruptedData);
} catch (error: Error | any) {
  if (error instanceof DecryptionException) {
    console.error('Decryption failed:', error.message);
  } else if (error instanceof MissingKeyException) {
    console.error('No encryption key configured');
  }
}
```

## Best Practices

1. **Key Storage**: Store encryption keys in environment variables, never in
   code
2. **Key Rotation**: Use `previousKeys` for seamless key rotation
3. **Cipher Choice**: Use AES-256-GCM or Sodium for new projects
4. **Key Generation**: Always use `KeyGenerator` for cryptographically secure
   keys
5. **Error Handling**: Always wrap decrypt operations in try-catch blocks

## Security Considerations

- **Key Management**: Protect your encryption keys with the same care as
  database credentials
- **Key Rotation**: Rotate keys periodically and use `previousKeys` for backward
  compatibility
- **AEAD Ciphers**: Prefer GCM or Sodium for built-in authentication
- **IV/Nonce Uniqueness**: IVs are automatically generated for each encryption
  operation
- **Timing Attacks**: CBC mode uses timing-safe MAC comparison

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please use the
[GitHub issue tracker](https://github.com/nesvel/nesvel/issues).
