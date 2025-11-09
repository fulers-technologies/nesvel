import ora from 'ora';
import { ulid } from 'ulid';

import { LogLevel } from '@/enums';

/**
 * LogsActivities concern mixin.
 *
 * This concern provides methods for logging activities - significant user or
 * system actions that should be tracked for auditing, analytics, or business
 * intelligence purposes.
 *
 * Activities differ from regular log messages in that they represent business
 * events rather than technical events. They're typically stored separately and
 * used for user activity tracking, audit trails, and analytics.
 *
 * @class LogsActivitiesConcern
 *
 * @example
 * ```typescript
 * class LoggerService extends Mixin(LogsActivitiesConcern, OtherConcern) {
 *   // Logger service with activity logging
 * }
 *
 * logger.activity('user.login', 'user_123', 'User logged in via OAuth');
 * logger.activity('order.created', 'user_456', 'Order placed', {
 *   orderId: 'order_789',
 *   total: 99.99
 * });
 * ```
 */
export class LogsActivitiesConcern {
  /**
   * Activity tracking storage.
   */
  protected activities: Record<string, any> = {};

  /**
   * Begin an activity.
   *
   * Activities are long-running operations that can be tracked with progress
   * updates. In development they may be displayed as spinners; in production
   * they are logged at the info level.
   *
   * @param message - The message to log the activity under
   * @param config - Optional configuration for the activity
   *
   * @returns The id of the activity for progress/success/failure operations
   *
   * @example
   * ```typescript
   * const activityId = logger.activity('Processing users', { total: 100 });
   * // ... do work ...
   * logger.success(activityId, 'All users processed');
   * ```
   */
  activity(message: string, config: any = {}): string {
    const id = ulid();
    if (
      (process.env.NODE_ENV || 'development').startsWith('dev') &&
      (this as any).shouldLog('info')
    ) {
      const activity = ora(message).start();

      this.activities[id] = {
        activity,
        config,
        start: Date.now(),
      };

      return id;
    } else {
      this.activities[id] = {
        start: Date.now(),
        config,
      };

      (this as any).write.log({
        activity_id: id,
        level: LogLevel.INFO,
        config,
        message,
      });

      return id;
    }
  }

  /**
   * Reports progress on an activity.
   *
   * Updates an existing activity with progress information. The activity
   * will be logged at the info level with the activity ID.
   *
   * @param activityId - The id of the activity as returned by activity()
   * @param message - The progress message to log
   *
   * @example
   * ```typescript
   * logger.progress(activityId, 'Processed 50/100 users');
   * ```
   */
  progress(activityId: string, message: string): void {
    if (this.activities[activityId]) {
      (this as any).write(LogLevel.INFO, message, {
        activity_id: activityId,
      });
    } else {
      (this as any).write(LogLevel.INFO, message);
    }
  }

  /**
   * Reports success of an activity.
   *
   * Marks an activity as successfully completed and logs at the info level.
   * Returns data about the activity including duration.
   *
   * @param activityId - The id of the activity as returned by activity()
   * @param message - The success message to log
   *
   * @returns Data about the activity including duration
   *
   * @example
   * ```typescript
   * const result = logger.success(activityId, 'All users processed');
   * console.log(`Completed in ${result.duration}ms`);
   * ```
   */
  success(activityId: string, message: string): Record<string, any> | null {
    const time = Date.now();

    if (this.activities[activityId]) {
      const activity = this.activities[activityId];
      const duration = time - activity.start;

      (this as any).write(LogLevel.INFO, message, {
        activity_id: activityId,
        duration,
      });

      const result = {
        ...activity,
        duration,
      };

      // Clean up
      delete this.activities[activityId];

      return result;
    }

    (this as any).write(LogLevel.INFO, message);
    return null;
  }

  /**
   * Reports failure of an activity.
   *
   * Marks an activity as failed and logs at the error level.
   * Returns data about the activity including duration.
   *
   * @param activityId - The id of the activity as returned by activity()
   * @param message - The failure message to log
   *
   * @returns Data about the activity including duration
   *
   * @example
   * ```typescript
   * const result = logger.failure(activityId, 'Failed to process users');
   * console.log(`Failed after ${result.duration}ms`);
   * ```
   */
  failure(activityId: string, message: string): Record<string, any> | null {
    const time = Date.now();

    if (this.activities[activityId]) {
      const activity = this.activities[activityId];
      const duration = time - activity.start;

      (this as any).write(LogLevel.ERROR, message, {
        activity_id: activityId,
        duration,
      });

      const result = {
        ...activity,
        duration,
      };

      // Clean up
      delete this.activities[activityId];

      return result;
    }

    (this as any).write(LogLevel.ERROR, message);
    return null;
  }
}
