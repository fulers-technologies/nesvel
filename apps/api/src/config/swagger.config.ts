/**
 * Swagger Security Scheme Configuration
 *
 * Defines authentication and authorization schemes available in the API.
 * Supports JWT, API Key, and OAuth2 authentication methods.
 *
 * @interface SwaggerSecurityScheme
 */
export interface SwaggerSecurityScheme {
  /**
   * Whether this security scheme is enabled
   * @default false
   */
  enabled: boolean;

  /**
   * Unique identifier for the security scheme
   * Used in Swagger UI and OpenAPI specification
   * @example 'JWT-auth', 'api-key', 'oauth2'
   */
  name: string;

  /**
   * Human-readable description of the security scheme
   * Displayed in Swagger UI to help developers understand how to authenticate
   * @example 'JWT Bearer token authentication'
   */
  description: string;

  /**
   * HTTP header name for API key authentication
   * Only applicable for API Key authentication type
   * @example 'X-API-KEY'
   * @optional
   */
  headerName?: string;

  /**
   * OAuth2 authorization URL
   * Only applicable for OAuth2 authentication type
   * @example 'https://auth.example.com/oauth/authorize'
   * @optional
   */
  authorizationUrl?: string;

  /**
   * OAuth2 token URL
   * Only applicable for OAuth2 authentication type
   * @example 'https://auth.example.com/oauth/token'
   * @optional
   */
  tokenUrl?: string;

  /**
   * OAuth2 scopes
   * Maps scope identifiers to human-readable descriptions
   * Only applicable for OAuth2 authentication type
   * @example { 'read:users': 'Read user information', 'write:users': 'Modify user information' }
   * @optional
   */
  scopes?: Record<string, string>;
}

/**
 * Swagger Tag Configuration
 *
 * Groups endpoints by functionality in Swagger UI.
 * Tags help organize API documentation into logical sections.
 *
 * @interface SwaggerTag
 */
export interface SwaggerTag {
  /**
   * Unique tag identifier
   * Used to group related endpoints together
   * @example 'users', 'auth', 'admin'
   */
  name: string;

  /**
   * Human-readable description of the tag
   * Explains the purpose of endpoints in this group
   * @example 'User management and profile endpoints'
   */
  description: string;
}

/**
 * Swagger Server Configuration
 *
 * Defines available API server URLs for the "Servers" dropdown in Swagger UI.
 * Allows testing against different environments (dev, staging, production).
 *
 * @interface SwaggerServer
 */
export interface SwaggerServer {
  /**
   * Base URL of the API server
   * @example 'https://api.example.com', 'http://localhost:3000'
   */
  url: string;

  /**
   * Human-readable description of the server
   * @example 'Production Server', 'Staging Environment'
   */
  description: string;
}

/**
 * Swagger External Documentation
 *
 * Links to additional documentation outside of Swagger UI.
 * Useful for detailed guides, tutorials, or architecture documentation.
 *
 * @interface SwaggerExternalDocs
 */
export interface SwaggerExternalDocs {
  /**
   * URL to external documentation
   * @example 'https://docs.example.com/api'
   */
  url: string;

  /**
   * Description of the external documentation
   * @example 'Complete API Documentation', 'Developer Guide'
   */
  description: string;
}

/**
 * Swagger License Information
 *
 * Specifies the license under which the API is provided.
 * Displayed in the API information section of Swagger UI.
 *
 * @interface SwaggerLicense
 */
export interface SwaggerLicense {
  /**
   * License name
   * @example 'MIT', 'Apache 2.0', 'Proprietary'
   */
  name: string;

  /**
   * URL to the full license text
   * @example 'https://opensource.org/licenses/MIT'
   */
  url: string;
}

/**
 * Swagger Configuration Interface
 *
 * Complete type definition for Swagger/OpenAPI configuration.
 * Controls all aspects of API documentation including UI, security, and metadata.
 *
 * @interface SwaggerConfig
 */
export interface SwaggerConfig {
  /**
   * API title displayed in Swagger UI
   * @env SWAGGER_TITLE
   * @default 'Nesvel API'
   * @example 'My Awesome API'
   */
  title: string;

  /**
   * API description (supports markdown)
   * Displayed at the top of Swagger UI documentation
   * @env SWAGGER_DESCRIPTION
   * @default 'Production-ready API documentation for Nesvel platform'
   */
  description: string;

  /**
   * API version (semver format)
   * @env API_VERSION
   * @default '1.0.0'
   * @example '2.1.3'
   */
  version: string;

  /**
   * URL path where Swagger UI is served
   * @env SWAGGER_PATH
   * @default 'api/docs'
   * @example 'docs', 'swagger'
   */
  apiPath: string;

  /**
   * Whether Swagger UI is enabled
   * Typically disabled in production for security
   * @env SWAGGER_ENABLED
   * @default false (production), true (development)
   */
  enabled: boolean;

  /**
   * Contact email for API support
   * @env SWAGGER_CONTACT_EMAIL
   * @default 'api@nesvel.com'
   * @example 'support@example.com'
   */
  contactEmail: string;

  /**
   * Contact name for API support
   * @env SWAGGER_CONTACT_NAME
   * @default 'Nesvel API Team'
   * @example 'API Support Team'
   */
  contactName: string;

  /**
   * Contact URL for API support
   * @env SWAGGER_CONTACT_URL
   * @default 'https://nesvel.com'
   * @example 'https://support.example.com'
   */
  contactUrl: string;

  /**
   * URL to the API's Terms of Service
   * @env SWAGGER_TERMS_URL
   * @optional
   * @example 'https://example.com/terms'
   */
  termsOfService?: string;

  /**
   * License information for the API
   * @env SWAGGER_LICENSE_NAME, SWAGGER_LICENSE_URL
   * @optional
   */
  license?: SwaggerLicense;

  /**
   * Primary API server URL
   * Used for "Try it out" functionality
   * @env API_URL
   * @default 'http://localhost:3000'
   * @example 'https://api.example.com'
   */
  serverUrl: string;

  /**
   * Additional server URLs
   * Allows testing against multiple environments
   * @env SWAGGER_ADDITIONAL_SERVERS (comma-separated)
   * @example [{ url: 'https://staging.api.com', description: 'Staging' }]
   */
  additionalServers: SwaggerServer[];

  /**
   * Endpoint tags for grouping operations
   * Organizes endpoints by functionality in Swagger UI
   * @example [{ name: 'users', description: 'User endpoints' }]
   */
  tags: SwaggerTag[];

  /**
   * Security scheme configurations
   * Defines available authentication methods
   */
  security: {
    /**
     * JWT Bearer authentication configuration
     */
    jwt: SwaggerSecurityScheme;

    /**
     * API Key authentication configuration
     */
    apiKey: SwaggerSecurityScheme;

    /**
     * OAuth2 authentication configuration
     */
    oauth2: SwaggerSecurityScheme;
  };

  /**
   * External documentation links
   * @env SWAGGER_EXTERNAL_DOCS_URL, SWAGGER_EXTERNAL_DOCS_DESCRIPTION
   * @optional
   */
  externalDocs?: SwaggerExternalDocs;

  /**
   * Swagger UI configuration options
   */
  ui: {
    /**
     * Persist authorization data in browser localStorage
     * @env SWAGGER_PERSIST_AUTH
     * @default true (development), false (production)
     */
    persistAuthorization: boolean;

    /**
     * Default expansion state for operations
     * @env SWAGGER_DOC_EXPANSION
     * @default 'none'
     * @options 'none' | 'list' | 'full'
     */
    docExpansion: string;

    /**
     * Enable filtering of tags and operations
     * @env SWAGGER_FILTER
     * @default true
     */
    filter: boolean;

    /**
     * Show request duration in response
     * @env SWAGGER_SHOW_REQUEST_DURATION
     * @default true
     */
    showRequestDuration: boolean;

    /**
     * Syntax highlighting theme
     * @env SWAGGER_SYNTAX_THEME
     * @default 'monokai'
     * @options 'agate', 'arta', 'monokai', 'nord', etc.
     */
    syntaxTheme: string;

    /**
     * Enable "Try it out" by default
     * @env SWAGGER_TRY_IT_OUT
     * @default true
     */
    tryItOutEnabled: boolean;

    /**
     * Display operation IDs
     * @env SWAGGER_DISPLAY_OPERATION_ID
     * @default false
     */
    displayOperationId: boolean;

    /**
     * Display request duration
     * @env SWAGGER_DISPLAY_REQUEST_DURATION
     * @default true
     */
    displayRequestDuration: boolean;

    /**
     * Enable deep linking (URL updates with tag/operation)
     * @env SWAGGER_DEEP_LINKING
     * @default true
     */
    deepLinking: boolean;

    /**
     * Show vendor extensions (x- fields)
     * @env SWAGGER_SHOW_EXTENSIONS
     * @default false
     */
    showExtensions: boolean;

    /**
     * Show common vendor extensions
     * @env SWAGGER_SHOW_COMMON_EXTENSIONS
     * @default false
     */
    showCommonExtensions: boolean;
  };

  /**
   * OpenAPI document URLs
   * Raw specification file endpoints
   */
  documents: {
    /**
     * JSON format OpenAPI document URL
     * @env SWAGGER_JSON_URL
     * @default 'api/docs-json'
     */
    jsonDocumentUrl: string;

    /**
     * YAML format OpenAPI document URL
     * @env SWAGGER_YAML_URL
     * @default 'api/docs-yaml'
     */
    yamlDocumentUrl: string;
  };

  /**
   * Custom branding options
   */
  branding: {
    /**
     * Custom page title
     * @env SWAGGER_SITE_TITLE
     * @default API title + ' - Documentation'
     */
    customSiteTitle: string;

    /**
     * Custom favicon URL
     * @env SWAGGER_FAVICON_URL
     * @default '/favicon.ico'
     */
    customFavIcon: string;

    /**
     * Custom CSS URL for styling
     * @env SWAGGER_CUSTOM_CSS_URL
     * @optional
     */
    customCssUrl?: string;

    /**
     * Custom JavaScript URL
     * @env SWAGGER_CUSTOM_JS_URL
     * @optional
     */
    customJsUrl?: string;

    /**
     * Custom logo URL
     * @env SWAGGER_LOGO_URL
     * @optional
     */
    logoUrl?: string;
  };

  /**
   * Advanced configuration options
   */
  advanced: {
    /**
     * Function to generate operation IDs
     * @param controllerKey - Controller class name
     * @param methodKey - Method/handler name
     * @returns Generated operation ID
     */
    operationIdFactory: (controllerKey: string, methodKey: string) => string;

    /**
     * Scan all routes including dynamic modules
     * @default true
     */
    deepScanRoutes: boolean;

    /**
     * Ignore global API prefix in documentation
     * @env SWAGGER_IGNORE_GLOBAL_PREFIX
     * @default false
     */
    ignoreGlobalPrefix: boolean;

    /**
     * Specific modules to include in documentation
     * Empty array includes all modules
     * @default []
     */
    include: unknown[];

    /**
     * Additional models to include in schemas
     * Useful for shared DTOs not directly referenced
     * @default []
     */
    extraModels: unknown[];
  };
}

/**
 * Swagger Configuration
 *
 * Comprehensive configuration for Swagger/OpenAPI documentation.
 * All options are environment-variable driven for flexibility across environments.
 *
 * @see {@link https://docs.nestjs.com/openapi/introduction | NestJS OpenAPI}
 * @see {@link https://swagger.io/specification/ | OpenAPI Specification}
 */
export const swaggerConfig: SwaggerConfig = {
  /**
   * API Title
   * @env SWAGGER_TITLE
   * @default 'Nesvel API'
   */
  title: process.env.SWAGGER_TITLE || 'Nesvel API',

  /**
   * API Description (supports markdown)
   * @env SWAGGER_DESCRIPTION
   * @default 'Production-ready API documentation for Nesvel platform'
   */
  description:
    process.env.SWAGGER_DESCRIPTION ||
    `# Nesvel API Documentation

Production-ready RESTful API for the Nesvel platform.

## Features
- 🔐 JWT & API Key authentication
- 📊 Comprehensive endpoint documentation
- 🚀 High performance
- 🔄 Versioned API (v1)

## Getting Started
1. Authenticate using JWT or API Key
2. Explore available endpoints
3. Test directly in the browser`,

  /**
   * API Version (semver)
   * @env API_VERSION
   * @default '1.0.0'
   */
  version: process.env.API_VERSION || '1.0.0',

  /**
   * Swagger UI Path
   * @env SWAGGER_PATH
   * @default 'api/docs'
   */
  apiPath: process.env.SWAGGER_PATH || 'api/docs',

  /**
   * Enable/Disable Swagger
   * @env SWAGGER_ENABLED
   * @default false (in production), true (otherwise)
   */
  enabled:
    process.env.SWAGGER_ENABLED === 'true' ||
    (process.env.SWAGGER_ENABLED !== 'false' &&
      process.env.NODE_ENV !== 'production'),

  /**
   * Contact Email
   * @env SWAGGER_CONTACT_EMAIL
   * @default 'api@nesvel.com'
   */
  contactEmail: process.env.SWAGGER_CONTACT_EMAIL || 'api@nesvel.com',

  /**
   * Contact Name
   * @env SWAGGER_CONTACT_NAME
   * @default 'Nesvel API Team'
   */
  contactName: process.env.SWAGGER_CONTACT_NAME || 'Nesvel API Team',

  /**
   * Contact URL
   * @env SWAGGER_CONTACT_URL
   * @default 'https://nesvel.com'
   */
  contactUrl: process.env.SWAGGER_CONTACT_URL || 'https://nesvel.com',

  /**
   * Terms of Service URL
   * @env SWAGGER_TERMS_URL
   * @optional
   */
  termsOfService: process.env.SWAGGER_TERMS_URL,

  /**
   * License Information
   * @env SWAGGER_LICENSE_NAME, SWAGGER_LICENSE_URL
   * @optional
   */
  license: process.env.SWAGGER_LICENSE_NAME
    ? {
        name: process.env.SWAGGER_LICENSE_NAME,
        url: process.env.SWAGGER_LICENSE_URL || '',
      }
    : undefined,

  /**
   * Server URL (for Try-it-out functionality)
   * @env API_URL
   * @default 'http://localhost:3000'
   */
  serverUrl: process.env.API_URL || 'http://localhost:3000',

  /**
   * Additional Servers
   * Comma-separated list of server URLs
   * @env SWAGGER_ADDITIONAL_SERVERS
   * @example 'https://staging.api.com,https://dev.api.com'
   * @optional
   */
  additionalServers: process.env.SWAGGER_ADDITIONAL_SERVERS
    ? process.env.SWAGGER_ADDITIONAL_SERVERS.split(',').map((url) => ({
        url: url.trim(),
        description: `Server: ${url.trim()}`,
      }))
    : [],

  /**
   * API Endpoint Tags
   * Groups endpoints by functionality
   */
  tags: [],

  /**
   * Security Schemes Configuration
   * Defines available authentication methods
   */
  security: {
    /**
     * JWT Bearer Authentication
     */
    jwt: {
      enabled: true,
      name: 'JWT-auth',
      description: 'JWT Bearer token authentication',
    },

    /**
     * API Key Authentication
     */
    apiKey: {
      enabled: true,
      name: 'api-key',
      headerName: 'X-API-KEY',
      description: 'API Key authentication',
    },

    /**
     * OAuth2 Authentication
     * @env OAUTH2_ENABLED, OAUTH2_AUTH_URL, OAUTH2_TOKEN_URL
     */
    oauth2: {
      enabled: process.env.OAUTH2_ENABLED === 'true',
      name: 'oauth2',
      description: 'OAuth2 authentication',
      authorizationUrl: process.env.OAUTH2_AUTH_URL || '',
      tokenUrl: process.env.OAUTH2_TOKEN_URL || '',
      scopes: {
        'read:users': 'Read user information',
        'write:users': 'Modify user information',
        admin: 'Full administrative access',
      },
    },
  },

  /**
   * External Documentation Links
   * @env SWAGGER_EXTERNAL_DOCS_URL, SWAGGER_EXTERNAL_DOCS_DESCRIPTION
   * @optional
   */
  externalDocs: process.env.SWAGGER_EXTERNAL_DOCS_URL
    ? {
        url: process.env.SWAGGER_EXTERNAL_DOCS_URL,
        description:
          process.env.SWAGGER_EXTERNAL_DOCS_DESCRIPTION ||
          'Find more info here',
      }
    : undefined,

  /**
   * Swagger UI Configuration
   */
  ui: {
    /**
     * Persist authorization data in browser
     * @env SWAGGER_PERSIST_AUTH
     * @default true (development), false (production)
     */
    persistAuthorization:
      process.env.SWAGGER_PERSIST_AUTH === 'true' ||
      (process.env.SWAGGER_PERSIST_AUTH !== 'false' &&
        process.env.NODE_ENV !== 'production'),

    /**
     * Default expansion state
     * @env SWAGGER_DOC_EXPANSION
     * @default 'none'
     * @options 'none' | 'list' | 'full'
     */
    docExpansion: process.env.SWAGGER_DOC_EXPANSION || 'none',

    /**
     * Enable filtering
     * @env SWAGGER_FILTER
     * @default true
     */
    filter: process.env.SWAGGER_FILTER !== 'false',

    /**
     * Show request duration
     * @env SWAGGER_SHOW_REQUEST_DURATION
     * @default true
     */
    showRequestDuration: process.env.SWAGGER_SHOW_REQUEST_DURATION !== 'false',

    /**
     * Syntax highlighting theme
     * @env SWAGGER_SYNTAX_THEME
     * @default 'monokai'
     */
    syntaxTheme: process.env.SWAGGER_SYNTAX_THEME || 'monokai',

    /**
     * Try it out enabled by default
     * @env SWAGGER_TRY_IT_OUT
     * @default true
     */
    tryItOutEnabled: process.env.SWAGGER_TRY_IT_OUT !== 'false',

    /**
     * Display operation ID
     * @env SWAGGER_DISPLAY_OPERATION_ID
     * @default false
     */
    displayOperationId: process.env.SWAGGER_DISPLAY_OPERATION_ID === 'true',

    /**
     * Display request duration
     * @env SWAGGER_DISPLAY_REQUEST_DURATION
     * @default true
     */
    displayRequestDuration:
      process.env.SWAGGER_DISPLAY_REQUEST_DURATION !== 'false',

    /**
     * Deep linking
     * @env SWAGGER_DEEP_LINKING
     * @default true
     */
    deepLinking: process.env.SWAGGER_DEEP_LINKING !== 'false',

    /**
     * Show extensions
     * @env SWAGGER_SHOW_EXTENSIONS
     * @default false
     */
    showExtensions: process.env.SWAGGER_SHOW_EXTENSIONS === 'true',

    /**
     * Show common extensions
     * @env SWAGGER_SHOW_COMMON_EXTENSIONS
     * @default false
     */
    showCommonExtensions: process.env.SWAGGER_SHOW_COMMON_EXTENSIONS === 'true',
  },

  /**
   * OpenAPI Document URLs
   * Expose raw OpenAPI specification in JSON/YAML formats
   */
  documents: {
    /**
     * JSON Document URL
     * @env SWAGGER_JSON_URL
     * @default 'api/docs-json'
     * @example 'swagger/json', 'openapi.json'
     */
    jsonDocumentUrl: process.env.SWAGGER_JSON_URL || 'api/docs-json',

    /**
     * YAML Document URL
     * @env SWAGGER_YAML_URL
     * @default 'api/docs-yaml'
     * @example 'swagger/yaml', 'openapi.yaml'
     */
    yamlDocumentUrl: process.env.SWAGGER_YAML_URL || 'api/docs-yaml',
  },

  /**
   * Custom Branding
   */
  branding: {
    /**
     * Custom site title
     * @env SWAGGER_SITE_TITLE
     * @default API title
     */
    customSiteTitle:
      process.env.SWAGGER_SITE_TITLE ||
      `${process.env.SWAGGER_TITLE || 'Nesvel API'} - Documentation`,

    /**
     * Custom favicon URL
     * @env SWAGGER_FAVICON_URL
     * @default '/favicon.ico'
     */
    customFavIcon: process.env.SWAGGER_FAVICON_URL || '/favicon.ico',

    /**
     * Custom CSS URL
     * @env SWAGGER_CUSTOM_CSS_URL
     * @optional
     */
    customCssUrl: process.env.SWAGGER_CUSTOM_CSS_URL,

    /**
     * Custom JS URL
     * @env SWAGGER_CUSTOM_JS_URL
     * @optional
     */
    customJsUrl: process.env.SWAGGER_CUSTOM_JS_URL,

    /**
     * Custom logo URL
     * @env SWAGGER_LOGO_URL
     * @optional
     */
    logoUrl: process.env.SWAGGER_LOGO_URL,
  },

  /**
   * Advanced Configuration
   */
  advanced: {
    /**
     * Operation ID factory
     * Generates operation IDs from controller and method names
     */
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,

    /**
     * Deep scan routes
     * Scans all routes including dynamic modules
     */
    deepScanRoutes: true,

    /**
     * Ignore global prefix
     * @env SWAGGER_IGNORE_GLOBAL_PREFIX
     * @default false
     */
    ignoreGlobalPrefix: process.env.SWAGGER_IGNORE_GLOBAL_PREFIX === 'true',

    /**
     * Include modules
     * Specific modules to include in documentation
     * @optional
     */
    include: [],

    /**
     * Extra models
     * Additional models to include in schemas
     * @optional
     */
    extraModels: [],
  },
};
