import type { Batch } from '../../client/batch';

/**
 * Callback executed after each failed request.
 */
export type CatchCallback = (batch: Batch, key: string, error: Error) => void | Promise<void>;
