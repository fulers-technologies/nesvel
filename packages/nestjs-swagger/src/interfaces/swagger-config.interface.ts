/**
 * Swagger/OpenAPI Configuration Interface
 *
 * Defines the structure for configuring Swagger documentation in a NestJS application.
 * This interface provides comprehensive options for customizing the API documentation,
 * including metadata, contact information, licensing, and server configuration.
 *
 * @interface SwaggerConfig
 *
 * @example Basic Configuration
 * ```typescript
 * const config: SwaggerConfig = {
 *   title: 'My API',
 *   description: 'API documentation',
 *   version: '1.0.0',
 *   apiPath: 'api/docs',
 *   enabled: true
 * };
 * ```
 *
 * @example Full Configuration
 * ```typescript
 * const config: SwaggerConfig = {
 *   title: 'My API',
 *   description: 'API documentation',
 *   version: '1.0.0',
 *   apiPath: 'api/docs',
 *   enabled: true,
 *   contactEmail: 'api@example.com',
 *   contactName: 'API Team',
 *   contactUrl: 'https://example.com',
 *   serverUrl: 'http://localhost:3000',
 *   license: {
 *     name: 'MIT',
 *     url: 'https://opensource.org/licenses/MIT'
 *   },
 *   tags: [
 *     { name: 'users', description: 'User management endpoints' },
 *     { name: 'auth', description: 'Authentication endpoints' }
 *   ]
 * };
 * ```
 *
 * @see {@link https://swagger.io/specification/ | OpenAPI Specification}
 * @see {@link https://docs.nestjs.com/openapi/introduction | NestJS OpenAPI Documentation}
 */
export interface SwaggerConfig {
  /**
   * API documentation title
   *
   * The main title displayed at the top of the Swagger UI.
   * Should be concise and descriptive of your API.
   *
   * @example 'Nesvel API'
   * @example 'E-Commerce REST API'
   */
  title: string;

  /**
   * API documentation description
   *
   * A detailed description of your API's purpose and functionality.
   * Supports markdown formatting for rich text display in the Swagger UI.
   *
   * @example 'Production-ready API documentation for Nesvel platform'
   * @example 'RESTful API for managing products, orders, and customers'
   *
   * @remarks
   * You can use markdown syntax for better formatting:
   * - Headers: `# Title`, `## Subtitle`
   * - Lists: `- Item 1`, `- Item 2`
   * - Links: `[text](url)`
   * - Code: `` `code` ``
   */
  description: string;

  /**
   * API version
   *
   * The current version of your API following semantic versioning (semver).
   * This should match your API's actual version number and be updated with each release.
   *
   * @example '1.0.0'
   * @example '2.1.3'
   * @example '1.0.0-beta.1'
   *
   * @see {@link https://semver.org/ | Semantic Versioning}
   */
  version: string;

  /**
   * Swagger UI path
   *
   * The URL path where the Swagger documentation will be accessible.
   * This path should not conflict with your API routes.
   *
   * @example 'api/docs'
   * @example 'docs'
   * @example 'swagger'
   *
   * @default 'api/docs'
   *
   * @remarks
   * - Accessible at: `http://your-domain.com/{apiPath}`
   * - Avoid using paths that might conflict with your API endpoints
   * - Common conventions: 'docs', 'api-docs', 'swagger', 'api/docs'
   */
  apiPath: string;

  /**
   * Enable or disable Swagger documentation
   *
   * When false, the Swagger documentation will not be initialized or accessible.
   * Typically disabled in production environments for security and performance.
   *
   * @default false (in production)
   * @default true (in development)
   *
   * @example
   * ```typescript
   * // Environment-based configuration
   * enabled: process.env.NODE_ENV !== 'production'
   * ```
   *
   * @remarks
   * **Security Considerations:**
   * - Exposing API documentation in production may reveal sensitive information
   * - Consider implementing authentication for the documentation endpoint
   * - Use environment variables to control this setting
   */
  enabled: boolean;

  /**
   * Contact email address
   *
   * Email address for API support or inquiries.
   * Displayed in the API documentation metadata section.
   *
   * @optional
   * @example 'api@nesvel.com'
   * @example 'support@example.com'
   * @example 'developers@company.com'
   *
   * @remarks
   * - Shown in the Swagger UI info section
   * - Can be clicked by users to open their email client
   * - Part of the OpenAPI specification's contact object
   */
  contactEmail?: string;

  /**
   * Contact name
   *
   * Name of the person, team, or organization responsible for the API.
   * Displayed in the API documentation metadata section.
   *
   * @optional
   * @example 'Nesvel API Team'
   * @example 'John Doe'
   * @example 'Developer Relations'
   *
   * @remarks
   * - Shown in the Swagger UI info section
   * - Helps users identify who maintains the API
   * - Part of the OpenAPI specification's contact object
   */
  contactName?: string;

  /**
   * Contact URL
   *
   * Website or support page URL for the API.
   * Displayed in the API documentation metadata section.
   *
   * @optional
   * @example 'https://nesvel.com'
   * @example 'https://developers.example.com'
   * @example 'https://support.company.com/api'
   *
   * @remarks
   * - Shown as a clickable link in the Swagger UI
   * - Should point to relevant documentation or support resources
   * - Part of the OpenAPI specification's contact object
   */
  contactUrl?: string;

  /**
   * Terms of service URL
   *
   * Link to the terms of service document for using the API.
   * Displayed in the API documentation metadata section.
   *
   * @optional
   * @example 'https://nesvel.com/terms'
   * @example 'https://example.com/api/terms-of-service'
   *
   * @remarks
   * - Shown as a clickable link in the Swagger UI
   * - Important for legal compliance and user agreements
   * - Part of the OpenAPI specification's info object
   */
  termsOfService?: string;

  /**
   * Server URL
   *
   * The base URL where the API is hosted.
   * Used for the "Try it out" functionality in Swagger UI.
   *
   * @optional
   * @example 'http://localhost:3000'
   * @example 'https://api.nesvel.com'
   * @example 'https://staging-api.example.com'
   *
   * @remarks
   * - Used to construct full URLs for API requests in Swagger UI
   * - Can be changed by users in the Swagger UI server selector
   * - Multiple servers can be configured (future enhancement)
   * - Should match your actual API base URL
   *
   * @see {@link https://swagger.io/docs/specification/api-host-and-base-path/ | OpenAPI Server Object}
   */
  serverUrl?: string;

  /**
   * License information
   *
   * Specifies the license under which the API is provided.
   * Both name and URL should be provided for complete license information.
   *
   * @optional
   * @example MIT License
   * ```typescript
   * { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
   * ```
   * @example Apache License
   * ```typescript
   * { name: 'Apache 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0.html' }
   * ```
   *
   * @remarks
   * - Shown in the Swagger UI info section
   * - Important for open source APIs
   * - Part of the OpenAPI specification's info object
   * - URL should point to the full license text
   */
  license?: {
    /**
     * License name
     *
     * The name of the license (e.g., 'MIT', 'Apache 2.0', 'GPL-3.0')
     *
     * @example 'MIT'
     * @example 'Apache 2.0'
     * @example 'GPL-3.0'
     */
    name: string;

    /**
     * License URL
     *
     * A URL pointing to the full license text
     *
     * @example 'https://opensource.org/licenses/MIT'
     * @example 'https://www.apache.org/licenses/LICENSE-2.0.html'
     */
    url: string;
  };

  /**
   * API endpoint tags
   *
   * Defines tags for grouping and organizing API endpoints in the documentation.
   * Each tag has a name and description that appears in the Swagger UI.
   * Endpoints are grouped under these tags for better organization.
   *
   * @optional
   * @example
   * ```typescript
   * [
   *   { name: 'auth', description: 'Authentication and authorization endpoints' },
   *   { name: 'users', description: 'User management and profile endpoints' },
   *   { name: 'products', description: 'Product catalog and inventory endpoints' }
   * ]
   * ```
   *
   * @remarks
   * **Usage in Controllers:**
   * ```typescript
   * @ApiTags('users')
   * @Controller('users')
   * export class UsersController { }
   * ```
   *
   * **Best Practices:**
   * - Use descriptive, plural nouns for tag names
   * - Keep tag names consistent across your API
   * - Order tags logically (e.g., auth first, then resources)
   * - Provide clear, concise descriptions
   * - Limit the number of tags (5-15 is typical)
   */
  tags?: Array<{
    /**
     * Tag name
     *
     * The unique identifier for this tag.
     * Must match the tag name used in controller decorators.
     *
     * @example 'users'
     * @example 'auth'
     * @example 'products'
     *
     * @remarks
     * - Should be lowercase and use hyphens for multi-word tags
     * - Use plural nouns for resource tags
     * - Keep consistent with your API's naming conventions
     */
    name: string;

    /**
     * Tag description
     *
     * A brief description of what endpoints this tag groups.
     * Shown in the Swagger UI next to the tag name.
     *
     * @example 'User management endpoints'
     * @example 'Authentication and authorization'
     * @example 'Product catalog operations'
     *
     * @remarks
     * - Keep descriptions concise (1-2 sentences)
     * - Describe the purpose, not the HTTP methods
     * - Use consistent formatting across all tag descriptions
     */
    description: string;
  }>;

  /**
   * JSON Document URL
   *
   * The URL path where the OpenAPI JSON specification will be accessible.
   * This allows tools and clients to consume the raw OpenAPI specification.
   *
   * @optional
   * @example 'swagger/json'
   * @example 'api-docs-json'
   * @example 'openapi.json'
   *
   * @default undefined (not exposed)
   *
   * @remarks
   * - Accessible at: `http://your-domain.com/{jsonDocumentUrl}`
   * - Useful for API clients, code generators, and testing tools
   * - Returns the OpenAPI specification in JSON format
   * - Should not conflict with your API routes
   *
   * @see {@link https://swagger.io/specification/ | OpenAPI Specification}
   */
  jsonDocumentUrl?: string;

  /**
   * YAML Document URL
   *
   * The URL path where the OpenAPI YAML specification will be accessible.
   * This provides an alternative format for the OpenAPI specification.
   *
   * @optional
   * @example 'swagger/yaml'
   * @example 'api-docs-yaml'
   * @example 'openapi.yaml'
   *
   * @default undefined (not exposed)
   *
   * @remarks
   * - Accessible at: `http://your-domain.com/{yamlDocumentUrl}`
   * - YAML format is more human-readable than JSON
   * - Useful for documentation and version control
   * - Should not conflict with your API routes
   *
   * @see {@link https://swagger.io/specification/ | OpenAPI Specification}
   */
  yamlDocumentUrl?: string;

  /**
   * Custom Site Title
   *
   * Custom title for the Swagger UI browser tab.
   * If not provided, defaults to the API title.
   *
   * @optional
   * @example 'My API Documentation'
   * @example 'Nesvel API Docs'
   *
   * @default API title
   *
   * @remarks
   * - Shown in the browser tab/window title
   * - Helps users identify the documentation tab among many open tabs
   * - Can be different from the API title for branding purposes
   */
  customSiteTitle?: string;

  /**
   * Custom Favicon Icon URL
   *
   * URL to a custom favicon for the Swagger UI page.
   *
   * @optional
   * @example '/favicon.ico'
   * @example '/assets/api-icon.png'
   * @example 'https://cdn.example.com/favicon.ico'
   *
   * @default '/favicon.ico'
   *
   * @remarks
   * - Shown in the browser tab
   * - Should be a small square image (typically 16x16 or 32x32 pixels)
   * - Supports .ico, .png, .svg formats
   * - Can be a relative or absolute URL
   */
  customFavIcon?: string;

  /**
   * Custom CSS
   *
   * Custom CSS to style the Swagger UI.
   * Allows complete customization of the documentation appearance.
   *
   * @optional
   * @example
   * ```typescript
   * `.swagger-ui .topbar { background-color: #000; }`
   * ```
   *
   * @remarks
   * - Injected into the Swagger UI page
   * - Can override default Swagger UI styles
   * - Useful for branding and theme customization
   * - Use CSS selectors to target Swagger UI elements
   */
  customCss?: string;
}
