import { BaseException } from '@nesvel/shared';

/**
 * Query Exception
 *
 * Thrown when a database query execution fails. This exception provides detailed
 * information about the failed query including SQL statement, bindings, connection
 * details, and the underlying error cause. Inspired by Laravel's QueryException.
 *
 * @example
 * ```typescript
 * // Basic query exception
 * throw QueryException.make('default', 'SELECT * FROM users WHERE id = ?', [123], originalError);
 *
 * // With custom message
 * throw QueryException.make('postgres', 'INSERT INTO posts VALUES (?)', [data], error, 'Failed to create post');
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class QueryException extends BaseException {
  /**
   * The name of the database connection that failed
   */
  public readonly connectionName: string;

  /**
   * The SQL query that failed to execute
   */
  public readonly sql: string;

  /**
   * The parameter bindings used in the query
   */
  public readonly bindings: any[];

  /**
   * The original error that caused the query failure
   */
  public readonly previous?: Error;

  /**
   * The database error code if available
   */
  public readonly errorCode?: string | number;

  /**
   * The severity level of the error
   */
  public readonly severity?: string;

  /**
   * Create a new query exception
   *
   * @param connectionName - The name of the database connection
   * @param sql - The SQL query that failed
   * @param bindings - The parameter bindings used in the query
   * @param previous - The original error that caused the failure
   * @param customMessage - Optional custom error message
   * @param errorCode - Optional database error code
   * @param severity - Optional error severity level
   */
  constructor(
    connectionName: string,
    sql: string,
    bindings: any[] = [],
    previous?: Error,
    customMessage?: string,
    errorCode?: string | number,
    severity?: string,
  ) {
    let message: string;

    if (customMessage) {
      message = customMessage;
    } else if (previous) {
      message = `Database query failed on connection '${connectionName}': ${previous.message}`;
    } else {
      message = `Database query failed on connection '${connectionName}'`;
    }

    super(message);

    this.name = 'QueryException';
    this.connectionName = connectionName;
    this.sql = sql;
    this.bindings = bindings;
    if (previous !== undefined) {
      this.previous = previous;
    }
    if (errorCode !== undefined) {
      this.errorCode = errorCode;
    }
    if (severity !== undefined) {
      this.severity = severity;
    }
  }

  /**
   * Get the database connection name
   *
   * @returns The connection name where the query failed
   */
  getConnectionName(): string {
    return this.connectionName;
  }

  /**
   * Get the failed SQL query
   *
   * @returns The SQL statement that failed to execute
   */
  getSql(): string {
    return this.sql;
  }

  /**
   * Get the query parameter bindings
   *
   * @returns Array of parameter values used in the query
   */
  getBindings(): any[] {
    return [...this.bindings]; // Return a copy to prevent mutation
  }

  /**
   * Get the original underlying error
   *
   * @returns The original error that caused the query failure
   */
  getPrevious(): Error | undefined {
    return this.previous;
  }

  /**
   * Get the database error code
   *
   * @returns The error code from the database driver
   */
  getErrorCode(): string | number | undefined {
    return this.errorCode;
  }

  /**
   * Get the error severity level
   *
   * @returns The severity level of the error
   */
  getSeverity(): string | undefined {
    return this.severity;
  }

  /**
   * Check if this is a connection-related error
   *
   * @returns True if the error is related to database connection issues
   */
  isConnectionError(): boolean {
    if (!this.previous) return false;

    const message = this.previous.message.toLowerCase();
    return (
      message.includes('connection') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('refused')
    );
  }

  /**
   * Check if this is a constraint violation error
   *
   * @returns True if the error is related to database constraints
   */
  isConstraintError(): boolean {
    if (!this.previous) return false;

    const message = this.previous.message.toLowerCase();
    return (
      message.includes('constraint') ||
      message.includes('duplicate') ||
      message.includes('unique') ||
      message.includes('foreign key')
    );
  }

  /**
   * Format the SQL query with bindings for debugging purposes
   *
   * @param maxLength - Maximum length of formatted SQL (default: 1000)
   * @returns Formatted SQL with parameter values substituted
   */
  formatSql(maxLength: number = 1000): string {
    let formattedSql = this.sql.trim();

    // Replace parameter placeholders with actual values
    this.bindings.forEach((binding) => {
      let value: string;

      if (binding === null || binding === undefined) {
        value = 'NULL';
      } else if (typeof binding === 'string') {
        // Escape single quotes and wrap in quotes
        value = `'${binding.replace(/'/g, "''")}'`;
      } else if (binding instanceof Date) {
        value = `'${binding.toISOString()}'`;
      } else if (typeof binding === 'boolean') {
        value = binding ? 'TRUE' : 'FALSE';
      } else {
        value = String(binding);
      }

      // Replace first occurrence of ? with the formatted value
      formattedSql = formattedSql.replace('?', value);
    });

    // Truncate if too long
    if (formattedSql.length > maxLength) {
      formattedSql = formattedSql.substring(0, maxLength - 3) + '...';
    }

    return formattedSql;
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

    if (this.isConstraintError()) {
      return 'Data validation error. Please check your input and try again.';
    }

    return 'A database error occurred. Please try again later.';
  }

  /**
   * Get detailed error information for logging
   *
   * @returns Object containing all error details for comprehensive logging
   */
  getLogDetails(): {
    connection: string;
    sql: string;
    bindings: any[];
    formattedSql: string;
    errorCode?: string | number;
    severity?: string;
    originalError?: string;
    isConnectionError: boolean;
    isConstraintError: boolean;
  } {
    const result: {
      connection: string;
      sql: string;
      bindings: any[];
      formattedSql: string;
      errorCode?: string | number;
      severity?: string;
      originalError?: string;
      isConnectionError: boolean;
      isConstraintError: boolean;
    } = {
      connection: this.connectionName,
      sql: this.sql,
      bindings: this.bindings,
      formattedSql: this.formatSql(),
      isConnectionError: this.isConnectionError(),
      isConstraintError: this.isConstraintError(),
    };

    if (this.errorCode !== undefined) {
      result.errorCode = this.errorCode;
    }
    if (this.severity !== undefined) {
      result.severity = this.severity;
    }
    if (this.previous?.message !== undefined) {
      result.originalError = this.previous.message;
    }

    return result;
  }

  /**
   * Create a query exception for connection timeout
   *
   * @param connectionName - The connection name
   * @param timeout - The timeout duration in milliseconds
   * @returns New QueryException instance
   */
  static forConnectionTimeout(connectionName: string, timeout: number): QueryException {
    const message = `Connection timeout after ${timeout}ms on connection '${connectionName}'`;
    return new QueryException(connectionName, '', [], undefined, message, 'TIMEOUT', 'ERROR');
  }

  /**
   * Create a query exception for syntax error
   *
   * @param connectionName - The connection name
   * @param sql - The malformed SQL query
   * @param bindings - The query bindings
   * @param syntaxError - The syntax error details
   * @returns New QueryException instance
   */
  static forSyntaxError(
    connectionName: string,
    sql: string,
    bindings: any[],
    syntaxError: Error,
  ): QueryException {
    const message = `SQL syntax error: ${syntaxError.message}`;
    return new QueryException(
      connectionName,
      sql,
      bindings,
      syntaxError,
      message,
      'SYNTAX_ERROR',
      'ERROR',
    );
  }
}
