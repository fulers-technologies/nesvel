import { BaseException } from '@nesvel/shared';

/**
 * Database Exception
 *
 * Thrown when database connectivity, configuration, or general database-related
 * errors occur that are not specific to queries or models. This exception handles
 * connection failures, configuration issues, migration problems, and other
 * database infrastructure concerns.
 *
 * @example
 * ```typescript
 * // Connection failure
 * throw DatabaseException.make('CONNECTION_FAILED', 'Unable to connect to PostgreSQL database');
 *
 * // Configuration error
 * throw DatabaseException.make('CONFIG_ERROR', 'Invalid database configuration', { host: 'localhost' });
 *
 * // Migration error
 * throw DatabaseException.forMigrationFailure('CreateUsersTable', 'Column already exists');
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class DatabaseException extends BaseException {
  /**
   * The type/category of database error
   */
  public readonly errorType: string;

  /**
   * The database connection name affected (if applicable)
   */
  public readonly connectionName?: string;

  /**
   * Additional error details or configuration that caused the issue
   */
  public readonly details?: Record<string, any>;

  /**
   * The original underlying error if available
   */
  public readonly originalError?: Error;

  /**
   * Timestamp when the error occurred
   */
  public readonly timestamp: Date;

  /**
   * Create a new database exception
   *
   * @param errorType - The type/category of database error
   * @param message - Human-readable error message
   * @param details - Additional error details or configuration
   * @param connectionName - The database connection name (optional)
   * @param originalError - The original underlying error (optional)
   */
  constructor(
    errorType: string,
    message: string,
    details?: Record<string, any>,
    connectionName?: string,
    originalError?: Error,
  ) {
    super(message);

    this.name = 'DatabaseException';
    this.errorType = errorType;
    if (connectionName !== undefined) {
      this.connectionName = connectionName;
    }
    if (details !== undefined) {
      this.details = details;
    }
    if (originalError !== undefined) {
      this.originalError = originalError;
    }
    this.timestamp = new Date();
  }

  /**
   * Get the error type/category
   *
   * @returns The database error type
   */
  getErrorType(): string {
    return this.errorType;
  }

  /**
   * Get the affected connection name
   *
   * @returns The database connection name or undefined
   */
  getConnectionName(): string | undefined {
    return this.connectionName;
  }

  /**
   * Get additional error details
   *
   * @returns Object with error details or undefined
   */
  getDetails(): Record<string, any> | undefined {
    return this.details ? { ...this.details } : undefined;
  }

  /**
   * Get the original underlying error
   *
   * @returns The original error that caused this exception
   */
  getOriginalError(): Error | undefined {
    return this.originalError;
  }

  /**
   * Get the timestamp when the error occurred
   *
   * @returns Date when the exception was created
   */
  getTimestamp(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Check if this is a connection-related error
   *
   * @returns True if the error is related to database connectivity
   */
  isConnectionError(): boolean {
    const connectionTypes = [
      'CONNECTION_FAILED',
      'CONNECTION_TIMEOUT',
      'CONNECTION_REFUSED',
      'CONNECTION_LOST',
      'AUTHENTICATION_FAILED',
    ];
    return connectionTypes.includes(this.errorType);
  }

  /**
   * Check if this is a configuration-related error
   *
   * @returns True if the error is related to database configuration
   */
  isConfigurationError(): boolean {
    const configTypes = [
      'CONFIG_ERROR',
      'INVALID_CONFIG',
      'MISSING_CONFIG',
      'CONFIG_VALIDATION_FAILED',
    ];
    return configTypes.includes(this.errorType);
  }

  /**
   * Check if this is a migration-related error
   *
   * @returns True if the error is related to database migrations
   */
  isMigrationError(): boolean {
    const migrationTypes = [
      'MIGRATION_FAILED',
      'MIGRATION_ROLLBACK_FAILED',
      'MIGRATION_NOT_FOUND',
      'MIGRATION_ALREADY_RUN',
    ];
    return migrationTypes.includes(this.errorType);
  }

  /**
   * Check if this error is recoverable (can be retried)
   *
   * @returns True if the operation can potentially be retried
   */
  isRecoverable(): boolean {
    const recoverableTypes = ['CONNECTION_TIMEOUT', 'CONNECTION_LOST', 'TEMPORARY_UNAVAILABLE'];
    return recoverableTypes.includes(this.errorType);
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Sanitized error message suitable for client consumption
   */
  getApiMessage(): string {
    if (this.isConnectionError()) {
      return 'Database connection error. Please try again later.';
    }

    if (this.isConfigurationError()) {
      return 'Database configuration error. Please contact support.';
    }

    if (this.isMigrationError()) {
      return 'Database schema error. Please contact support.';
    }

    return 'A database error occurred. Please try again later.';
  }

  /**
   * Get detailed error information for logging
   *
   * @returns Object containing all error details for comprehensive logging
   */
  getLogDetails(): {
    errorType: string;
    message: string;
    connectionName?: string;
    details?: Record<string, any>;
    timestamp: string;
    originalError?: {
      name: string;
      message: string;
      stack?: string;
    };
    errorCategories: {
      isConnectionError: boolean;
      isConfigurationError: boolean;
      isMigrationError: boolean;
      isRecoverable: boolean;
    };
  } {
    return {
      errorType: this.errorType,
      message: this.message,
      ...(this.connectionName && { connectionName: this.connectionName }),
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp.toISOString(),
      ...(this.originalError && {
        originalError: {
          name: this.originalError.name,
          message: this.originalError.message,
          ...(this.originalError.stack && { stack: this.originalError.stack }),
        },
      }),
      errorCategories: {
        isConnectionError: this.isConnectionError(),
        isConfigurationError: this.isConfigurationError(),
        isMigrationError: this.isMigrationError(),
        isRecoverable: this.isRecoverable(),
      },
    };
  }

  /**
   * Create exception for connection failure
   *
   * @param connectionName - The connection name
   * @param host - The database host
   * @param port - The database port
   * @param originalError - The original connection error
   * @returns New DatabaseException instance
   */
  static forConnectionFailure(
    connectionName: string,
    host: string,
    port: number,
    originalError?: Error,
  ): DatabaseException {
    const message = `Failed to connect to database '${connectionName}' at ${host}:${port}`;
    const details = { host, port };
    return new DatabaseException(
      'CONNECTION_FAILED',
      message,
      details,
      connectionName,
      originalError,
    );
  }

  /**
   * Create exception for authentication failure
   *
   * @param connectionName - The connection name
   * @param username - The username that failed authentication
   * @param originalError - The original authentication error
   * @returns New DatabaseException instance
   */
  static forAuthenticationFailure(
    connectionName: string,
    username: string,
    originalError?: Error,
  ): DatabaseException {
    const message = `Authentication failed for user '${username}' on database '${connectionName}'`;
    const details = { username };
    return new DatabaseException(
      'AUTHENTICATION_FAILED',
      message,
      details,
      connectionName,
      originalError,
    );
  }

  /**
   * Create exception for configuration error
   *
   * @param field - The configuration field that is invalid
   * @param value - The invalid configuration value
   * @param connectionName - The connection name (optional)
   * @returns New DatabaseException instance
   */
  static forConfigurationError(
    field: string,
    value: any,
    connectionName?: string,
  ): DatabaseException {
    const message = `Invalid database configuration: ${field} = ${value}`;
    const details = { field, value };
    return new DatabaseException('CONFIG_ERROR', message, details, connectionName);
  }

  /**
   * Create exception for migration failure
   *
   * @param migrationName - The name of the failed migration
   * @param reason - The reason for the migration failure
   * @param connectionName - The connection name (optional)
   * @returns New DatabaseException instance
   */
  static forMigrationFailure(
    migrationName: string,
    reason: string,
    connectionName?: string,
  ): DatabaseException {
    const message = `Migration '${migrationName}' failed: ${reason}`;
    const details = { migrationName, reason };
    return new DatabaseException('MIGRATION_FAILED', message, details, connectionName);
  }

  /**
   * Create exception for connection timeout
   *
   * @param connectionName - The connection name
   * @param timeout - The timeout duration in milliseconds
   * @param originalError - The original timeout error
   * @returns New DatabaseException instance
   */
  static forConnectionTimeout(
    connectionName: string,
    timeout: number,
    originalError?: Error,
  ): DatabaseException {
    const message = `Connection timeout after ${timeout}ms for database '${connectionName}'`;
    const details = { timeout };
    return new DatabaseException(
      'CONNECTION_TIMEOUT',
      message,
      details,
      connectionName,
      originalError,
    );
  }

  /**
   * Create exception for missing configuration
   *
   * @param requiredFields - Array of missing required configuration fields
   * @param connectionName - The connection name (optional)
   * @returns New DatabaseException instance
   */
  static forMissingConfiguration(
    requiredFields: string[],
    connectionName?: string,
  ): DatabaseException {
    const fieldList = requiredFields.join(', ');
    const message = `Missing required database configuration fields: ${fieldList}`;
    const details = { requiredFields };
    return new DatabaseException('MISSING_CONFIG', message, details, connectionName);
  }

  /**
   * Create exception for database unavailable
   *
   * @param connectionName - The connection name
   * @param reason - The reason the database is unavailable
   * @param originalError - The original error
   * @returns New DatabaseException instance
   */
  static forDatabaseUnavailable(
    connectionName: string,
    reason: string,
    originalError?: Error,
  ): DatabaseException {
    const message = `Database '${connectionName}' is temporarily unavailable: ${reason}`;
    const details = { reason };
    return new DatabaseException(
      'TEMPORARY_UNAVAILABLE',
      message,
      details,
      connectionName,
      originalError,
    );
  }
}
