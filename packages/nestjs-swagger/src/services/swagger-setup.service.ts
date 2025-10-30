import type { INestApplication } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { DEFAULT_SWAGGER_CSS, DEFAULT_SWAGGER_UI_OPTIONS } from '../constants';
import type { SwaggerConfig } from '../interfaces';
import { SWAGGER_CONFIG } from '../swagger.module';
import { validateSwaggerConfig } from '../utils';
import { SwaggerBuilderService } from './swagger-builder.service';

/**
 * Service for setting up Swagger/OpenAPI documentation
 */
@Injectable()
export class SwaggerSetupService {
  constructor(
    @Inject(SWAGGER_CONFIG) private readonly config: SwaggerConfig,
    private readonly swaggerBuilder: SwaggerBuilderService,
  ) {}

  /**
   * Setup Swagger documentation for NestJS application
   *
   * @param app - NestJS application instance
   */
  setup(app: INestApplication): void {
    // Validate configuration for security issues
    validateSwaggerConfig(this.config, process.env.NODE_ENV);

    // Skip setup if disabled
    if (!this.config.enabled) {
      console.log('⚠️  Swagger documentation is disabled');
      return;
    }

    // Build the document configuration
    const documentConfig = this.swaggerBuilder.build(this.config);

    // Create the Swagger document
    const document = SwaggerModule.createDocument(app, documentConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
    });

    // Extract document URLs (support both flat and nested structures)
    const jsonDocumentUrl =
      this.config.jsonDocumentUrl || (this.config as any).documents?.jsonDocumentUrl;
    const yamlDocumentUrl =
      this.config.yamlDocumentUrl || (this.config as any).documents?.yamlDocumentUrl;

    // Extract branding options (support both flat and nested structures)
    const customSiteTitle =
      this.config.customSiteTitle ||
      (this.config as any).branding?.customSiteTitle ||
      this.config.title;
    const customFavIcon =
      this.config.customFavIcon ||
      (this.config as any).branding?.customfavIcon ||
      (this.config as any).branding?.customFavIcon ||
      '/favicon.ico';
    const customCss = this.config.customCss || DEFAULT_SWAGGER_CSS;

    // Build Swagger UI setup options
    const setupOptions: any = {
      swaggerOptions: DEFAULT_SWAGGER_UI_OPTIONS,
      customSiteTitle,
      customfavIcon: customFavIcon,
      customCss,
    };

    // Add optional document URLs if configured
    if (jsonDocumentUrl) {
      setupOptions.jsonDocumentUrl = jsonDocumentUrl;
    }

    if (yamlDocumentUrl) {
      setupOptions.yamlDocumentUrl = yamlDocumentUrl;
    }

    // Setup Swagger UI
    SwaggerModule.setup(this.config.apiPath, app, document, setupOptions);

    console.log(`📚 Swagger documentation available at: /${this.config.apiPath}`);
    
    if (jsonDocumentUrl) {
      console.log(`   📄 JSON specification: /${jsonDocumentUrl}`);
    }
    
    if (yamlDocumentUrl) {
      console.log(`   📄 YAML specification: /${yamlDocumentUrl}`);
    }
  }
}
