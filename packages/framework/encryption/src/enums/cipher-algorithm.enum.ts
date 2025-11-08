/**
 * Supported cipher algorithms for encryption.
 *
 * @enum {string}
 *
 * @remarks
 * - AES-128-CBC: AES with 128-bit key in CBC mode (requires 16-byte IV)
 * - AES-256-CBC: AES with 256-bit key in CBC mode (requires 16-byte IV)
 * - AES-128-GCM: AES with 128-bit key in GCM mode - AEAD (requires 12-byte IV)
 * - AES-256-GCM: AES with 256-bit key in GCM mode - AEAD (requires 12-byte IV)
 * - SODIUM: Modern authenticated encryption using libsodium (XChaCha20-Poly1305)
 */
export enum CipherAlgorithm {
  /**
   * AES-128-CBC - Advanced Encryption Standard with 128-bit key in CBC mode
   */
  AES_128_CBC = 'aes-128-cbc',

  /**
   * AES-256-CBC - Advanced Encryption Standard with 256-bit key in CBC mode
   */
  AES_256_CBC = 'aes-256-cbc',

  /**
   * AES-128-GCM - Advanced Encryption Standard with 128-bit key in GCM mode (AEAD)
   */
  AES_128_GCM = 'aes-128-gcm',

  /**
   * AES-256-GCM - Advanced Encryption Standard with 256-bit key in GCM mode (AEAD)
   */
  AES_256_GCM = 'aes-256-gcm',

  /**
   * SODIUM - Modern authenticated encryption using libsodium (XChaCha20-Poly1305)
   */
  SODIUM = 'sodium',
}
