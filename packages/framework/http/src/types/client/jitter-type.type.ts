/**
 * Jitter type for randomizing retry delays.
 *
 * - none: No jitter, use exact calculated delay
 * - full: Random delay between 0 and calculated delay
 * - equal: Half calculated delay + random half
 * - decorrelated: AWS-style decorrelated jitter
 */
export type JitterType = 'none' | 'full' | 'equal' | 'decorrelated';
