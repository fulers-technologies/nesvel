import type { Batch } from '../../client/batch';

/**
 * Callback executed before the batch starts.
 */
export type BeforeCallback = (batch: Batch) => void | Promise<void>;
