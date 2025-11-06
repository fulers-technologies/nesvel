import { RedisScaleReads } from '@enums/redis-scale-reads.enum';

/**
 * Configuration options for the Redis PubSub driver.
 *
 * This interface defines the connection and behavior options for the Redis
 * driver implementation. It closely mirrors the ioredis configuration options
 * while providing sensible defaults for pub/sub use cases.
 *
 * The Redis driver uses two separate connections:
 * - One for publishing messages
 * - One for subscribing to channels (required by Redis protocol)
 */
export interface IRedisOptions {
  /**
   * Redis server hostname or IP address.
   *
   * @default 'localhost'
   */
  host?: string;

  /**
   * Redis server port number.
   *
   * @default 6379
   */
  port?: number;

  /**
   * Redis authentication password.
   * Required if the Redis server has authentication enabled.
   */
  password?: string;

  /**
   * Redis database index to use.
   *
   * @default 0
   */
  db?: number;

  /**
   * Username for Redis ACL authentication (Redis 6+).
   * When provided, username/password authentication is used instead of
   * password-only authentication.
   */
  username?: string;

  /**
   * Connection timeout in milliseconds.
   *
   * @default 10000
   */
  connectTimeout?: number;

  /**
   * Whether to automatically reconnect on connection loss.
   *
   * @default true
   */
  autoResubscribe?: boolean;

  /**
   * Whether to automatically resend unfulfilled commands on reconnect.
   *
   * @default true
   */
  autoResendUnfulfilledCommands?: boolean;

  /**
   * Maximum number of reconnection attempts.
   * Set to null for unlimited attempts.
   *
   * @default null
   */
  maxRetriesPerRequest?: number | null;

  /**
   * Enable offline queue for commands sent while disconnected.
   *
   * @default true
   */
  enableOfflineQueue?: boolean;

  /**
   * TLS/SSL connection options.
   * When provided, the connection will use TLS encryption.
   */
  tls?: {
    /**
     * Path to CA certificate file.
     */
    ca?: string;

    /**
     * Path to client certificate file.
     */
    cert?: string;

    /**
     * Path to client private key file.
     */
    key?: string;

    /**
     * Whether to reject unauthorized certificates.
     *
     * @default true
     */
    rejectUnauthorized?: boolean;
  };

  /**
   * Redis Cluster configuration.
   * When provided, the driver will connect to a Redis Cluster instead
   * of a single Redis instance.
   */
  cluster?: {
    /**
     * Array of cluster node addresses.
     *
     * @example [{ host: 'node1', port: 6379 }, { host: 'node2', port: 6379 }]
     */
    nodes: Array<{ host: string; port: number }>;

    /**
     * Cluster-specific options.
     */
    options?: {
      /**
       * Whether to enable read operations from replica nodes.
       *
       * @default RedisScaleReads.MASTER
       */
      scaleReads?: RedisScaleReads;

      /**
       * Maximum number of redirections to follow.
       *
       * @default 16
       */
      maxRedirections?: number;
    };
  };

  /**
   * Custom key prefix for all pub/sub channels.
   * This prefix is automatically added to all channel names.
   *
   * @example 'myapp:pubsub:'
   */
  keyPrefix?: string;

  /**
   * Whether to use pattern-based subscriptions by default.
   * When true, all subscriptions will use PSUBSCRIBE instead of SUBSCRIBE,
   * allowing wildcard matching in channel names.
   *
   * @default false
   */
  usePatternSubscribe?: boolean;
}

/**
 * Namespace for IRedisOptions interface containing the symbol for dependency injection.
 */
export namespace IRedisOptions {
  /**
   * Unique symbol identifier for the IRedisOptions interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IRedisOptions');
}
