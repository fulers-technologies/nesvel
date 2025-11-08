import { CipherAlgorithm } from '@enums';

/**
 * Configuration options for encryption.
 *
 * @remarks
 * Defines the structure for encryption configuration including
 * the encryption key, cipher algorithm, and optional previous keys
 * for key rotation.
 */
export interface EncryptionConfig {
  /**
   * The primary encryption key.
   * Should be base64-encoded and match the required length for the cipher.
   */
  key: string;

  /**
   * The cipher algorithm to use for encryption.
   * @default CipherAlgorithm.AES_256_GCM
   */
  cipher?: CipherAlgorithm;

  /**
   * Previous encryption keys for key rotation and decryption of old data.
   * When decryption fails with the primary key, these keys will be tried in order.
   */
  previousKeys?: string[];

  /**
   * Whether to serialize encrypted payloads as JSON strings.
   * @default true
   */
  serialize?: boolean;
}
