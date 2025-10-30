import { Controller, Param, Query, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiEndpoint } from '../decorators/api-endpoint.decorator';

// Simple DTOs
class CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

class UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

class UserResponseDto {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

@Controller('users')
export class UsersController {
  // ==================== LIST USERS ====================
  @ApiEndpoint({
    preset: 'crud.list',
    body: undefined,
    queries: [
      { name: 'page', type: Number, required: false, example: 1 },
      { name: 'limit', type: Number, required: false, example: 10 },
      { name: 'search', type: String, required: false, example: 'john' },
    ],
    responses: {
      ok: {
        description: 'List of users retrieved successfully',
        type: [UserResponseDto],
      },
    },
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): UserResponseDto[] {
    // Mock data
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // ==================== GET USER BY ID ====================
  @ApiEndpoint(':id', {
    preset: 'crud.read',
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
    responses: {
      ok: {
        description: 'User found',
        type: UserResponseDto,
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): UserResponseDto {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ==================== CREATE USER ====================
  @ApiEndpoint({
    preset: 'crud.create',
    body: CreateUserDto,
    responses: {
      created: {
        description: 'User created successfully',
        type: UserResponseDto,
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto): UserResponseDto {
    return {
      id: 'generated-uuid',
      ...createUserDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ==================== UPDATE USER ====================
  @ApiEndpoint(':id', {
    preset: 'crud.update',
    body: UpdateUserDto,
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID',
      },
    ],
    responses: {
      ok: {
        description: 'User updated successfully',
        type: UserResponseDto,
      },
    },
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): UserResponseDto {
    return {
      id,
      name: updateUserDto.name || 'John Doe',
      email: updateUserDto.email || 'john@example.com',
      age: updateUserDto.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // ==================== DELETE USER ====================
  @ApiEndpoint(':id', {
    preset: 'crud.delete',
    params: [
      {
        name: 'id',
        type: 'string',
        description: 'User ID',
      },
    ],
    responses: {
      ok: {
        description: 'User deleted successfully',
      },
    },
  })
  remove(@Param('id', ParseUUIDPipe) id: string): { message: string } {
    return {
      message: `User ${id} deleted successfully`,
    };
  }
}
