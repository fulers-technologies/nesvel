import { HashingException } from './hashing.exception';

/**
 * Unsupported Algorithm Exception
 *
 * Thrown when an unsupported hashing algorithm is requested.
 *
 * @class UnsupportedAlgorithmException
 */
export class UnsupportedAlgorithmException extends HashingException {
  constructor(algorithm: string) {
    super(`Unsupported hashing algorithm: ${algorithm}`);
    this.name = 'UnsupportedAlgorithmException';
  }
}
