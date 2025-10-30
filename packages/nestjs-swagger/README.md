# Swagger Module

Production-ready Swagger/OpenAPI documentation module for NestJS applications.

## Structure

```
swagger/
├── constants/          # Default configurations and constants
│   ├── swagger.constants.ts
│   └── index.ts
├── interfaces/         # TypeScript interfaces
│   ├── swagger-config.interface.ts
│   └── index.ts
├── services/          # Business logic services
│   ├── swagger-builder.service.ts
│   ├── swagger-setup.service.ts
│   └── index.ts
├── swagger.module.ts  # Module definition
├── index.ts          # Module exports
└── README.md         # This file
```

## Features

- **Modular Architecture**: Clean separation of concerns with services, interfaces, and constants
- **Type-Safe Configuration**: Full TypeScript support with interfaces
- **Production-Ready**: Environment-based configuration with sensible defaults
- **Authentication Support**: JWT Bearer and API Key authentication schemes
- **Customizable UI**: Custom themes and styling options
- **Tag-Based Organization**: Group endpoints by tags for better documentation structure

## Usage

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { SwaggerModule } from './modules/swagger';

@Module({
  imports: [SwaggerModule],
  // ...
})
export class AppModule {}
```

### 2. Setup in main.ts

```typescript
import { SwaggerSetupService } from './modules';
import { swaggerConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup Swagger documentation
  const swaggerSetup = app.get(SwaggerSetupService);
  swaggerSetup.setup(app, swaggerConfig);

  await app.listen(3000);
}
```

### 3. Configure via Environment Variables

See `.env.example` for available configuration options:

```env
SWAGGER_ENABLED=true
SWAGGER_TITLE=My API
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_PATH=api/docs
```

## Components

### Services

#### SwaggerBuilderService

Builds the OpenAPI document configuration with authentication schemes, tags, and metadata.

#### SwaggerSetupService

Sets up the Swagger UI and OpenAPI documentation endpoint.

### Interfaces

#### SwaggerConfig

Main configuration interface for Swagger setup.

#### SwaggerAuthConfig

Authentication scheme configuration interface.

#### SwaggerUIOptions

Swagger UI customization options interface.

### Constants

- `DEFAULT_SWAGGER_UI_OPTIONS`: Default Swagger UI configuration
- `DEFAULT_SWAGGER_CSS`: Default custom CSS for Swagger UI
- `AUTH_SCHEMES`: Authentication scheme identifiers
- `DEFAULT_AUTH_CONFIGS`: Default authentication configurations

## Decorators

Use NestJS Swagger decorators in your controllers and DTOs:

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nesvel/nestjs-swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    // ...
  }
}
```

## Authentication

The module automatically configures two authentication schemes:

1. **JWT Bearer**: Use `@ApiBearerAuth('JWT-auth')` on protected endpoints
2. **API Key**: Use `@ApiSecurity('api-key')` on protected endpoints

## Customization

### Custom Authentication Schemes

Edit `constants/swagger.constants.ts` to add or modify authentication schemes.

### Custom UI Styling

Modify `DEFAULT_SWAGGER_CSS` in `constants/swagger.constants.ts` to customize the Swagger UI appearance.

### Custom Tags

Update the `tags` array in `config/swagger.config.ts` to define your API's tag structure.

## Production Deployment

In production, Swagger is disabled by default. To enable:

```env
NODE_ENV=production
SWAGGER_ENABLED=true
```

**Security Note**: Consider restricting access to Swagger documentation in production environments.
