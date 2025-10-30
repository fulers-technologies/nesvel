import {
  Controller,
  Body,
  Param,
  Query,
  Headers,
  ValidationPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ApiEndpoint } from '../decorators/api-endpoint.decorator';

@ApiTags('users')
@Controller('users')
@ApiExtraModels()
@ApiBearerAuth('JWT-auth')
@ApiSecurity('api-key')
export class UserController {
  @ApiEndpoint({
    preset: 'crud.list',
    operation: {
      summary: 'Get all users',
      description: 'Retrieve a paginated list of all users',
      operationId: 'getAllUsers',
    },
    responseHeaders: { 'X-Custom-Header': 'Custom-Value' },
    pipes: [new ValidationPipe({ transform: true })],
    queries: [
      {
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
        example: 1,
      },
      {
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
        example: 10,
      },
      {
        name: 'search',
        required: false,
        type: String,
        description: 'Search term',
      },
      {
        name: 'sort',
        required: false,
        type: String,
        description: 'Sort field',
        enum: ['name', 'email', 'createdAt'],
      },
    ],
    headers: [
      {
        name: 'Accept-Language',
        description: 'Language preference',
        required: false,
      },
    ],
    produces: ['application/json'],
    cache: { key: 'users-list', ttl: 60 },
    throttle: { limit: 100, ttl: 60 },
    telemetry: { trace: true, spanName: 'list-users' },
    examples: {
      success: {
        data: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
        page: 1,
        limit: 10,
        total: 1,
      },
    },
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Headers('accept-language') language?: string,
  ) {
    return {
      data: [],
      page,
      limit,
      total: 0,
      search,
      sort,
      language,
    };
  }

  @ApiEndpoint(':id', {
    preset: 'crud.read',
    operation: {
      summary: 'Get user by ID',
      description: 'Retrieve a specific user by their unique identifier',
      operationId: 'getUserById',
    },
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
    produces: ['application/json', 'application/xml'],
    cache: { key: 'user-{{id}}', ttl: 300 },
    telemetry: { trace: true, metrics: true },
    examples: {
      success: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') auth?: string,
  ) {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      auth: auth ? 'provided' : 'missing',
    };
  }

  @ApiEndpoint({
    preset: 'crud.create',
    pipes: [
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    ],
    operation: {
      summary: 'Create new user',
      description: 'Create a new user account with the provided information',
      operationId: 'createUser',
    },
    body: {
      description: 'User creation payload',
      schema: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          age: { type: 'number', example: 30 },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
    },
    consumes: ['application/json', 'application/x-www-form-urlencoded'],
    produces: ['application/json'],
    throttle: { limit: 10, ttl: 60 },
    telemetry: { trace: true, spanName: 'create-user' },
    retry: { attempts: 3, delay: 1000 },
    examples: {
      request: { name: 'Jane Doe', email: 'jane@example.com', age: 28 },
      response: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    },
  })
  create(
    @Body() body: Record<string, any>,
    @Headers('content-type') contentType?: string,
  ): Record<string, any> {
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...body,
      contentType,
    };
  }

  @ApiEndpoint(':id', {
    preset: 'crud.update',
    pipes: [new ValidationPipe({ whitelist: true, transform: true })],
    operation: {
      summary: 'Update user (full replacement)',
      description: 'Completely replace user data with new values',
      operationId: 'updateUser',
    },
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
    body: {
      description: 'Complete user data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          age: { type: 'number' },
        },
      },
    },
    responses: {
      forbidden: 'Forbidden - insufficient permissions',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    roles: ['admin', 'user'],
    telemetry: { trace: true },
    circuitBreaker: { threshold: 5, timeout: 3000 },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Record<string, any>,
  ): Record<string, any> {
    return {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };
  }

  @ApiEndpoint(':id', {
    preset: 'crud.patch',
    pipes: [new ValidationPipe({ skipMissingProperties: true })],
    operation: {
      summary: 'Update user (partial)',
      description:
        'Update specific fields of a user without affecting other fields',
      operationId: 'partialUpdateUser',
    },
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
    body: {
      description: 'Partial user data to update',
      required: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          age: { type: 'number' },
        },
      },
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    telemetry: { trace: true },
    examples: {
      request: { name: 'Jane' },
      response: { id: '123', name: 'Jane', updatedFields: ['name'] },
    },
    externalDocs: {
      description: 'Learn more about partial updates',
      url: 'https://docs.example.com/patch-updates',
    },
  })
  partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Record<string, any>,
  ): Record<string, any> {
    return {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedFields: Object.keys(body),
    };
  }

  @ApiEndpoint(':id', {
    preset: 'crud.delete',
    operation: {
      summary: 'Delete user',
      description: 'Permanently delete a user account from the system',
      operationId: 'deleteUser',
    },
    responses: {
      forbidden: 'Cannot delete this user',
      internalError: 'Internal server error',
    },
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: true,
      },
    ],
    queries: [
      {
        name: 'force',
        type: 'boolean',
        required: false,
        description: 'Force delete even if user has active sessions',
      },
    ],
    headers: [
      {
        name: 'X-Delete-Confirmation',
        description: 'Confirmation token for delete operation',
        required: false,
      },
    ],
    produces: ['application/json'],
    roles: ['admin'],
    security: {
      requireHttps: true,
      ipWhitelist: ['192.168.1.0/24'],
    },
    telemetry: { trace: true, metrics: true, spanName: 'delete-user' },
    circuitBreaker: { threshold: 3, timeout: 5000 },
    deprecated: 'Use DELETE /v2/users/:id instead',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force') force?: boolean,
    @Headers('x-delete-confirmation') confirmation?: string,
  ) {
    return {
      id,
      deleted: true,
      deletedAt: new Date().toISOString(),
      force,
      confirmation: confirmation ? 'verified' : 'not-provided',
    };
  }
}
