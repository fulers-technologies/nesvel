import { HashingException } from './hashing.exception';

/**
 * Verification Exception
 *
 * Thrown when hash verification fails.
 *
 * @class VerificationException
 */
export class VerificationException extends HashingException {
  constructor(message: string = 'Hash verification failed') {
    super(message);
    this.name = 'VerificationException';
  }
}
