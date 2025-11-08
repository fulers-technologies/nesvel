/**
 * Kafka SASL Mechanism Enum
 *
 * Defines the supported SASL (Simple Authentication and Security Layer)
 * authentication mechanisms for Kafka connections. Different mechanisms
 * provide varying levels of security and compatibility.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum KafkaSaslMechanism {
  /**
   * PLAIN authentication mechanism
   * Simple username/password authentication sent in plaintext
   * Should be used with TLS encryption
   */
  PLAIN = 'plain',

  /**
   * SCRAM-SHA-256 authentication mechanism
   * Salted Challenge Response Authentication Mechanism using SHA-256
   * More secure than PLAIN, provides mutual authentication
   */
  SCRAM_SHA_256 = 'scram-sha-256',

  /**
   * SCRAM-SHA-512 authentication mechanism
   * Salted Challenge Response Authentication Mechanism using SHA-512
   * Strongest SCRAM variant, recommended for high-security environments
   */
  SCRAM_SHA_512 = 'scram-sha-512',

  /**
   * AWS IAM authentication mechanism
   * Uses AWS Identity and Access Management for authentication
   * Required for AWS MSK (Managed Streaming for Apache Kafka)
   */
  AWS = 'aws',
}
