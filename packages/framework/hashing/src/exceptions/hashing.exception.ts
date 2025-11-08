import { BaseException } from '@nesvel/exceptions';

/**
 * Hashing Exception
 *
 * Base exception for all hashing-related errors.
 *
 * @class HashingException
 */
export class HashingException extends BaseException {
  constructor(message: string) {
    super(message);
    this.name = 'HashingException';
    Error.captureStackTrace(this, this.constructor);
  }
}
