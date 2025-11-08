import { Logger } from '@nestjs/common';
import { IRetryOptions } from '../interfaces';
import { MaxRetriesExceededException } from '../exceptions';

/**
 * Utility class for executing operations with automatic retry logic.
 *
 * Implements exponential backoff retry pattern with configurable delays,
 * error filtering, and maximum retry limits. Useful for handling transient
 * failures in distributed systems.
 *
 * @remarks
 * The retry handler uses exponential backoff to avoid overwhelming failing
 * services. Each retry attempt waits longer than the previous one, up to
 * a configurable maximum delay.
 *
 * @example
 * ```typescript
 * const retryHandler = new RetryHandler(logger);
 *
 * try {
 *   const result = await retryHandler.executeWithRetry(
 *     async () => await publishToExternalService(message),
 *     {
 *       maxRetries: 3,
 *       retryDelay: 1000,
 *       backoffMultiplier: 2,
 *       retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT']
 *     }
 *   );
 * } catch (error: Error | any) {
 *   if (error instanceof MaxRetriesExceededError) {
 *     // All retries failed
 *     logger.error(`Failed after ${error.attempts} attempts`);
 *   }
 * }
 * ```
 */
export class RetryHandler {
  /**
   * Logger instance for recording retry attempts and failures.
   */
  private readonly logger = new Logger(RetryHandler.name);

  /**
   * Execute an operation with automatic retry logic.
   *
   * Attempts to execute the provided operation, retrying on failure according
   * to the retry options. Uses exponential backoff between attempts.
   *
   * @template T - The return type of the operation
   * @param operation - Async function to execute (returns Promise<T>)
   * @param options - Retry configuration options
   * @returns Promise that resolves with the operation result
   * @throws {MaxRetriesExceededError} When all retry attempts are exhausted
   * @throws {Error} When a non-retryable error occurs
   *
   * @example
   * ```typescript
   * const result = await retryHandler.executeWithRetry(
   *   async () => {
   *     const response = await fetch('https://api.example.com/data');
   *     if (!response.ok) throw new Error('HTTP ' + response.status);
   *     return response.json();
   *   },
   *   { maxRetries: 3, retryDelay: 1000 }
   * );
   * ```
   */
  async executeWithRetry<T>(operation: () => Promise<T>, options: IRetryOptions): Promise<T> {
    // Destructure options with defaults
    const {
      maxRetries,
      retryDelay,
      backoffMultiplier = 2,
      maxRetryDelay = 30000,
      retryableErrors,
      nonRetryableErrors,
      isRetryable: customIsRetryable,
    } = options;

    let lastError: Error;

    // Attempt the operation up to maxRetries + 1 times (initial attempt + retries)
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute the operation
        const result = await operation();

        // Success! Log if this was a retry
        if (attempt > 0) {
          this.logger.log(`Operation succeeded on attempt ${attempt + 1}/${maxRetries + 1}`);
        }

        return result;
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        const shouldRetry = this.shouldRetryError(
          error,
          customIsRetryable,
          retryableErrors,
          nonRetryableErrors,
        );

        if (!shouldRetry) {
          this.logger.warn(`Non-retryable error encountered: ${error.message}`, {
            errorName: error.name,
            attempt: attempt + 1,
          });
          throw error;
        }

        // If this was the last attempt, throw MaxRetriesExceededError
        if (attempt >= maxRetries) {
          const finalError = MaxRetriesExceededException.make(
            `Operation failed after ${maxRetries + 1} attempts: ${error.message}`,
            error,
            maxRetries + 1,
          );
          this.logger.error(finalError.message, error.stack, {
            attempts: maxRetries + 1,
            lastError: error.message,
          });
          throw finalError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(retryDelay * Math.pow(backoffMultiplier, attempt), maxRetryDelay);

        // Log retry attempt
        this.logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: error.message,
          errorName: error.name,
          attempt: attempt + 1,
          maxRetries,
          delay,
          nextDelay: Math.min(retryDelay * Math.pow(backoffMultiplier, attempt + 1), maxRetryDelay),
        });

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // This should never be reached due to the throw in the loop,
    // but TypeScript requires it for type safety
    throw lastError!;
  }

  /**
   * Determine if an error should trigger a retry attempt.
   *
   * Checks the error against retry configuration to decide if another
   * attempt should be made. Considers custom retry functions, whitelists,
   * and blacklists.
   *
   * @param error - The error to check
   * @param customIsRetryable - Custom retry decision function
   * @param retryableErrors - Whitelist of retryable error patterns
   * @param nonRetryableErrors - Blacklist of non-retryable error patterns
   * @returns True if the error should trigger a retry, false otherwise
   */
  private shouldRetryError(
    error: Error,
    customIsRetryable?: (error: Error) => boolean,
    retryableErrors?: string[],
    nonRetryableErrors?: string[],
  ): boolean {
    // If custom function provided, use it exclusively
    if (customIsRetryable) {
      return customIsRetryable(error);
    }

    // Check non-retryable errors first (blacklist takes precedence)
    if (nonRetryableErrors && nonRetryableErrors.length > 0) {
      const isNonRetryable = this.errorMatchesPatterns(error, nonRetryableErrors);
      if (isNonRetryable) {
        return false;
      }
    }

    // If retryable errors specified, check against whitelist
    if (retryableErrors && retryableErrors.length > 0) {
      return this.errorMatchesPatterns(error, retryableErrors);
    }

    // Default: all errors are retryable
    return true;
  }

  /**
   * Check if an error matches any of the provided patterns.
   *
   * Matches against both error message and error name/type.
   *
   * @param error - The error to check
   * @param patterns - Array of string patterns to match against
   * @returns True if error matches any pattern, false otherwise
   */
  private errorMatchesPatterns(error: Error, patterns: string[]): boolean {
    const errorMessage = error.message || '';
    const errorName = error.name || '';
    const errorCode = (error as any).code || '';

    return patterns.some((pattern) => {
      return (
        errorMessage.includes(pattern) || errorName.includes(pattern) || errorCode.includes(pattern)
      );
    });
  }

  /**
   * Sleep for the specified duration.
   *
   * Helper method for implementing delays between retry attempts.
   *
   * @param ms - Duration to sleep in milliseconds
   * @returns Promise that resolves after the specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
