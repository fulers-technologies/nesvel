import { Controller, Post, Get, Body } from '@nestjs/common';
import { EncryptionService, EncryptedPayload } from '@nesvel/nestjs-encryption';

/**
 * Encryption Controller
 *
 * Test controller for the EncryptionService package.
 * Provides endpoints to test all encryption methods including:
 * - Data encryption (encrypt, encryptString)
 * - Data decryption (decrypt)
 * - Cipher information retrieval (getCipher)
 *
 * **Features**:
 * - AES encryption (CBC, GCM)
 * - Sodium encryption support
 * - Serialization options
 * - Payload format flexibility
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Controller('encryption')
export class EncryptionController {
  constructor(private readonly encryptionService: EncryptionService) {}

  /**
   * Encrypt Data
   *
   * Encrypts plaintext data using the configured encryption algorithm.
   * Returns either a serialized JSON string or an encrypted payload object.
   *
   * **Use Cases**:
   * - Secure sensitive data before storage
   * - Protect API tokens and secrets
   * - Encrypt user personal information
   * - Secure file contents
   *
   * **Supported Algorithms**:
   * - AES-256-CBC: Cipher Block Chaining mode
   * - AES-256-GCM: Galois/Counter Mode (authenticated encryption)
   * - Sodium: Modern NaCl-based encryption
   *
   * @param data - The plaintext to encrypt and serialization preference
   * @returns The encrypted payload (string or object)
   *
   * @example
   * ```typescript
   * POST /encryption/encrypt
   * {
   *   "plaintext": "Sensitive user data",
   *   "serialize": true
   * }
   * ```
   */
  @Post('encrypt')
  async encrypt(
    @Body() data: { plaintext: string; serialize?: boolean }
  ): Promise<{ encrypted: string | EncryptedPayload; cipher: string; serialized: boolean }> {
    const encrypted = await this.encryptionService.encrypt(data.plaintext, data.serialize);
    const cipher = this.encryptionService.getCipher();

    return {
      encrypted,
      cipher,
      serialized: data.serialize ?? false,
    };
  }

  /**
   * Encrypt Data as String
   *
   * Encrypts plaintext and always returns a serialized JSON string.
   * This is a convenience method that ensures string output.
   *
   * **Use Cases**:
   * - Database storage (string columns)
   * - API responses requiring string format
   * - File system storage
   * - Queue/message payloads
   *
   * @param data - The plaintext to encrypt
   * @returns The encrypted data as a JSON string
   *
   * @example
   * ```typescript
   * POST /encryption/encrypt-string
   * {
   *   "plaintext": "API key: sk_test_123456"
   * }
   * ```
   */
  @Post('encrypt-string')
  async encryptString(
    @Body() data: { plaintext: string }
  ): Promise<{ encrypted: string; cipher: string; format: string }> {
    const encrypted = await this.encryptionService.encryptString(data.plaintext);
    const cipher = this.encryptionService.getCipher();

    return {
      encrypted,
      cipher,
      format: 'JSON string',
    };
  }

  /**
   * Decrypt Data
   *
   * Decrypts an encrypted payload back to its original plaintext.
   * Accepts both JSON strings and encrypted payload objects.
   *
   * **Security Features**:
   * - Authenticated decryption (GCM mode)
   * - Integrity verification
   * - IV/nonce handling
   * - Automatic format detection
   *
   * @param data - The encrypted payload (string or object)
   * @returns The decrypted plaintext
   *
   * @example
   * ```typescript
   * POST /encryption/decrypt
   * {
   *   "payload": "{\"iv\":\"...\",\"value\":\"...\",\"mac\":\"...\"}"
   * }
   * ```
   */
  @Post('decrypt')
  async decrypt(
    @Body() data: { payload: string | EncryptedPayload }
  ): Promise<{ decrypted: string; cipher: string; message: string }> {
    const decrypted = await this.encryptionService.decrypt(data.payload);
    const cipher = this.encryptionService.getCipher();

    return {
      decrypted,
      cipher,
      message: 'Data decrypted successfully',
    };
  }

  /**
   * Get Current Cipher Algorithm
   *
   * Returns the currently configured cipher algorithm being used
   * for encryption operations.
   *
   * **Algorithm Information**:
   * - AES-256-CBC: Classic AES encryption
   * - AES-256-GCM: Authenticated encryption with additional data
   * - Sodium: Modern libsodium-based encryption
   *
   * @returns The cipher algorithm identifier
   *
   * @example
   * ```typescript
   * GET /encryption/cipher
   * ```
   */
  @Get('cipher')
  getCipher(): { cipher: string; description: string } {
    const cipher = this.encryptionService.getCipher();

    const descriptions: Record<string, string> = {
      'aes-256-cbc': 'AES-256 in Cipher Block Chaining mode',
      'aes-256-gcm': 'AES-256 in Galois/Counter Mode (authenticated encryption)',
      sodium: 'Sodium-based encryption using libsodium',
    };

    return {
      cipher,
      description: descriptions[cipher] || 'Unknown cipher algorithm',
    };
  }

  /**
   * Complete Encryption Workflow Test
   *
   * Demonstrates a complete encryption/decryption workflow:
   * 1. Encrypt data as object
   * 2. Encrypt data as string
   * 3. Decrypt both formats
   * 4. Verify data integrity
   * 5. Get cipher information
   *
   * **Workflow Steps**:
   * - Dual-format encryption
   * - Cross-format decryption
   * - Integrity verification
   * - Algorithm identification
   *
   * @param data - The plaintext to test
   * @returns Complete workflow results
   *
   * @example
   * ```typescript
   * POST /encryption/workflow
   * {
   *   "plaintext": "Secret message for testing"
   * }
   * ```
   */
  @Post('workflow')
  async testWorkflow(@Body() data: { plaintext: string }): Promise<{
    step1_encrypted_object: string | EncryptedPayload;
    step2_encrypted_string: string;
    step3_decrypted_from_object: string;
    step4_decrypted_from_string: string;
    step5_integrity_check: boolean;
    step6_cipher: string;
    summary: string;
  }> {
    // Step 1: Encrypt as object
    const encryptedObject = await this.encryptionService.encrypt(data.plaintext, false);

    // Step 2: Encrypt as string
    const encryptedString = await this.encryptionService.encryptString(data.plaintext);

    // Step 3: Decrypt from object
    const decryptedFromObject = await this.encryptionService.decrypt(encryptedObject);

    // Step 4: Decrypt from string
    const decryptedFromString = await this.encryptionService.decrypt(encryptedString);

    // Step 5: Verify integrity (both should match original)
    const integrityCheck =
      decryptedFromObject === data.plaintext && decryptedFromString === data.plaintext;

    // Step 6: Get cipher info
    const cipher = this.encryptionService.getCipher();

    return {
      step1_encrypted_object: encryptedObject,
      step2_encrypted_string: encryptedString,
      step3_decrypted_from_object: decryptedFromObject,
      step4_decrypted_from_string: decryptedFromString,
      step5_integrity_check: integrityCheck,
      step6_cipher: cipher,
      summary: 'Complete encryption workflow executed successfully',
    };
  }

  /**
   * Test Multiple Encryption Operations
   *
   * Tests multiple encryption operations on the same data to demonstrate:
   * - Encryption randomness (different outputs for same input)
   * - Decryption consistency (all decrypt correctly)
   * - Algorithm reliability
   *
   * **Demonstrations**:
   * - IV/nonce randomization
   * - Encryption uniqueness
   * - Decryption accuracy
   *
   * @param data - Test parameters
   * @returns Results of multiple encryption operations
   *
   * @example
   * ```typescript
   * POST /encryption/multi-test
   * {
   *   "plaintext": "Test data",
   *   "count": 5
   * }
   * ```
   */
  @Post('multi-test')
  async multiTest(@Body() data: { plaintext: string; count?: number }): Promise<{
    encrypted_payloads: string[];
    decrypted_results: string[];
    all_unique: boolean;
    all_valid: boolean;
    cipher: string;
  }> {
    const count = data.count || 5;
    const encryptedPayloads: string[] = [];
    const decryptedResults: string[] = [];

    // Generate multiple encryptions of the same data
    for (let i = 0; i < count; i++) {
      const encrypted = await this.encryptionService.encryptString(data.plaintext);
      encryptedPayloads.push(encrypted);

      // Decrypt each one
      const decrypted = await this.encryptionService.decrypt(encrypted);
      decryptedResults.push(decrypted);
    }

    // Check if all encrypted payloads are unique (they should be due to random IVs)
    const allUnique = new Set(encryptedPayloads).size === encryptedPayloads.length;

    // Check if all decryptions match the original
    const allValid = decryptedResults.every((d) => d === data.plaintext);

    const cipher = this.encryptionService.getCipher();

    return {
      encrypted_payloads: encryptedPayloads,
      decrypted_results: decryptedResults,
      all_unique: allUnique,
      all_valid: allValid,
      cipher,
    };
  }

  /**
   * Test Round-Trip Encryption
   *
   * Tests a complete round-trip encryption/decryption cycle
   * with various data types and formats.
   *
   * **Test Cases**:
   * - Short strings
   * - Long strings
   * - Special characters
   * - Empty strings
   * - Unicode content
   *
   * @param data - Test data with multiple samples
   * @returns Round-trip test results
   *
   * @example
   * ```typescript
   * POST /encryption/round-trip
   * {
   *   "samples": [
   *     "Short text",
   *     "Lorem ipsum dolor sit amet...",
   *     "Special chars: !@#$%^&*()",
   *     "Unicode: 你好世界 🌍"
   *   ]
   * }
   * ```
   */
  @Post('round-trip')
  async testRoundTrip(@Body() data: { samples?: string[] }): Promise<{
    results: Array<{
      original: string;
      encrypted: string;
      decrypted: string;
      matches: boolean;
      length_original: number;
      length_encrypted: number;
    }>;
    all_passed: boolean;
    total_tests: number;
    cipher: string;
  }> {
    const samples = data.samples || [
      'Short',
      'Medium length text for testing',
      'A much longer text that spans multiple lines and contains various characters to test the encryption algorithm thoroughly.',
      'Special: !@#$%^&*()_+-=[]{}|;:,.<>?',
      'Unicode: 你好世界 🌍 مرحبا בעולם',
      '',
    ];

    const results = [];

    for (const sample of samples) {
      const encrypted = await this.encryptionService.encryptString(sample);
      const decrypted = await this.encryptionService.decrypt(encrypted);
      const matches = decrypted === sample;

      results.push({
        original: sample,
        encrypted: encrypted.substring(0, 50) + '...', // Truncate for readability
        decrypted,
        matches,
        length_original: sample.length,
        length_encrypted: encrypted.length,
      });
    }

    const allPassed = results.every((r) => r.matches);
    const cipher = this.encryptionService.getCipher();

    return {
      results,
      all_passed: allPassed,
      total_tests: samples.length,
      cipher,
    };
  }

  /**
   * Test Format Compatibility
   *
   * Tests encryption/decryption with different payload formats
   * (string vs object) to ensure compatibility.
   *
   * **Format Tests**:
   * - Encrypt as object, decrypt as object
   * - Encrypt as string, decrypt as string
   * - Cross-format decryption
   *
   * @param data - The plaintext to test
   * @returns Format compatibility results
   *
   * @example
   * ```typescript
   * POST /encryption/format-test
   * {
   *   "plaintext": "Format test data"
   * }
   * ```
   */
  @Post('format-test')
  async testFormats(@Body() data: { plaintext: string }): Promise<{
    test1_object_format: {
      encrypted: object | string;
      decrypted: string;
      success: boolean;
    };
    test2_string_format: {
      encrypted: string;
      decrypted: string;
      success: boolean;
    };
    test3_cross_format: {
      encrypted_as_object: object | string;
      encrypted_as_string: string;
      decrypted_from_object: string;
      decrypted_from_string: string;
      both_match: boolean;
    };
    all_tests_passed: boolean;
    cipher: string;
  }> {
    // Test 1: Object format
    const encryptedObject = await this.encryptionService.encrypt(data.plaintext, false);
    const decryptedObject = await this.encryptionService.decrypt(encryptedObject);
    const test1Success = decryptedObject === data.plaintext;

    // Test 2: String format
    const encryptedString = await this.encryptionService.encryptString(data.plaintext);
    const decryptedString = await this.encryptionService.decrypt(encryptedString);
    const test2Success = decryptedString === data.plaintext;

    // Test 3: Cross-format
    const encObj = await this.encryptionService.encrypt(data.plaintext, false);
    const encStr = await this.encryptionService.encryptString(data.plaintext);
    const decObj = await this.encryptionService.decrypt(encObj);
    const decStr = await this.encryptionService.decrypt(encStr);
    const test3Success = decObj === data.plaintext && decStr === data.plaintext;

    const cipher = this.encryptionService.getCipher();

    return {
      test1_object_format: {
        encrypted: encryptedObject,
        decrypted: decryptedObject,
        success: test1Success,
      },
      test2_string_format: {
        encrypted: encryptedString.substring(0, 50) + '...', // Truncate for display
        decrypted: decryptedString,
        success: test2Success,
      },
      test3_cross_format: {
        encrypted_as_object: encObj,
        encrypted_as_string: encStr.substring(0, 50) + '...',
        decrypted_from_object: decObj,
        decrypted_from_string: decStr,
        both_match: test3Success,
      },
      all_tests_passed: test1Success && test2Success && test3Success,
      cipher,
    };
  }
}
