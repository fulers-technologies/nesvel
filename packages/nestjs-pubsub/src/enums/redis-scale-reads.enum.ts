/**
 * Redis Scale Reads Enum
 *
 * Defines the read distribution strategy for Redis Cluster configurations.
 * Determines which nodes (master or replica) handle read operations.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum RedisScaleReads {
  /**
   * Read from master nodes only
   * All read operations are directed to master nodes
   * Ensures strongest consistency but may overload masters
   */
  MASTER = 'master',

  /**
   * Read from replica nodes only
   * All read operations are directed to replica (slave) nodes
   * Offloads masters but may read slightly stale data
   */
  SLAVE = 'slave',

  /**
   * Read from all nodes (master and replicas)
   * Read operations are distributed across all available nodes
   * Best performance and load distribution
   */
  ALL = 'all',
}
