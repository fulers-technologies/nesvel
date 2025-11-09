import type { LogLevel } from '@enums/log-level.enum';
import type { TransportType } from '@enums/transport-type.enum';

/**
 * Slack transport options.
 *
 * Sends log notifications to Slack via webhooks.
 * Ideal for error alerting.
 */
export interface ISlackTransportOptions {
  /**
   * Transport type identifier.
   */
  type: TransportType.SLACK;

  /**
   * Whether this transport is enabled.
   * @default false
   */
  enabled?: boolean;

  /**
   * Slack channel to send messages to.
   * @example '#errors'
   */
  channel?: string;

  /**
   * Slack webhook URL (required).
   * @example 'https://hooks.slack.com/services/...'
   */
  webhookUrl: string;

  /**
   * Username for the bot.
   * @default 'Logger Bot'
   */
  username?: string;

  /**
   * Icon emoji for the bot.
   * @example ':warning:', ':rotating_light:'
   * @default ':warning:'
   */
  iconEmoji?: string;

  /**
   * Minimum log level for this transport.
   * @default LogLevel.ERROR
   */
  level?: LogLevel | string;

  /**
   * Icon URL for the bot (alternative to iconEmoji).
   */
  iconUrl?: string;

  /**
   * Custom formatter function.
   */
  formatter?: (info: any) => any;

  /**
   * Enable exception handling.
   * When true, uncaught exceptions will be logged before the process exits.
   *
   * @default true
   */
  handleExceptions?: boolean;

  /**
   * Enable rejection handling.
   * When true, unhandled promise rejections will be logged.
   *
   * @default true
   */
  handleRejections?: boolean;
}
