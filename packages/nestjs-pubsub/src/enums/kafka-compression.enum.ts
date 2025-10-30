/**
 * Kafka Compression Type Enum
 *
 * Defines the compression algorithms supported for Kafka message payloads.
 * Compression reduces network bandwidth and storage requirements but adds
 * CPU overhead for compression/decompression.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum KafkaCompression {
  /**
   * No compression
   * Messages are sent uncompressed
   * Fastest processing, highest bandwidth usage
   */
  NONE = 'none',

  /**
   * GZIP compression
   * Good compression ratio, moderate CPU usage
   * Widely supported, good for text-heavy messages
   */
  GZIP = 'gzip',

  /**
   * Snappy compression
   * Fast compression/decompression, moderate compression ratio
   * Developed by Google, optimized for speed
   */
  SNAPPY = 'snappy',

  /**
   * LZ4 compression
   * Very fast compression/decompression, good compression ratio
   * Recommended for high-throughput scenarios
   */
  LZ4 = 'lz4',

  /**
   * ZSTD compression
   * Excellent compression ratio, configurable speed/ratio trade-off
   * Developed by Facebook, best overall performance
   * Requires Kafka 2.1.0+
   */
  ZSTD = 'zstd',
}
