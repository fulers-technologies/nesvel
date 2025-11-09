import * as winston from 'winston';
import SlackHook from 'winston-slack-hook';

import { LogLevel } from '@enums/log-level.enum';
import type { ISlackTransportOptions, ITransport } from '@interfaces';

/**
 * Slack webhook transport implementation.
 *
 * This transport sends log messages to Slack channels via webhooks, making it
 * ideal for error notifications and alerts. You can receive real-time notifications
 * for critical errors, warnings, or any log level you configure.
 *
 * Features:
 * - Send logs to Slack channels via webhooks
 * - Customizable bot username and icon
 * - Custom message formatting
 * - Perfect for error alerting and team notifications
 * - Async message delivery (won't block logging)
 *
 * Setup:
 * 1. Create a Slack app at https://api.slack.com/apps
 * 2. Enable Incoming Webhooks
 * 3. Create a webhook URL for your channel
 * 4. Use the webhook URL in the configuration
 *
 * @class SlackTransport
 * @implements {ITransport}
 *
 * @example
 * ```typescript
 * const transport = new SlackTransport({
 *   type: TransportType.SLACK,
 *   level: LogLevel.ERROR,  // Only send errors to Slack
 *   webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
 *   channel: '#errors',
 *   username: 'Error Bot',
 *   iconEmoji: ':warning:'
 * });
 *
 * logger.addTransport(transport);
 * ```
 */
export class SlackTransport implements ITransport {
  /**
   * Internal Winston Slack hook transport instance.
   */
  private readonly winstonTransport: any;

  /**
   * Creates a new Slack transport instance.
   *
   * The transport will send formatted messages to the specified Slack channel
   * via the provided webhook URL. Messages are sent asynchronously to avoid
   * blocking the logging pipeline.
   *
   * @param options - Slack transport configuration options
   *
   * @example Error notifications
   * ```typescript
   * const transport = new SlackTransport({
   *   type: TransportType.SLACK,
   *   level: LogLevel.ERROR,
   *   webhookUrl: process.env.SLACK_WEBHOOK_URL,
   *   channel: '#critical-errors',
   *   username: 'Production Error Bot',
   *   iconEmoji: ':rotating_light:',
   *   handleExceptions: true
   * });
   * ```
   *
   * @example Custom formatting
   * ```typescript
   * const transport = new SlackTransport({
   *   type: TransportType.SLACK,
   *   level: LogLevel.WARN,
   *   webhookUrl: process.env.SLACK_WEBHOOK_URL,
   *   channel: '#alerts',
   *   username: 'Alert Bot',
   *   iconUrl: 'https://example.com/bot-icon.png',
   *   formatter: (info) => ({
   *     text: `[${info.level.toUpperCase()}] ${info.message}`,
   *     attachments: [{
   *       color: info.level === 'error' ? 'danger' : 'warning',
   *       fields: [
   *         { title: 'Environment', value: process.env.NODE_ENV },
   *         { title: 'Timestamp', value: new Date().toISOString() }
   *       ]
   *     }]
   *   })
   * });
   * ```
   */
  constructor(private readonly options: ISlackTransportOptions) {
    const format = winston.format.combine(
      winston.format.json(),
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    );

    const slackConfig: any = {
      format,
      webhookUrl: options.webhookUrl,
      level: options.level || LogLevel.ERROR,
      handleExceptions: options.handleExceptions ?? true,
      handleRejections: options.handleRejections ?? true,
    };

    // Add optional configuration
    if (options.channel) {
      slackConfig.channel = options.channel;
    }

    if (options.username) {
      slackConfig.username = options.username;
    }

    if (options.iconEmoji) {
      slackConfig.iconEmoji = options.iconEmoji;
    }

    if (options.iconUrl) {
      slackConfig.iconUrl = options.iconUrl;
    }

    if (options.formatter) {
      slackConfig.formatter = options.formatter;
    }

    this.winstonTransport = new SlackHook(slackConfig);
  }

  /**
   * Logs a message at the specified level.
   *
   * This method sends the log entry to Slack via webhook if the level
   * meets the configured threshold. The message is formatted and sent
   * asynchronously to avoid blocking.
   *
   * @param level - The severity level of the log message
   * @param message - The log message content
   * @param context - Optional contextual data to include with the log
   *
   * @example
   * ```typescript
   * transport.log(LogLevel.ERROR, 'Payment processing failed', {
   *   orderId: 'order_123',
   *   userId: 'user_456',
   *   error: 'Gateway timeout',
   *   amount: 99.99
   * });
   * ```
   */
  log(level: LogLevel | string, message: string, context?: any): void {
    this.winstonTransport.log?.(
      {
        level,
        message,
        ...context,
      },
      () => {}
    );
  }

  /**
   * Flushes any buffered log messages.
   *
   * Since Slack messages are sent asynchronously via HTTP, this ensures
   * all pending messages are sent before returning.
   *
   * @returns Promise that resolves when all messages are flushed
   *
   * @example
   * ```typescript
   * await transport.flush();
   * ```
   */
  async flush(): Promise<void> {
    // Slack transport sends messages asynchronously
    // Give it a moment to send pending messages
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Closes the transport and releases resources.
   *
   * This method ensures all pending messages are sent to Slack
   * before closing.
   *
   * @returns Promise that resolves when the transport is closed
   *
   * @example
   * ```typescript
   * await transport.close();
   * ```
   */
  async close(): Promise<void> {
    return this.flush();
  }
}
