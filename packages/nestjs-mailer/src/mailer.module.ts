import { Module, DynamicModule, Global } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';

import { IMailerModuleOptions } from './interfaces';
import { mailerConfig } from './config/mail.config';
import { MailerService } from './services/mailer.service';
import { MailerFactoryService } from './services/mailer-factory.service';
import { MailerOptionsFactoryService } from './services/mailer-options-factory.service';

/**
 * MailerModule
 *
 * Configures and provides email sending functionality throughout the application.
 *
 * @example
 * ```typescript
 * // Import in app.module.ts
 * @Module({
 *   imports: [
 *     MailerModule.forRootAsync(),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Use in a service
 * @Injectable()
 * export class UsersService {
 *   constructor(private readonly mailerService: MailerService) {}
 *
 *   async sendWelcomeEmail(user: User) {
 *     await this.mailerService.sendMail({
 *       to: user.email,
 *       subject: 'Welcome to Our Platform',
 *       template: 'welcome',
 *       context: { name: user.name },
 *     });
 *   }
 * }
 * ```
 */
@Global()
@Module({})
export class MailerModule {
  /**
   * Register mailer module synchronously
   *
   * Uses the provided config or defaults to environment-based configuration.
   *
   * @param options - Module options
   * @returns Dynamic module
   */
  static forRoot(options: IMailerModuleOptions = {}): DynamicModule {
    const config = options.config || mailerConfig;
    const factory = new MailerFactoryService();
    const optionsFactory = new MailerOptionsFactoryService(factory);
    const mailerOptions = optionsFactory.createMailerOptions(config);

    return {
      module: MailerModule,
      global: options.isGlobal ?? true,
      imports: [NestMailerModule.forRoot(mailerOptions)],
      providers: [MailerService, MailerFactoryService, MailerOptionsFactoryService],
      exports: [MailerService, MailerFactoryService, MailerOptionsFactoryService],
    };
  }

  /**
   * Register mailer module asynchronously
   *
   * This is the recommended approach as it allows configuration
   * to be loaded from environment variables and config files.
   * Uses dependency injection for factory services.
   *
   * @param options - Module options
   * @returns Dynamic module
   */
  static forRootAsync(options: IMailerModuleOptions = {}): DynamicModule {
    const config = options.config || mailerConfig;

    return {
      module: MailerModule,
      global: options.isGlobal ?? true,
      imports: [
        NestMailerModule.forRootAsync({
          useFactory: async (
            factory: MailerFactoryService,
            optionsFactory: MailerOptionsFactoryService,
          ) => {
            return optionsFactory.createMailerOptions(config);
          },
          inject: [MailerFactoryService, MailerOptionsFactoryService],
        }),
      ],
      providers: [MailerService, MailerFactoryService, MailerOptionsFactoryService],
      exports: [MailerService, MailerFactoryService, MailerOptionsFactoryService],
    };
  }
}
