# @nesvel/nestjs-hashing

Laravel-inspired hashing module for NestJS with support for multiple algorithms
(Bcrypt, Argon2id).

## Features

- 🔐 **Multiple Algorithms**: Bcrypt, Argon2id (OWASP recommended)
- 🔄 **Auto-Rehashing**: Detect when hashes need to be regenerated
- 🎯 **Driver Pattern**: Easily swap algorithms via configuration
- 🚀 **Async/Sync Config**: Support for both static and dynamic configuration
- 🛡️ **Type-Safe**: Full TypeScript support with comprehensive types
- 📦 **Zero Config**: Works out of the box with secure defaults
- 🧪 **Production Ready**: Battle-tested hashing implementations

## Installation

```bash
# Using bun
bun add @nesvel/nestjs-hashing

# Using npm
npm install @nesvel/nestjs-hashing

# Using yarn
yarn add @nesvel/nestjs-hashing
```

### Peer Dependencies

```bash
bun add @nestjs/common @nestjs/core reflect-metadata
```

### Algorithm Dependencies

```bash
# For Bcrypt
bun add bcrypt
bun add -D @types/bcrypt

# For Argon2id (recommended)
bun add argon2
```

## Quick Start

### 1. Register the Module

```typescript
import { Module } from '@nestjs/common';
import { HashingModule } from '@nesvel/nestjs-hashing';

@Module({
  imports: [
    HashingModule.forRoot({
      driver: 'argon2id', // 'bcrypt' or 'argon2id'
      argon2: {
        memory: 65536,
        time: 3,
        parallelism: 4,
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Use the Service

```typescript
import { Injectable } from '@nestjs/common';
import { HashingService } from '@nesvel/nestjs-hashing';

@Injectable()
export class AuthService {
  constructor(private readonly hashing: HashingService) {}

  async hashPassword(password: string): Promise<string> {
    return this.hashing.make(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.hashing.check(password, hash);
  }

  async checkRehash(hash: string): Promise<boolean> {
    return this.hashing.needsRehash(hash);
  }
}
```

## Configuration

### Synchronous Configuration

```typescript
HashingModule.forRoot({
  driver: 'argon2id',
  global: true, // Makes service available globally

  // Bcrypt options
  bcrypt: {
    rounds: 10,
  },

  // Argon2 options
  argon2: {
    memory: 65536, // 64 MB
    time: 3,
    parallelism: 4,
  },
});
```

### Asynchronous Configuration

```typescript
HashingModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    driver: config.get('HASH_DRIVER'),
    bcrypt: {
      rounds: config.get('BCRYPT_ROUNDS'),
    },
    argon2: {
      memory: config.get('ARGON2_MEMORY'),
      time: config.get('ARGON2_TIME'),
      parallelism: config.get('ARGON2_PARALLELISM'),
    },
  }),
  inject: [ConfigService],
});
```

## API Reference

### HashingService

#### `make(value: string, options?: Record<string, any>): Promise<string>`

Hash a plain value.

```typescript
const hash = await hashingService.make('password123');
// $argon2id$v=19$m=65536,t=3,p=4$...
```

#### `check(value: string, hashedValue: string, options?: Record<string, any>): Promise<boolean>`

Verify a plain value against a hash.

```typescript
const isValid = await hashingService.check('password123', hash);
// true or false
```

#### `needsRehash(hashedValue: string, options?: Record<string, any>): Promise<boolean>`

Check if a hash needs to be regenerated with current configuration.

```typescript
const needsUpdate = await hashingService.needsRehash(oldHash);
if (needsUpdate) {
  const newHash = await hashingService.make(password);
  // Save newHash to database
}
```

#### `info(hashedValue: string): Promise<HashInfo>`

Get information about a hashed value.

```typescript
const info = await hashingService.info(hash);
console.log(info);
// {
//   algorithm: 'argon2id',
//   valid: true,
//   options: { memory: 65536, time: 3, parallelism: 4 }
// }
```

#### `isHashed(value: string): Promise<boolean>`

Check if a value appears to be hashed.

```typescript
const isHashed = await hashingService.isHashed('password123');
// false

const isHashed = await hashingService.isHashed('$2a$10$...');
// true
```

## Algorithms

### Argon2id (Recommended)

**OWASP recommended** password hashing algorithm. Resistant to side-channel
attacks.

```typescript
HashingModule.forRoot({
  driver: 'argon2id',
  argon2: {
    memory: 65536, // Memory cost in KiB (64 MB)
    time: 3, // Time cost (iterations)
    parallelism: 4, // Number of parallel threads
  },
});
```

**When to use:**

- New applications (default choice)
- High-security requirements
- Protection against GPU/ASIC attacks

**Performance:** Slower than bcrypt, but more secure.

### Bcrypt

Classic password hashing algorithm, still secure for most use cases.

```typescript
HashingModule.forRoot({
  driver: 'bcrypt',
  bcrypt: {
    rounds: 10, // Work factor (2^10 = 1024 iterations)
  },
});
```

**When to use:**

- Legacy applications
- Compatibility requirements
- Faster hashing needed

**Performance:** Fast and well-tested.

## Use Cases

### Password Hashing

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly hashing: HashingService,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await this.hashing.make(password);

    const user = this.users.create({
      email,
      password: hashedPassword,
    });

    return this.users.save(user);
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isValid = await this.hashing.check(password, user.password);

    if (!isValid) {
      return null;
    }

    // Check if hash needs updating
    if (await this.hashing.needsRehash(user.password)) {
      user.password = await this.hashing.make(password);
      await this.users.save(user);
    }

    return user;
  }
}
```

### Migration from Bcrypt to Argon2id

```typescript
@Injectable()
export class MigrationService {
  constructor(
    private readonly hashing: HashingService,
    @InjectRepository(User)
    private readonly users: Repository<User>
  ) {}

  async migratePasswordHash(
    userId: number,
    plainPassword: string
  ): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password with old hash
    const isValid = await this.hashing.check(plainPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check if migration needed
    const info = await this.hashing.info(user.password);

    if (info.algorithm === 'bcrypt') {
      // Re-hash with new algorithm (argon2id)
      user.password = await this.hashing.make(plainPassword);
      await this.users.save(user);

      console.log(`Migrated user ${userId} from bcrypt to argon2id`);
    }
  }

  async migrateOnLogin(email: string, password: string): Promise<User> {
    const user = await this.users.findOne({ where: { email } });

    if (!user || !(await this.hashing.check(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Automatically migrate on successful login
    if (await this.hashing.needsRehash(user.password)) {
      user.password = await this.hashing.make(password);
      await this.users.save(user);
    }

    return user;
  }
}
```

### API Token Hashing

```typescript
@Injectable()
export class TokenService {
  constructor(private readonly hashing: HashingService) {}

  async generateToken(): Promise<{ token: string; hash: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = await this.hashing.make(token);

    return { token, hash };
  }

  async verifyToken(token: string, hash: string): Promise<boolean> {
    return this.hashing.check(token, hash);
  }
}
```

## Best Practices

### 1. Use Argon2id for New Applications

```typescript
HashingModule.forRoot({
  driver: 'argon2id',
  argon2: {
    memory: 65536, // OWASP recommended
    time: 3,
    parallelism: 4,
  },
});
```

### 2. Implement Auto-Rehashing

```typescript
async login(email: string, password: string) {
  const user = await this.findUserByEmail(email);

  if (await this.hashing.check(password, user.password)) {
    // Auto-rehash if needed
    if (await this.hashing.needsRehash(user.password)) {
      user.password = await this.hashing.make(password);
      await this.saveUser(user);
    }

    return this.generateSession(user);
  }

  throw new UnauthorizedException();
}
```

### 3. Never Log or Expose Hashes

```typescript
// ❌ BAD
console.log('User hash:', user.password);

// ✅ GOOD
console.log('User authenticated:', user.id);
```

### 4. Use Environment Variables for Configuration

```typescript
HashingModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    driver: config.get('HASH_DRIVER', 'argon2id'),
    argon2: {
      memory: config.get('HASH_MEMORY', 65536),
      time: config.get('HASH_TIME', 3),
      parallelism: config.get('HASH_PARALLELISM', 4),
    },
  }),
  inject: [ConfigService],
});
```

### 5. Test Password Strength Before Hashing

```typescript
async registerUser(password: string) {
  // Validate password strength first
  if (password.length < 12) {
    throw new BadRequestException('Password too short');
  }

  // Then hash
  const hash = await this.hashing.make(password);

  // Save to database
  await this.saveUser({ password: hash });
}
```

## Performance Considerations

### Algorithm Benchmarks

Based on 1000 iterations:

| Algorithm          | Average Time | Security Level |
| ------------------ | ------------ | -------------- |
| Bcrypt (10 rounds) | ~100ms       | High           |
| Argon2id (OWASP)   | ~150ms       | Very High      |

### Tuning Guidelines

**Bcrypt Rounds:**

- 10 rounds: Fast, good for most apps
- 12 rounds: Balanced
- 14+ rounds: Maximum security, slower

**Argon2id:**

- Memory: 64MB (65536 KiB) recommended
- Time: 3 iterations minimum
- Parallelism: Number of CPU cores

```typescript
// Production recommendation
HashingModule.forRoot({
  driver: 'argon2id',
  argon2: {
    memory: 65536, // 64 MB
    time: 3, // 3 iterations
    parallelism: 4, // 4 threads
  },
});
```

## Security Notes

1. **Never hash on client-side** - Always hash passwords on the server
2. **Use HTTPS** - Transmit plain passwords only over encrypted connections
3. **Rate limiting** - Implement rate limiting on authentication endpoints
4. **Pepper (optional)** - Add application-wide secret for extra security
5. **Monitor rehashing** - Track when hashes are updated

## Troubleshooting

### "Cannot find module 'bcrypt'"

Install bcrypt:

```bash
bun add bcrypt
bun add -D @types/bcrypt
```

### "Cannot find module 'argon2'"

Install argon2:

```bash
bun add argon2
```

### "Hash verification always fails"

Ensure you're using the same algorithm that created the hash:

```typescript
const info = await hashingService.info(hash);
console.log('Hash algorithm:', info.algorithm);
```

### Performance issues

Reduce work factor:

```typescript
// Bcrypt
bcrypt: { rounds: 10 } // Lower = faster

// Argon2id
argon2: {
  memory: 32768,  // Lower = faster
  time: 2,        // Lower = faster
}
```

## Testing

### Mock Service

```typescript
const mockHashingService = {
  make: jest.fn().mockResolvedValue('$hashed$'),
  check: jest.fn().mockResolvedValue(true),
  needsRehash: jest.fn().mockResolvedValue(false),
  info: jest.fn().mockResolvedValue({ algorithm: 'bcrypt', valid: true }),
  isHashed: jest.fn().mockResolvedValue(true),
};
```

### Integration Test

```typescript
describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        HashingModule.forRoot({
          driver: 'bcrypt',
          bcrypt: { rounds: 4 }, // Lower for faster tests
        }),
      ],
    }).compile();

    service = module.get<HashingService>(HashingService);
  });

  it('should hash and verify password', async () => {
    const password = 'test123';
    const hash = await service.make(password);

    expect(await service.check(password, hash)).toBe(true);
    expect(await service.check('wrong', hash)).toBe(false);
  });
});
```

## License

MIT

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for
details.

## Credits

Part of the [Nesvel](https://github.com/nesvel/nesvel) monorepo.

Inspired by [Laravel's Hashing](https://laravel.com/docs/hashing).
