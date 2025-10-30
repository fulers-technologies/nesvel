import { Injectable } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';

import { AUTH_SCHEMES, DEFAULT_AUTH_CONFIGS } from '../constants';
import type { SwaggerConfig } from '../interfaces';

/**
 * Service for building Swagger/OpenAPI documentation configuration
 */
@Injectable()
export class SwaggerBuilderService {
  /**
   * Build Swagger document configuration
   *
   * @param config - Swagger configuration object
   * @returns DocumentBuilder instance with all configurations applied
   */
  build(config: SwaggerConfig) {
    const builder = new DocumentBuilder()
      .setTitle(config.title)
      .setDescription(config.description)
      .setVersion(config.version);

    // Add contact information
    if (config.contactName || config.contactEmail) {
      builder.setContact(
        config.contactName || '',
        config.contactUrl || '',
        config.contactEmail || '',
      );
    }

    // Add terms of service
    if (config.termsOfService) {
      builder.setTermsOfService(config.termsOfService);
    }

    // Add license information
    if (config.license) {
      builder.setLicense(config.license.name, config.license.url);
    }

    // Add authentication schemes
    this.addAuthenticationSchemes(builder);

    // Add server
    builder.addServer(config.serverUrl || 'http://localhost:3000', 'Current environment');

    // Add tags
    this.addTags(builder, config.tags);

    return builder.build();
  }

  /**
   * Add authentication schemes to the document builder
   *
   * @param builder - DocumentBuilder instance
   */
  private addAuthenticationSchemes(builder: DocumentBuilder): void {
    // JWT Bearer authentication
    builder.addBearerAuth(DEFAULT_AUTH_CONFIGS.JWT, AUTH_SCHEMES.JWT);

    // API Key authentication
    builder.addApiKey(DEFAULT_AUTH_CONFIGS.API_KEY, AUTH_SCHEMES.API_KEY);
  }

  /**
   * Add tags to the document builder
   *
   * @param builder - DocumentBuilder instance
   * @param tags - Array of tag configurations
   */
  private addTags(
    builder: DocumentBuilder,
    tags?: Array<{ name: string; description: string }>,
  ): void {
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        builder.addTag(tag.name, tag.description);
      });
    }
  }
}
