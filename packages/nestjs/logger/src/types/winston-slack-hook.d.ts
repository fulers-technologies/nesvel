/**
 * TypeScript declaration module for winston-slack-hook transport.
 *
 * This module provides type definitions for the winston-slack-hook package,
 * which enables Winston logger to send log messages to Slack channels via
 * incoming webhooks.
 *
 * @module winston-slack-hook
 * @see {@link https://www.npmjs.com/package/winston-slack-hook}
 */
declare module 'winston-slack-hook' {
  import * as Transport from 'winston-transport';

  /**
   * Configuration options for the Slack Hook transport.
   *
   * These options control how Winston log messages are formatted and sent
   * to Slack channels via incoming webhooks.
   */
  interface SlackHookOptions {
    /**
     * The Slack incoming webhook URL.
     *
     * This URL is provided by Slack when you create an incoming webhook
     * integration. It determines which workspace and channel will receive
     * the log messages.
     *
     * @required
     * @example 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX'
     */
    webhookUrl: string;

    /**
     * The Slack channel to post messages to.
     *
     * If not specified, messages will be posted to the default channel
     * configured in the webhook settings.
     *
     * @optional
     * @example '#logs' or '@username'
     */
    channel?: string;

    /**
     * The username to display as the message sender in Slack.
     *
     * This overrides the default username configured in the webhook settings.
     *
     * @optional
     * @example 'Logger Bot'
     */
    username?: string;

    /**
     * Emoji to use as the message icon in Slack.
     *
     * Must be a valid Slack emoji code. Cannot be used together with iconUrl.
     *
     * @optional
     * @example ':robot_face:' or ':warning:'
     */
    iconEmoji?: string;

    /**
     * URL of an image to use as the message icon in Slack.
     *
     * Cannot be used together with iconEmoji.
     *
     * @optional
     * @example 'https://example.com/icon.png'
     */
    iconUrl?: string;

    /**
     * Custom formatter function to transform log info before sending to Slack.
     *
     * This function receives the Winston log info object and should return
     * a formatted object suitable for Slack's message API.
     *
     * @optional
     * @param info - The Winston log info object containing level, message, metadata, etc.
     * @returns Formatted object for Slack API
     * @example (info) => ({ text: `[${info.level}] ${info.message}` })
     */
    formatter?: (info: any) => any;

    /**
     * Minimum logging level for this transport.
     *
     * Only log messages at or above this level will be sent to Slack.
     * Common levels: 'error', 'warn', 'info', 'debug'.
     *
     * @optional
     * @default 'info'
     * @example 'error' - Only log errors
     */
    level?: string;

    /**
     * Whether this transport should handle uncaught exceptions.
     *
     * When true, uncaught exceptions will be logged to Slack before the
     * process exits.
     *
     * @optional
     * @default false
     */
    handleExceptions?: boolean;

    /**
     * Whether this transport should handle unhandled promise rejections.
     *
     * When true, unhandled promise rejections will be logged to Slack.
     *
     * @optional
     * @default false
     */
    handleRejections?: boolean;

    /**
     * Winston format to apply to log messages before sending to Slack.
     *
     * Can be any Winston format (e.g., winston.format.json(), winston.format.simple()).
     *
     * @optional
     * @example winston.format.combine(winston.format.timestamp(), winston.format.json())
     */
    format?: any;
  }

  /**
   * Winston transport for sending log messages to Slack via incoming webhooks.
   *
   * This class extends the base Winston Transport class to provide Slack
   * integration. It handles batching, formatting, and sending log messages
   * to configured Slack channels.
   *
   * @class SlackHook
   * @extends {Transport}
   *
   * @example
   * ```typescript
   * import winston from 'winston';
   * import SlackHook from 'winston-slack-hook';
   *
   * const logger = winston.createLogger({
   *   transports: [
   *     new SlackHook({
   *       webhookUrl: 'https://hooks.slack.com/services/...',
   *       channel: '#error-logs',
   *       username: 'App Logger',
   *       iconEmoji: ':fire:',
   *       level: 'error',
   *       handleExceptions: true
   *     })
   *   ]
   * });
   * ```
   */
  class SlackHook extends Transport {
    /**
     * Creates a new Slack Hook transport instance.
     *
     * Initializes the transport with the provided options and establishes
     * the connection configuration for sending logs to Slack.
     *
     * @param options - Configuration options for the Slack transport
     * @throws {Error} If webhookUrl is not provided or is invalid
     */
    constructor(options: SlackHookOptions);
  }

  export = SlackHook;
}
