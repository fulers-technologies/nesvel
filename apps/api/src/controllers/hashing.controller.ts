import { HashingService } from '@nesvel/nestjs-hashing';
import { Controller, Post, Get, Body, Param } from '@nestjs/common';

/**
 * Hashing Controller
 *
 * Test controller for the HashingService package.
 * Provides endpoints to test all hashing methods including:
 * - Hash generation (make)
 * - Hash verification (check)
 * - Rehash detection (needsRehash)
 * - Hash information extraction (info)
 * - Hash detection (isHashed)
 *
 * **Features**:
 * - Password hashing and verification
 * - Hash algorithm information retrieval
 * - Hash upgrade detection
 * - Security best practices demonstration
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Controller('hashing')
export class HashingController {
  constructor(private readonly hashingService: HashingService) {}

  /**
   * Hash a Value
   *
   * Creates a hash from a plain text value using the configured hashing algorithm.
   * The hash is cryptographically secure and suitable for password storage.
   *
   * **Use Cases**:
   * - Password hashing before storage
   * - Securing sensitive data
   * - Creating verification tokens
   *
   * @param data - The value to hash and optional algorithm-specific options
   * @returns The generated hash string
   *
   * @example
   * ```typescript
   * POST /hashing/make
   * {
   *   "value": "mySecurePassword123",
   *   "options": { "rounds": 12 }
   * }
   * ```
   */
  @Post('make')
  async makeHash(@Body() data: { value: string; options?: Record<string, any> }): Promise<{
    hash: string;
    algorithm: string;
  }> {
    const hash = await this.hashingService.make(data.value, data.options);
    const info = await this.hashingService.info(hash);

    return {
      hash,
      algorithm: info.algorithm || 'unknown',
    };
  }

  /**
   * Verify a Hash
   *
   * Verifies if a plain text value matches a previously generated hash.
   * Uses constant-time comparison to prevent timing attacks.
   *
   * **Security Features**:
   * - Constant-time comparison
   * - Algorithm auto-detection
   * - Safe against timing attacks
   *
   * @param data - The plain value and hash to compare
   * @returns True if the value matches the hash, false otherwise
   *
   * @example
   * ```typescript
   * POST /hashing/check
   * {
   *   "value": "mySecurePassword123",
   *   "hash": "$2b$10$...",
   *   "options": {}
   * }
   * ```
   */
  @Post('check')
  async checkHash(
    @Body() data: { value: string; hash: string; options?: Record<string, any> }
  ): Promise<{ isValid: boolean; message: string }> {
    const isValid = await this.hashingService.check(data.value, data.hash, data.options);

    return {
      isValid,
      message: isValid ? 'Hash verification successful' : 'Hash verification failed',
    };
  }

  /**
   * Check if Hash Needs Rehashing
   *
   * Determines if a hash should be regenerated due to outdated algorithm parameters.
   * Useful for upgrading password security over time.
   *
   * **Use Cases**:
   * - Password upgrade during login
   * - Security policy enforcement
   * - Algorithm migration
   *
   * @param data - The hash to check and desired algorithm options
   * @returns True if the hash should be regenerated
   *
   * @example
   * ```typescript
   * POST /hashing/needs-rehash
   * {
   *   "hash": "$2b$10$...",
   *   "options": { "rounds": 12 }
   * }
   * ```
   */
  @Post('needs-rehash')
  async needsRehash(
    @Body() data: { hash: string; options?: Record<string, any> }
  ): Promise<{ needsRehash: boolean; currentInfo: any; message: string }> {
    const needsRehash = await this.hashingService.needsRehash(data.hash, data.options);
    const currentInfo = await this.hashingService.info(data.hash);

    return {
      needsRehash,
      currentInfo,
      message: needsRehash
        ? 'Hash should be regenerated with updated parameters'
        : 'Hash is up to date',
    };
  }

  /**
   * Get Hash Information
   *
   * Extracts metadata from a hash string including algorithm, version,
   * cost factors, and validity status.
   *
   * **Information Provided**:
   * - Algorithm name and version
   * - Cost/rounds parameters
   * - Hash validity
   * - Algorithm-specific metadata
   *
   * @param hash - The hash string to analyze
   * @returns Detailed hash metadata
   *
   * @example
   * ```typescript
   * GET /hashing/info/$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
   * ```
   */
  @Get('info/:hash')
  async getHashInfo(@Param('hash') hash: string): Promise<{
    info: any;
    message: string;
  }> {
    const info = await this.hashingService.info(hash);

    return {
      info,
      message: info.valid ? 'Valid hash format detected' : 'Invalid or unrecognized hash format',
    };
  }

  /**
   * Check if Value is Hashed
   *
   * Determines if a string appears to be a hash rather than plain text.
   * Useful for preventing double-hashing and validating stored data.
   *
   * **Use Cases**:
   * - Prevent double-hashing passwords
   * - Validate database data
   * - Detect migration issues
   *
   * @param data - The value to check
   * @returns True if the value appears to be a hash
   *
   * @example
   * ```typescript
   * POST /hashing/is-hashed
   * {
   *   "value": "$2b$10$..."
   * }
   * ```
   */
  @Post('is-hashed')
  async isHashed(@Body() data: { value: string }): Promise<{
    isHashed: boolean;
    info: any;
    message: string;
  }> {
    const isHashed = await this.hashingService.isHashed(data.value);
    const info = isHashed ? await this.hashingService.info(data.value) : null;

    return {
      isHashed,
      info,
      message: isHashed ? 'Value is a valid hash' : 'Value appears to be plain text, not a hash',
    };
  }

  /**
   * Complete Password Workflow Test
   *
   * Demonstrates a complete password hashing workflow:
   * 1. Hash a password
   * 2. Verify the password
   * 3. Check if rehashing is needed
   * 4. Get hash information
   *
   * **Workflow Steps**:
   * - Initial password hashing
   * - Immediate verification test
   * - Security upgrade check
   * - Metadata extraction
   *
   * @param data - The password to test
   * @returns Complete workflow results
   *
   * @example
   * ```typescript
   * POST /hashing/workflow
   * {
   *   "password": "mySecurePassword123",
   *   "options": { "rounds": 10 }
   * }
   * ```
   */
  @Post('workflow')
  async testWorkflow(@Body() data: { password: string; options?: Record<string, any> }): Promise<{
    step1_hash: string;
    step2_verification: boolean;
    step3_needsRehash: boolean;
    step4_info: any;
    step5_isHashed: boolean;
    summary: string;
  }> {
    // Step 1: Hash the password
    const hash = await this.hashingService.make(data.password, data.options);

    // Step 2: Verify the password
    const verification = await this.hashingService.check(data.password, hash, data.options);

    // Step 3: Check if rehash is needed
    const needsRehash = await this.hashingService.needsRehash(hash, data.options);

    // Step 4: Get hash info
    const info = await this.hashingService.info(hash);

    // Step 5: Confirm it's a hash
    const isHashed = await this.hashingService.isHashed(hash);

    return {
      step1_hash: hash,
      step2_verification: verification,
      step3_needsRehash: needsRehash,
      step4_info: info,
      step5_isHashed: isHashed,
      summary: 'Complete password hashing workflow executed successfully',
    };
  }

  /**
   * Test Multiple Hash Operations
   *
   * Tests multiple hash operations in sequence to demonstrate
   * hash uniqueness and verification consistency.
   *
   * **Demonstrations**:
   * - Same input produces different hashes (salt randomization)
   * - All hashes verify correctly
   * - Hash information consistency
   *
   * @param data - Test parameters
   * @returns Results of multiple hash operations
   *
   * @example
   * ```typescript
   * POST /hashing/multi-test
   * {
   *   "value": "testPassword",
   *   "count": 3,
   *   "options": {}
   * }
   * ```
   */
  @Post('multi-test')
  async multiTest(
    @Body() data: { value: string; count?: number; options?: Record<string, any> }
  ): Promise<{
    hashes: string[];
    verifications: boolean[];
    infos: any[];
    allUnique: boolean;
    allValid: boolean;
  }> {
    const count = data.count || 3;
    const hashes: string[] = [];
    const verifications: boolean[] = [];
    const infos: any[] = [];

    // Generate multiple hashes from the same input
    for (let i = 0; i < count; i++) {
      const hash = await this.hashingService.make(data.value, data.options);
      hashes.push(hash);

      // Verify each hash
      const isValid = await this.hashingService.check(data.value, hash, data.options);
      verifications.push(isValid);

      // Get info for each hash
      const info = await this.hashingService.info(hash);
      infos.push(info);
    }

    // Check if all hashes are unique (they should be due to random salts)
    const allUnique = new Set(hashes).size === hashes.length;

    // Check if all verifications passed
    const allValid = verifications.every((v) => v === true);

    return {
      hashes,
      verifications,
      infos,
      allUnique,
      allValid,
    };
  }
}
