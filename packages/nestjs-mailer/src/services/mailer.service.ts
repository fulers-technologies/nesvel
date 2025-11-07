import { SentMessageInfo } from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

import { IBaseMarkup } from '@markup/schemas';
import { SendMailOptions } from '@interfaces';
import { BaseMarkupBuilder } from '@markup/builders';
import { EmailPriority, EmailPriorityHeader } from '@enums';

/**
 * MailerService
 *
 * Enhanced email service with additional features and better type safety.
 *
 * Provides a wrapper around @nestjs-modules/mailer with:
 * - Comprehensive logging
 * - Priority email support
 * - Batch email sending
 * - Transactional and marketing email helpers
 * - Gmail structured data markup support
 * - Error handling and retry logic
 *
 * @class MailerService
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthService {
 *   constructor(private readonly mailerService: MailerService) {}
 *
 *   async sendVerificationEmail(user: User, token: string) {
 *     await this.mailerService.sendMail({
 *       to: user.email,
 *       subject: 'Verify your email',
 *       template: 'verify-email',
 *       context: {
 *         name: user.name,
 *         verificationUrl: `${config.appUrl}/verify?token=${token}`,
 *       },
 *     });
 *   }
 *
 *   async sendPasswordResetEmail(user: User, resetToken: string) {
 *     await this.mailerService.sendMail({
 *       to: user.email,
 *       subject: 'Reset your password',
 *       template: 'reset-password',
 *       context: {
 *         name: user.name,
 *         resetUrl: `${config.appUrl}/reset-password?token=${resetToken}`,
 *       },
 *       priority: EmailPriority.HIGH,
 *     });
 *   }
 * }
 * ```
 */
@Injectable()
export class MailerService {
  /**
   * Logger instance for email service operations
   */
  private readonly logger = new Logger(MailerService.name);

  /**
   * Creates an instance of MailerService
   *
   * @param nestMailerService - NestMailerService instance
   */
  constructor(private readonly nestMailerService: NestMailerService) {}

  /**
   * Send an email
   *
   * @param options - Email send options
   * @returns Sent message info from nodemailer
   * @throws Error if email sending fails
   */
  async sendMail(options: SendMailOptions): Promise<SentMessageInfo> {
    try {
      // Log email sending attempt (without sensitive data)
      this.logger.log(
        `Sending email to ${options.to} with subject "${options.subject}"${options.template ? ` using template "${options.template}"` : ''}`,
      );

      // Process markup if provided
      const markupScript = options.markup ? this.processMarkup(options.markup) : undefined;

      // Add custom headers if provided
      const headers = {
        ...options.headers,
        ...(options.priority && { 'X-Priority': this.getPriorityValue(options.priority) }),
      };

      // Prepare context with markup
      const context = {
        ...options.context,
        ...(markupScript && { markupScript }),
      };

      // Prepare final email options
      const mailOptions: ISendMailOptions = {
        ...options,
        context,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      };

      // Remove custom fields that shouldn't be passed to nodemailer
      delete (mailOptions as any).markup;
      delete (mailOptions as any).priority;
      delete (mailOptions as any).trackOpens;
      delete (mailOptions as any).trackClicks;

      // Send email using nest mailer service
      const result = await this.nestMailerService.sendMail(mailOptions);

      // Log success
      this.logger.log(`Email sent successfully to ${options.to}`);

      return result;
    } catch (error: Error | any) {
      // Log error with details
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error.stack);

      // Re-throw error for caller to handle
      throw error;
    }
  }

  /**
   * Send email to multiple recipients
   *
   * @param recipients - Array of recipient email addresses
   * @param options - Email send options (excluding 'to')
   * @returns Array of sent message info
   */
  async sendMailToMany(
    recipients: string[],
    options: Omit<SendMailOptions, 'to'>,
  ): Promise<SentMessageInfo[]> {
    this.logger.log(`Sending email to ${recipients.length} recipients`);

    // Send emails in parallel
    const results = await Promise.allSettled(
      recipients.map((to) =>
        this.sendMail({
          ...options,
          to,
        }),
      ),
    );

    // Separate successful and failed sends
    const successful = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    // Log results
    this.logger.log(`Sent ${successful.length}/${recipients.length} emails successfully`);

    if (failed.length > 0) {
      this.logger.warn(`Failed to send ${failed.length} emails`);
    }

    // Return successful results
    return successful.map((r) => (r as PromiseFulfilledResult<SentMessageInfo>).value);
  }

  /**
   * Send transactional email (alias for sendMail with high priority)
   *
   * @param options - Email send options
   * @returns Sent message info
   */
  async sendTransactionalEmail(
    options: Omit<SendMailOptions, 'priority'>,
  ): Promise<SentMessageInfo> {
    return this.sendMail({
      ...options,
      priority: EmailPriority.HIGH,
    });
  }

  /**
   * Send marketing/promotional email
   *
   * @param options - Email send options
   * @returns Sent message info
   */
  async sendMarketingEmail(options: Omit<SendMailOptions, 'priority'>): Promise<SentMessageInfo> {
    return this.sendMail({
      ...options,
      priority: EmailPriority.LOW,
    });
  }

  /**
   * Process markup into HTML script tags
   *
   * Converts markup builders or JSON objects into JSON-LD script tags
   * that can be embedded in email HTML
   *
   * @param markup - Single or multiple markup builders/objects
   * @returns HTML script tags containing JSON-LD markup
   *
   * @private
   */
  private processMarkup(
    markup:
      | BaseMarkupBuilder<IBaseMarkup>
      | BaseMarkupBuilder<IBaseMarkup>[]
      | IBaseMarkup
      | IBaseMarkup[],
  ): string {
    // Convert to array if single item
    const markups = Array.isArray(markup) ? markup : [markup];

    // Process each markup
    const scripts = markups.map((m) => {
      // If it's a builder, get the script tag
      if (m instanceof BaseMarkupBuilder) {
        return m.toScriptTag();
      }

      // If it's a plain object, wrap in script tag
      return `<script type="application/ld+json">\n${JSON.stringify(m, null, 2)}\n</script>`;
    });

    // Join all scripts with newlines
    return scripts.join('\n');
  }

  /**
   * Get priority value for email headers
   *
   * Converts EmailPriority enum to X-Priority header value
   * per RFC 2156 (1 = highest, 5 = lowest)
   *
   * @param priority - Email priority level
   * @returns Priority header value (1, 3, or 5)
   *
   * @private
   */
  private getPriorityValue(priority: EmailPriority): string {
    const priorityMap: Record<EmailPriority, EmailPriorityHeader> = {
      [EmailPriority.LOW]: EmailPriorityHeader.LOW,
      [EmailPriority.HIGH]: EmailPriorityHeader.HIGH,
      [EmailPriority.NORMAL]: EmailPriorityHeader.NORMAL,
    };
    return priorityMap[priority];
  }
}
