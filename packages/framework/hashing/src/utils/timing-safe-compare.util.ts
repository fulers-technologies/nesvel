import { timingSafeEqual } from 'crypto';

/**
 * Timing-Safe String Comparison Utility
 *
 * Provides timing-attack resistant string comparison for security-sensitive operations.
 * Uses Node.js's built-in timingSafeEqual for constant-time comparison.
 */
export class TimingSafeCompare {
  /**
   * Compare two strings in constant time to prevent timing attacks.
   *
   * This method ensures that the comparison takes the same amount of time
   * regardless of where the strings differ, preventing attackers from
   * using timing information to guess values character by character.
   *
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns true if strings are equal, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = TimingSafeCompare.compare('secret123', userInput);
   * if (isValid) {
   *   // Grant access
   * }
   * ```
   */
  static compare(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }

    // If lengths differ, use dummy comparison to maintain constant time
    if (a.length !== b.length) {
      // Compare against itself to maintain timing consistency
      const dummy = Buffer.from(a);
      timingSafeEqual(dummy, dummy);
      return false;
    }

    try {
      const bufferA = Buffer.from(a, 'utf8');
      const bufferB = Buffer.from(b, 'utf8');

      return timingSafeEqual(bufferA, bufferB);
    } catch (error: Error | any) {
      // If Buffer creation or comparison fails, return false
      return false;
    }
  }

  /**
   * Compare two buffers in constant time.
   *
   * @param a - First buffer
   * @param b - Second buffer
   * @returns true if buffers are equal, false otherwise
   *
   * @example
   * ```typescript
   * const bufferA = Buffer.from('data');
   * const bufferB = Buffer.from('data');
   * const isEqual = TimingSafeCompare.compareBuffers(bufferA, bufferB);
   * ```
   */
  static compareBuffers(a: Buffer, b: Buffer): boolean {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      return false;
    }

    if (a.length !== b.length) {
      // Maintain timing by comparing against itself
      timingSafeEqual(a.subarray(0, 1), a.subarray(0, 1));
      return false;
    }

    try {
      return timingSafeEqual(a, b);
    } catch (error: Error | any) {
      return false;
    }
  }
}
