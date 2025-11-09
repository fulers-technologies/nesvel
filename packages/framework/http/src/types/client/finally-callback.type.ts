import type { Batch } from '../../client/batch';

/**
 * Callback executed after all requests finish (success or failure).
 */
export type FinallyCallback = (batch: Batch) => void | Promise<void>;
