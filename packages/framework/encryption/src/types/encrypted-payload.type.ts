/**
 * Structure of an encrypted payload.
 *
 * @remarks
 * This represents the serialized format of encrypted data, including
 * the initialization vector, authentication tag (for AEAD ciphers),
 * and the encrypted value itself.
 *
 * @example
 * ```typescript
 * const payload: EncryptedPayload = {
 *   iv: 'base64-encoded-iv',
 *   value: 'base64-encoded-ciphertext',
 *   tag: 'base64-encoded-auth-tag', // GCM only
 *   mac: 'hmac-sha256-signature'     // CBC only
 * };
 * ```
 */
export interface EncryptedPayload {
  /**
   * Initialization vector (IV) used for encryption.
   * Base64-encoded string.
   */
  iv: string;

  /**
   * The encrypted ciphertext.
   * Base64-encoded string.
   */
  value: string;

  /**
   * Authentication tag for AEAD ciphers (GCM, Sodium).
   * Base64-encoded string.
   * Only present for authenticated encryption modes.
   */
  tag?: string;

  /**
   * HMAC signature for CBC mode encryption.
   * Base64-encoded string.
   * Used to verify integrity when not using AEAD.
   */
  mac?: string;
}
