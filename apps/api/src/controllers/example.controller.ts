import {
  Controller,
  Body,
  Param,
  Query,
  Headers,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiSecurity,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ApiEndpoint } from '../decorators/api-endpoint.decorator';

@Controller('examples')
@ApiExtraModels(UpdateResourceDto, ResourceResponseDto)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('api-key')
export class ExampleController {
  /**
   * This endpoint demonstrates EVERY POSSIBLE OPTION in @ApiEndpoint
   * It's a comprehensive showcase of all features, nested options, and configurations
   */
  @ApiEndpoint(':resourceId/nested/:nestedId', {
    // ==================== PRESET ====================
    preset: 'crud.update',

    // ==================== HTTP METHOD & PATH ====================
    method: 'PUT',

    // ==================== HTTP STATUS ====================
    httpCode: HttpStatus.OK,

    // ==================== DOCUMENTATION ====================
    // Auto-generates if not provided:
    // - operationId: {method}{Controller} (e.g., putExamples)
    // - tags: [controller, preset] (e.g., ['examples', 'crud'])
    // - summary: based on method + resource (e.g., 'Update examples')
    documentation: {
      summary: 'Ultimate example endpoint with all possible options',
      description:
        'This is a comprehensive demonstration of every single feature available in ApiEndpoint decorator. ' +
        'It showcases nested configurations, complex response types, file uploads, authentication, ' +
        'authorization, caching, rate limiting, telemetry, circuit breakers, retry logic, CORS, ' +
        'security policies, and more.',
    },

    // ==================== AUTHENTICATION ====================
    auth: {
      bearer: 'JWT-auth',
      apiKey: 'api-key',
      cookie: 'session-cookie',
      basic: 'basic-auth',
      oauth2: ['read:resources', 'write:resources', 'admin:all'],
    },

    // ==================== RESPONSE HEADERS ====================
    // Note: Security headers are applied by default (X-Content-Type-Options, X-Frame-Options, etc.)
    // Only add custom headers here:
    responseHeaders: {
      'X-Custom-Header': 'CustomValue',
      'Cache-Control': 'public, max-age=3600',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },

    // ==================== GUARDS, PIPES, INTERCEPTORS, FILTERS ====================
    guards: [],
    pipes: [
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    ],
    interceptors: [],
    filters: [],

    // ==================== REQUEST BODY ====================
    // Use DTO class for type-safe, validated request body
    // body: UpdateResourceDto,

    // ==================== RESPONSES ====================
    // Note: Default error responses (400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504)
    // with DTOs and default headers are automatically applied.
    // Only specify responses you want to customize:
    responses: {
      ok: {
        description: 'Resource updated successfully',
        // type: ResourceResponseDto, // Use DTO class for response
      },
    },

    // ==================== PATH PARAMETERS ====================
    params: [
      {
        name: 'resourceId',
        type: 'string',
        description: 'Primary resource unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
          pattern:
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        },
      },
      {
        name: 'nestedId',
        type: 'string',
        description: 'Nested resource unique identifier',
        example: '987fcdeb-51a2-43d7-9876-fedcba098765',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],

    // ==================== QUERY PARAMETERS ====================
    queries: [
      {
        name: 'page',
        type: Number,
        required: false,
        description: 'Page number for pagination',
        example: 1,
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      {
        name: 'limit',
        type: Number,
        required: false,
        description: 'Number of items per page',
        example: 10,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
      {
        name: 'sort',
        type: String,
        required: false,
        description:
          'Sort field and direction (e.g., name:asc, createdAt:desc)',
        example: 'createdAt:desc',
        schema: {
          type: 'string',
          pattern: '^[a-zA-Z]+:(asc|desc)$',
        },
      },
      {
        name: 'filter',
        type: String,
        required: false,
        description: 'Filter criteria in JSON format',
        example: '{"status":"active","category":"premium"}',
        schema: { type: 'string' },
      },
      {
        name: 'fields',
        type: String,
        required: false,
        description: 'Comma-separated list of fields to include',
        example: 'id,name,email',
        schema: { type: 'string' },
      },
      {
        name: 'include',
        type: String,
        required: false,
        description: 'Comma-separated list of relations to include',
        example: 'profile,posts,comments',
        isArray: true,
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      {
        name: 'search',
        type: String,
        required: false,
        description: 'Full-text search query',
        example: 'john doe',
        schema: { type: 'string', minLength: 2, maxLength: 100 },
      },
      {
        name: 'expand',
        type: Boolean,
        required: false,
        description: 'Expand nested resources',
        example: true,
        schema: { type: 'boolean', default: false },
      },
      {
        name: 'version',
        type: String,
        required: false,
        description: 'API version override',
        example: 'v2',
        enum: ['v1', 'v2', 'v3'],
      },
    ],

    // ==================== FILE UPLOAD ====================
    file: {
      fieldName: 'document',
      maxCount: 1,
      fileFilter: ['.pdf', '.doc', '.docx', '.txt'],
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
    },

    files: {
      fieldName: 'attachments',
      maxCount: 5,
      fileFilter: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5,
      },
    },

    // ==================== REQUEST HEADERS ====================
    // Default headers (Accept-Language, X-Request-ID, X-Client-Version) are auto-applied
    // Only add custom headers specific to this endpoint:
    headers: [
      {
        name: 'X-Device-Type',
        description: 'Type of device making the request',
        required: false,
        example: 'mobile',
        schema: {
          type: 'string',
          enum: ['web', 'mobile', 'tablet', 'desktop'],
        },
      },
      {
        name: 'X-Platform',
        description: 'Operating system or platform',
        required: false,
        example: 'iOS',
        schema: {
          type: 'string',
          enum: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'],
        },
      },
      {
        name: 'If-Match',
        description: 'ETag for conditional requests (optimistic locking)',
        required: false,
        example: '"686897696a7c876b7e"',
        schema: { type: 'string' },
      },
      {
        name: 'If-None-Match',
        description: 'ETag for conditional requests (caching)',
        required: false,
        example: '"686897696a7c876b7e"',
        schema: { type: 'string' },
      },
      {
        name: 'If-Modified-Since',
        description: 'Date for conditional requests',
        required: false,
        example: 'Wed, 21 Oct 2024 07:28:00 GMT',
        schema: { type: 'string', format: 'date-time' },
      },
    ],

    // ==================== METADATA ====================
    metadata: {
      endpoint_type: 'nested_resource',
      feature_flags: ['advanced_mode', 'beta_features'],
      analytics_tracked: true,
      audit_logged: true,
      requires_consent: false,
    },

    // ==================== VERSIONING ====================
    version: ['1', '2', '3'],

    // ==================== REDIRECT ====================
    redirect: undefined, // Not used for PUT

    // ==================== RENDER ====================
    render: undefined, // Not used for API endpoint

    // ==================== SSE ====================
    sse: false,

    // ==================== EXCLUDE FROM SWAGGER ====================
    exclude: false,

    // ==================== TAGS & EXTRA MODELS ====================
    // Now part of 'documentation' - see documentation.tags above
    // extraModels should be at @ApiExtraModels() on controller level

    // ==================== CACHING ====================
    // Simple usage - auto-generates key and uses default TTL (300s)
    // Auto-generated key format: {controller}:{method}:{path}
    // For this endpoint: examples:PUT:{{resourceId}}:nested:{{nestedId}}
    cache: {
      enabled: true,
    },

    // ==================== RBAC ROLES ====================
    roles: ['admin', 'moderator', 'power-user'],

    // ==================== SECURITY ====================
    security: {
      csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.example.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https://api.example.com'],
        'font-src': ["'self'", 'https://fonts.googleapis.com'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
      ipWhitelist: [
        '192.168.1.0/24',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '203.0.113.0/24',
      ],
      requireHttps: true,
    },
    
    // ==================== TELEMETRY / OBSERVABILITY ====================
    telemetry: {
      trace: true,
      metrics: true,
      spanName: 'update-nested-resource',
    },

    // ==================== FEATURE FLAGS ====================
    featureFlag: 'nested_resources_v3',

    // ==================== CIRCUIT BREAKER ====================
    // Defaults: threshold=5, timeout=3000ms
    // Uncomment to enable with defaults or override:
    // circuitBreaker: {},
    // Or customize:
    // circuitBreaker: {
    //   threshold: 10,
    //   timeout: 5000,
    // },

    // ==================== RETRY POLICY ====================
    // Defaults: attempts=3, delay=1000ms
    // Uncomment to enable with defaults or override:
    // retry: {},
    // Or customize:
    // retry: {
    //   attempts: 5,
    //   delay: 2000,
    // },
  })
  ultimateExample(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('nestedId', ParseUUIDPipe) nestedId: string,
    @Body() body: UpdateResourceDto, // Type-safe DTO
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('fields') fields?: string,
    @Query('include', new ParseArrayPipe({ optional: true }))
  ): ResourceResponseDto {
    // Return type-safe response DTO
    return {
      id: 'generated-uuid',
      resourceId,
      nestedId,
      data: {
        name: body.name,
        description: body.description,
        status: body.status || 'active',
        metadata: body.metadata,
        tags: body.tags,
        settings: {
          notifications:
            body.configuration.settings.notifications?.email ?? true,
          visibility: body.permissions?.visibility || 'private',
          features: {
            advancedMode:
              body.configuration.advanced?.performance?.compression ?? false,
            betaFeatures:
              body.configuration.advanced?.caching?.enabled ?? false,
          },
        },
      },
      timestamps: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      relations: {
        parent: body.relations?.parentId
          ? { id: body.relations.parentId, name: 'Parent Resource' }
          : undefined,
        children: body.relations?.childIds?.map((id) => ({
          id,
          name: 'Child Resource',
        })),
      },
    };
  }
}
