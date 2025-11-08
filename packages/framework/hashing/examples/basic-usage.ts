/**
 * Basic Usage Example
 *
 * Demonstrates basic hashing and verification operations.
 */

import { Module, Injectable } from '@nestjs/common';
import { HashingModule, HashingService } from '@nesvel/nestjs-hashing';

/**
 * Example service using the hashing module
 */
@Injectable()
export class ExampleService {
  constructor(private readonly hashing: HashingService) {}

  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return this.hashing.make(password);
  }

  /**
   * Verify a password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.hashing.check(password, hash);
  }

  /**
   * Check if a hash needs rehashing
   */
  async shouldRehash(hash: string): Promise<boolean> {
    return this.hashing.needsRehash(hash);
  }

  /**
   * Get hash information
   */
  async getHashInfo(hash: string) {
    return this.hashing.info(hash);
  }
}

/**
 * Module configuration with default settings
 */
@Module({
  imports: [
    HashingModule.forRoot({
      // Uses argon2id by default
      driver: 'argon2id',
      argon2: {
        memory: 65536, // 64 MB
        time: 3,
        parallelism: 4,
      },
    }),
  ],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}

/**
 * Usage example
 */
async function main() {
  const service = new ExampleService(new HashingService(null as any));

  // Hash a password
  const password = 'mySecurePassword123!';
  const hash = await service.hashPassword(password);
  console.log('Hashed:', hash);

  // Verify password
  const isValid = await service.verifyPassword(password, hash);
  console.log('Is valid:', isValid);

  // Check wrong password
  const isInvalid = await service.verifyPassword('wrongPassword', hash);
  console.log('Is invalid:', isInvalid);

  // Get hash information
  const info = await service.getHashInfo(hash);
  console.log('Hash info:', info);

  // Check if rehashing is needed
  const needsRehash = await service.shouldRehash(hash);
  console.log('Needs rehash:', needsRehash);
}

// Uncomment to run
// main().catch(console.error);
