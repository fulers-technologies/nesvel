import { Injectable, Logger } from '@nestjs/common';

import {
  SMTPProvider,
  SESProvider,
  SendGridProvider,
  MailgunProvider,
  PostmarkProvider,
} from '@providers';
import { MailTransportType } from '@enums';
import { TransportNotFoundException } from '@exceptions';
import { IMailProvider, IMailerConfig } from '@interfaces';

/**
 * Factory service for creating and configuring mail transport provider instances.
 *
 * This service is responsible for:
 * - Instantiating the appropriate provider based on configuration
 * - Validating provider options
 * - Providing a centralized point for provider creation
 * - Supporting custom provider implementations
 *
 * The factory pattern allows for flexible provider selection and makes it easy
 * to add new provider implementations without modifying existing code.
 *
 * @class MailerFactoryService
 */
@Injectable()
export class MailerFactoryService {
  /**
   * Logger instance for factory operations
   */
  private readonly logger = new Logger(MailerFactoryService.name);

  /**
   * Registry of available provider constructors
   *
   * Maps transport type strings to their corresponding provider classes.
   * This allows for dynamic provider selection and easy extensibility.
   */
  private readonly providerRegistry = new Map<string, any>([
    [MailTransportType.SES, SESProvider],
    [MailTransportType.SMTP, SMTPProvider],
    [MailTransportType.MAILGUN, MailgunProvider],
    [MailTransportType.SENDGRID, SendGridProvider],
    [MailTransportType.POSTMARK, PostmarkProvider],
  ]);

  /**
   * Creates a provider instance based on the provided configuration.
   *
   * This method:
   * - Validates the transport type
   * - Retrieves the appropriate provider class from the registry
   * - Instantiates the provider with the provided options
   * - Returns the configured provider instance
   *
   * @param config - The mailer module configuration
   * @returns A configured provider instance
   * @throws {TransportNotFoundException} If the transport type is not supported
   *
   * @example
   * ```typescript
   * const provider = factory.createProvider({
   *   transport: MailTransportType.SMTP,
   *   smtp: { host: 'localhost', port: 1025, secure: false }
   * });
   * ```
   */
  createProvider(config: IMailerConfig): IMailProvider {
    const transportType = config.transport;

    // Validate transport type
    if (!this.providerRegistry.has(transportType)) {
      const availableTransports = Array.from(this.providerRegistry.keys());
      throw TransportNotFoundException.make(transportType, availableTransports);
    }

    try {
      // Get provider class from registry
      const ProviderClass = this.providerRegistry.get(transportType);

      // Get provider-specific options
      const providerOptions = this.getProviderOptions(config);

      // Instantiate provider
      const provider = ProviderClass.make(providerOptions);

      this.logger.log(`Created ${transportType} provider instance`);

      return provider;
    } catch (error: Error | any) {
      this.logger.error(`Failed to create ${transportType} provider:`, error);
      throw error;
    }
  }

  /**
   * Registers a custom provider implementation.
   *
   * This method allows applications to register their own provider implementations,
   * extending the built-in provider support. The custom provider must implement
   * the IMailProvider interface and provide a static make() method.
   *
   * @param transportType - The unique identifier for the custom provider
   * @param providerClass - The provider class constructor
   *
   * @example
   * ```typescript
   * class CustomMailProvider implements IMailProvider {
   *   static make(options: any) {
   *     return new CustomMailProvider(options);
   *   }
   *   getTransportConfig() {
   *     // ...
   *   }
   * }
   *
   * factory.registerProvider('custom', CustomMailProvider);
   * ```
   */
  registerProvider(transportType: string, providerClass: any): void {
    if (this.providerRegistry.has(transportType)) {
      this.logger.warn(`Transport type ${transportType} is already registered. Overwriting...`);
    }

    // Validate that the provider class has a make method
    if (typeof providerClass.make !== 'function') {
      throw new Error(`Provider class for ${transportType} must have a static make() method`);
    }

    this.providerRegistry.set(transportType, providerClass);
    this.logger.log(`Registered custom provider: ${transportType}`);
  }

  /**
   * Checks if a transport type is registered.
   *
   * This method can be used to verify if a provider is available before
   * attempting to create it.
   *
   * @param transportType - The transport type to check
   * @returns true if the provider is registered, false otherwise
   *
   * @example
   * ```typescript
   * if (factory.hasProvider('smtp')) {
   *   const provider = factory.createProvider({ transport: 'smtp', ... });
   * }
   * ```
   */
  hasProvider(transportType: string): boolean {
    return this.providerRegistry.has(transportType);
  }

  /**
   * Gets the list of all registered transport types.
   *
   * This method returns an array of transport type identifiers that are
   * currently available for use.
   *
   * @returns An array of registered transport type strings
   *
   * @example
   * ```typescript
   * const transports = factory.getAvailableTransports();
   * console.log('Available transports:', transports);
   * // Output: ['smtp', 'ses', 'sendgrid', 'mailgun', 'postmark']
   * ```
   */
  getAvailableTransports(): string[] {
    return Array.from(this.providerRegistry.keys());
  }

  /**
   * Gets provider-specific options from configuration.
   *
   * This method extracts the appropriate options based on the transport type.
   *
   * @param config - The mailer module configuration
   * @returns Provider-specific options
   * @throws {Error} If required options are missing
   */
  private getProviderOptions(config: IMailerConfig): any {
    switch (config.transport) {
      case MailTransportType.SMTP:
        if (!config.smtp) {
          throw new Error('SMTP options are required when transport is SMTP');
        }
        return config.smtp;

      case MailTransportType.SES:
        if (!config.ses) {
          throw new Error('SES options are required when transport is SES');
        }
        return config.ses;

      case MailTransportType.SENDGRID:
        if (!config.sendgrid) {
          throw new Error('SendGrid options are required when transport is SendGrid');
        }
        return config.sendgrid;

      case MailTransportType.MAILGUN:
        if (!config.mailgun) {
          throw new Error('Mailgun options are required when transport is Mailgun');
        }
        return config.mailgun;

      case MailTransportType.POSTMARK:
        if (!config.postmark) {
          throw new Error('Postmark options are required when transport is Postmark');
        }
        return config.postmark;

      default:
        throw new Error(`Unknown transport type: ${config.transport}`);
    }
  }
}
