import type { Batch } from '../../client/batch';
import type { ClientResponse } from '../../client/response';

/**
 * Callback executed if all requests succeeded.
 */
export type ThenCallback = (
  batch: Batch,
  responses: Record<string, ClientResponse>
) => void | Promise<void>;
