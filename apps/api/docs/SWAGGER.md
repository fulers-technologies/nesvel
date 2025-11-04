# Swagger Documentation

This API uses `@nesvel/nestjs-swagger` for API documentation via OpenAPI/Swagger.

## Accessing the Documentation

When the application is running, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## Configuration

Swagger configuration is defined in `src/config/swagger.config.ts`. You can customize:

- **Title**: API documentation title
- **Description**: API description
- **Version**: API version
- **Path**: Where Swagger UI is accessible
- **Tags**: API endpoint grouping
- **Contact Info**: Team contact details
- **License**: API license information

### Environment Variables

You can override the default configuration using environment variables:

```env
SWAGGER_ENABLED=true
SWAGGER_TITLE=My API
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_PATH=api/docs
API_VERSION=1.0.0
API_URL=http://localhost:3000
SWAGGER_CONTACT_EMAIL=api@nesvel.com
SWAGGER_CONTACT_NAME=Nesvel API Team
SWAGGER_CONTACT_URL=https://nesvel.com
```

## Documenting Endpoints

Use NestJS Swagger decorators to document your controllers and DTOs:

### Controller Example

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nesvel/nestjs-swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserDto],
  })
  findAll() {
    // ...
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }
}
```

### DTO Example

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nesvel/nestjs-swagger';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    minLength: 8,
    example: 'SecurePassword123!',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
```

## Available Decorators

### Controller Decorators

- `@ApiTags(...)` - Group endpoints by tag
- `@ApiOperation(...)` - Describe an endpoint
- `@ApiResponse(...)` - Define response schemas
- `@ApiBearerAuth(...)` - Mark endpoint as requiring JWT auth
- `@ApiSecurity(...)` - Mark endpoint as requiring API key

### Property Decorators

- `@ApiProperty(...)` - Document a required property
- `@ApiPropertyOptional(...)` - Document an optional property
- `@ApiHideProperty()` - Hide a property from documentation

### Parameter Decorators

- `@ApiQuery(...)` - Document query parameters
- `@ApiParam(...)` - Document path parameters
- `@ApiBody(...)` - Document request body
- `@ApiHeader(...)` - Document required headers

## Authentication Schemes

The Swagger UI supports these authentication schemes:

### JWT Bearer Authentication

Used for most protected endpoints:

```typescript
@ApiBearerAuth('JWT-auth')
@Get('profile')
getProfile() { }
```

### API Key Authentication

Alternative authentication method:

```typescript
@ApiSecurity('api-key')
@Get('data')
getData() { }
```

## Production Considerations

### Disabling in Production

By default, Swagger is enabled. To disable in production:

```env
SWAGGER_ENABLED=false
```

Or in your configuration:

```typescript
enabled: process.env.NODE_ENV !== 'production';
```

### Security

If you need Swagger in production, consider:

1. **Restricting Access**: Add authentication middleware to the `/api/docs` path
2. **IP Whitelisting**: Only allow specific IPs to access documentation
3. **Basic Auth**: Protect the documentation with HTTP Basic Authentication

## Resources

- [NestJS OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
