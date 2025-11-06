/**
 * Configuration options for the Memory PubSub driver.
 *
 * The Memory driver uses EventEmitter2 for in-process event handling.
 * These options configure the behavior of the underlying EventEmitter2 instance.
 *
 * @interface IMemoryOptions
 *
 * @see {@link https://github.com/EventEmitter2/EventEmitter2 | EventEmitter2}
 */
export interface IMemoryOptions {
  /**
   * Use wildcards in event names.
   *
   * When enabled, allows subscribing to events using wildcard patterns:
   * - '*' matches a single segment
   * - '**' matches multiple segments
   *
   * @default true
   *
   * @example
   * ```typescript
   * // With wildcards enabled:
   * emitter.on('user.*', handler); // Matches: user.created, user.updated
   * emitter.on('user.**', handler); // Matches: user.created, user.profile.updated
   * ```
   */
  wildcard?: boolean;

  /**
   * The delimiter used to segment event names when wildcards are enabled.
   *
   * @default '.'
   *
   * @example
   * ```typescript
   * // With delimiter '.'
   * 'user.created' // segments: ['user', 'created']
   *
   * // With delimiter ':'
   * 'user:created' // segments: ['user', 'created']
   * ```
   */
  delimiter?: string;

  /**
   * If set to true, newListener and removeListener events will be emitted.
   *
   * @default false
   */
  newListener?: boolean;

  /**
   * If set to true, removeListener events will be emitted.
   *
   * @default false
   */
  removeListener?: boolean;

  /**
   * Maximum number of listeners that can be assigned to an event.
   *
   * Set to 0 for unlimited listeners.
   *
   * @default 10
   */
  maxListeners?: number;

  /**
   * Show event name in memory leak warning when max listeners is exceeded.
   *
   * @default false
   */
  verboseMemoryLeak?: boolean;

  /**
   * Disable throwing an uncaughtException if an error event is emitted
   * and it has no listeners.
   *
   * @default false
   */
  ignoreErrors?: boolean;
}
