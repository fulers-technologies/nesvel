/**
 * Kafka Log Level Enum
 *
 * Defines the logging levels for Kafka client operations.
 * Controls the verbosity of Kafka-related log output.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum KafkaLogLevel {
  /**
   * No logging
   * Suppresses all Kafka client logs
   */
  NOTHING = 'NOTHING',

  /**
   * Error-level logging only
   * Logs only critical errors and failures
   */
  ERROR = 'ERROR',

  /**
   * Warning-level logging
   * Logs errors and warnings
   */
  WARN = 'WARN',

  /**
   * Info-level logging
   * Logs errors, warnings, and informational messages
   * Recommended for production
   */
  INFO = 'INFO',

  /**
   * Debug-level logging
   * Logs detailed debugging information
   * Useful for development and troubleshooting
   */
  DEBUG = 'DEBUG',
}
