import { IMailerConfig } from './mailer-config.interface';

/**
 * Mailer Module Options
 *
 * Configuration options for MailerModule registration
 *
 * @interface IMailerModuleOptions
 */
export interface IMailerModuleOptions {
  /**
   * Whether to register the module globally
   */
  isGlobal?: boolean;

  /**
   * Custom mailer configuration (optional, defaults to env-based config)
   */
  config?: IMailerConfig;
}
