import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when attempting to modify a batch that has already started.
 *
 * Once a batch has been dispatched and is in progress, you cannot add
 * new requests to it. This exception prevents race conditions and ensures
 * batch integrity.
 *
 * @example
 * ```typescript
 * const batch = HttpClient.batch();
 * batch.as('users').get('/users');
 *
 * // Start the batch
 * const responses = await batch.dispatch();
 *
 * // This will throw BatchInProgressException
 * batch.as('posts').get('/posts');
 * ```
 */
export class BatchInProgressException extends BaseException {
  /**
   * Create a new batch in progress exception.
   */
  constructor() {
    super(
      'Cannot modify a batch that has already been dispatched. ' +
        'Create a new batch for additional requests.'
    );

    this.name = 'BatchInProgressException';
  }

  /**
   * Static factory method to create a new exception.
   *
   * @returns New exception instance
   */
  public static make(): BatchInProgressException {
    return new BatchInProgressException();
  }
}
