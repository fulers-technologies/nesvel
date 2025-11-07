import { Injectable } from '@nestjs/common';
import { MailerOptions } from '@nestjs-modules/mailer';

import { ReactAdapter } from '@adapters';
import { IMailerConfig } from '@interfaces';
import { MailerFactoryService } from './mailer-factory.service';

/**
 * Mailer Options Factory Service
 *
 * Converts IMailerConfig to MailerOptions format compatible with @nestjs-modules/mailer
 *
 * This service acts as a bridge between our custom configuration format and the
 * @nestjs-modules/mailer package requirements, ensuring seamless integration.
 *
 * @class MailerOptionsFactoryService
 */
@Injectable()
export class MailerOptionsFactoryService {
  /**
   * Creates an instance of MailerService
   *
   * @param mailerFactory - MailerFactoryService instance
   */
  constructor(private readonly mailerFactory: MailerFactoryService) {}

  /**
   * Creates MailerOptions from IMailerConfig
   *
   * This method:
   * - Converts our custom config format to @nestjs-modules/mailer format
   * - Uses factory to create the appropriate transport provider
   * - Sets up template configuration
   * - Configures preview settings
   *
   * @param config - The mailer configuration
   * @returns MailerOptions compatible with @nestjs-modules/mailer
   */
  createMailerOptions(config: IMailerConfig): MailerOptions {
    // Create provider and get transport configuration
    const provider = this.mailerFactory.createProvider(config);
    const transportConfig = provider.getTransportConfig();

    // Build mailer options
    const options: MailerOptions = {
      transport: transportConfig,
      defaults: {
        from: config.from,
      },
      template: {
        dir: config.templateDir,
        adapter: new ReactAdapter({
          pretty: process.env.NODE_ENV === 'development',
          plainText: false,
        }),
        options: {
          strict: true,
        },
      },
      preview: config.preview,
    };

    return options;
  }
}
