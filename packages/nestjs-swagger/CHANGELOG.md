# Changelog

All notable changes to the NestJS Swagger package are documented in this file.

---

## [1.0.0] - 2025-10-30

### Added

#### Core Module

- **Created Swagger module** for NestJS applications
- **Modular architecture** with clean separation of concerns
- **Type-safe configuration** with comprehensive interfaces
- **Environment variable support** with sensible defaults
- **Production-ready setup** with security considerations

#### Services

- **`SwaggerBuilderService`** - Builds OpenAPI document configuration
- **`SwaggerSetupService`** - Sets up Swagger UI and documentation endpoint

#### Interfaces

- **`SwaggerConfig`** - Main configuration interface
- **`SwaggerAuthConfig`** - Authentication scheme configuration
- **`SwaggerUIOptions`** - UI customization options

#### Constants

- **`DEFAULT_SWAGGER_UI_OPTIONS`** - Default UI configuration
- **`DEFAULT_SWAGGER_CSS`** - Default custom CSS styling
- **`AUTH_SCHEMES`** - Authentication scheme identifiers
- **`DEFAULT_AUTH_CONFIGS`** - Default authentication configurations

#### Features

- **Authentication support** - JWT Bearer and API Key schemes out of the box
- **Tag-based organization** - Group endpoints by tags for better structure
- **Custom UI theming** - Customizable CSS and styling options
- **Environment-based configuration** - Easy setup via environment variables
- **Production deployment ready** - Built-in security considerations

### File Structure

```
swagger/
├── constants/          # Default configurations and constants
├── interfaces/         # TypeScript interfaces
├── services/          # Business logic services
├── swagger.module.ts  # Module definition
└── index.ts          # Module exports
```

### Benefits

#### Code Organization

- **Clean architecture** with separation of concerns
- **Modular design** for easy maintenance and extension
- **Type-safe** throughout with full TypeScript support

#### Documentation

- **Comprehensive README** with usage examples
- **CONTRIBUTING guide** for developers
- **JSDoc comments** on all public APIs

#### Developer Experience

- **Easy setup** with minimal configuration
- **Flexible configuration** via environment variables or code
- **Production-ready** with security best practices



---

## License

This project is licensed under the MIT License.
