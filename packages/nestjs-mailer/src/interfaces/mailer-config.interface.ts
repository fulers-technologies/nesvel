import type { TailwindConfig } from '@react-email/components';
import { MailTransportType } from '@enums';
import { ISMTPOptions } from './smtp-options.interface';
import { ISESOptions } from './ses-options.interface';
import { ISendGridOptions } from './sendgrid-options.interface';
import { IMailgunOptions } from './mailgun-options.interface';
import { IPostmarkOptions } from './postmark-options.interface';

/**
 * Mailer Configuration Interface
 *
 * Complete configuration for the mailer module
 *
 * @interface IMailerConfig
 */
export interface IMailerConfig {
  /**
   * Mail transport provider type
   */
  transport: MailTransportType;

  /**
   * Default from address
   */
  from: string;

  /**
   * Template directory path
   */
  templateDir: string;

  /**
   * Enable email preview in development
   */
  preview: boolean;

  /**
   * Custom Tailwind CSS configuration for email templates
   *
   * Allows customization of Tailwind theme (colors, spacing, fonts, etc.)
   * used in email templates. If not provided, uses default email-optimized configuration.
   */
  tailwindConfig?: TailwindConfig;

  /**
   * SMTP configuration (when transport is SMTP)
   */
  smtp?: ISMTPOptions;

  /**
   * AWS SES configuration (when transport is SES)
   */
  ses?: ISESOptions;

  /**
   * SendGrid configuration (when transport is SendGrid)
   */
  sendgrid?: ISendGridOptions;

  /**
   * Mailgun configuration (when transport is Mailgun)
   */
  mailgun?: IMailgunOptions;

  /**
   * Postmark configuration (when transport is Postmark)
   */
  postmark?: IPostmarkOptions;
}
