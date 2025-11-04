/**
 * Default throttle configuration.
 *
 * Applied when throttling is enabled but no specific settings are provided.
 * Controls request rate at the endpoint level to prevent abuse.
 *
 * @constant
 */
export const DEFAULT_THROTTLE = {
  /**
   * Maximum number of requests allowed within the time window.
   * Requests exceeding this limit receive 429 Too Many Requests.
   * @default 100 requests
   */
  limit: 100,

  /**
   * Time window in seconds for throttling.
   * Counter resets after this period.
   * @default 60 seconds (1 minute)
   */
  ttl: 60,
};
