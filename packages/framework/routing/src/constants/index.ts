/**
 * Constants exports for the API endpoint decorator.
 *
 * This module provides all default configuration constants used by
 * the decorator system. These defaults ensure consistent behavior
 * across all endpoints while allowing customization when needed.
 */

export { DEFAULT_CONSUMES } from './default-consumes.constant';
export { DEFAULT_PRODUCES } from './default-produces.constant';
export {
  DEFAULT_RESPONSE_HEADERS,
  DEFAULT_API_RESPONSE_HEADERS,
  DEFAULT_REQUEST_HEADERS,
} from './default-headers.constant';
export { DEFAULT_RESPONSES } from './default-responses.constant';
export { DEFAULT_CACHE_TTL } from './default-cache.constant';
export { DEFAULT_CORS } from './default-cors.constant';
export { DEFAULT_RATE_LIMIT } from './default-rate-limit.constant';
export { DEFAULT_CIRCUIT_BREAKER } from './default-circuit-breaker.constant';
export { DEFAULT_RETRY_POLICY } from './default-retry.constant';
export { DEFAULT_THROTTLE } from './default-throttle.constant';
