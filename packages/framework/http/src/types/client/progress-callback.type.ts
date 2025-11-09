import type { Batch } from '../../client/batch';
import type { ClientResponse } from '../../client/response';

/**
 * Callback executed after each successful request.
 */
export type ProgressCallback = (
  batch: Batch,
  key: string,
  response: ClientResponse
) => void | Promise<void>;
