import { HashAlgorithm } from '@enums';

/**
 * Hash Algorithm Analyzer
 *
 * Utility for detecting and analyzing hash algorithms based on hash format.
 * Supports common password hashing algorithms used in web applications.
 */
export class HashAnalyzer {
  /**
   * Detect the hashing algorithm from a hash string.
   *
   * Analyzes the hash format to determine which algorithm was used.
   * Returns null if the format is not recognized.
   *
   * @param hash - The hash string to analyze
   * @returns The detected algorithm or null if unknown
   *
   * @example
   * ```typescript
   * const algorithm = HashAnalyzer.detectAlgorithm('$2a$10$...');
   * // Returns: 'bcrypt'
   *
   * const algorithm = HashAnalyzer.detectAlgorithm('$argon2id$v=19$m=65536...');
   * // Returns: 'argon2id'
   * ```
   */
  static detectAlgorithm(hash: string): string | null {
    if (!hash || typeof hash !== 'string') {
      return null;
    }

    // Bcrypt: $2a$, $2b$, $2x$, $2y$
    if (/^\$2[abxy]\$\d{1,2}\$/.test(hash)) {
      return HashAlgorithm.BCRYPT;
    }

    // Argon2id: $argon2id$
    if (/^\$argon2id\$/.test(hash)) {
      return HashAlgorithm.ARGON2ID;
    }

    // Argon2i: $argon2i$
    if (/^\$argon2i\$/.test(hash)) {
      return HashAlgorithm.ARGON2;
    }

    // Argon2d: $argon2d$ (not commonly used for passwords)
    if (/^\$argon2d\$/.test(hash)) {
      return 'argon2d';
    }

    // Scrypt: not standardized format, but often uses $scrypt$ prefix
    if (/^\$scrypt\$/.test(hash)) {
      return 'scrypt';
    }

    return null;
  }

  /**
   * Check if a string appears to be a hashed value.
   *
   * Performs a basic check to determine if a string looks like a hash
   * rather than plain text.
   *
   * @param value - The value to check
   * @returns true if the value appears to be hashed
   *
   * @example
   * ```typescript
   * HashAnalyzer.isHashed('password123');
   * // Returns: false
   *
   * HashAnalyzer.isHashed('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
   * // Returns: true
   * ```
   */
  static isHashed(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Check for common hash prefixes
    if (value.startsWith('$')) {
      return this.detectAlgorithm(value) !== null;
    }

    // Check for hex-encoded hashes (64+ chars)
    if (/^[a-f0-9]{64,}$/i.test(value)) {
      return true;
    }

    // Check for base64-encoded hashes
    if (/^[A-Za-z0-9+/]{40,}={0,2}$/.test(value)) {
      return true;
    }

    return false;
  }

  /**
   * Parse bcrypt hash to extract algorithm version and rounds.
   *
   * @param hash - The bcrypt hash
   * @returns Parsed bcrypt information or null
   *
   * @example
   * ```typescript
   * const info = HashAnalyzer.parseBcryptHash('$2a$10$...');
   * // Returns: { version: '2a', rounds: 10 }
   * ```
   */
  static parseBcryptHash(hash: string): { version: string; rounds: number } | null {
    const match = hash.match(/^\$2([abxy])\$(\d{1,2})\$/);
    if (!match || !match[1] || !match[2]) {
      return null;
    }

    return {
      version: `2${match[1]}`,
      rounds: parseInt(match[2], 10),
    };
  }

  /**
   * Parse Argon2 hash to extract parameters.
   *
   * @param hash - The Argon2 hash
   * @returns Parsed Argon2 information or null
   *
   * @example
   * ```typescript
   * const info = HashAnalyzer.parseArgon2Hash('$argon2id$v=19$m=65536,t=3,p=4$...');
   * // Returns: { type: 'argon2id', version: 19, memory: 65536, time: 3, parallelism: 4 }
   * ```
   */
  static parseArgon2Hash(
    hash: string
  ): { type: string; version: number; memory: number; time: number; parallelism: number } | null {
    const match = hash.match(/^\$(argon2(?:id|i|d))\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$/);
    if (!match || !match[1] || !match[2] || !match[3] || !match[4] || !match[5]) {
      return null;
    }

    return {
      type: match[1],
      version: parseInt(match[2], 10),
      memory: parseInt(match[3], 10),
      time: parseInt(match[4], 10),
      parallelism: parseInt(match[5], 10),
    };
  }

  /**
   * Get a human-readable description of a hash algorithm.
   *
   * @param algorithm - The algorithm identifier
   * @returns A description of the algorithm
   *
   * @example
   * ```typescript
   * HashAnalyzer.getAlgorithmDescription('argon2id');
   * // Returns: 'Argon2id (OWASP recommended)'
   * ```
   */
  static getAlgorithmDescription(algorithm: string): string {
    switch (algorithm) {
      case HashAlgorithm.BCRYPT:
        return 'Bcrypt (widely used, battle-tested)';
      case HashAlgorithm.ARGON2ID:
        return 'Argon2id (OWASP recommended)';
      case HashAlgorithm.ARGON2:
        return 'Argon2i (memory-hard)';
      case 'argon2d':
        return 'Argon2d (GPU-resistant)';
      case 'scrypt':
        return 'Scrypt (memory-hard)';
      default:
        return 'Unknown algorithm';
    }
  }
}
