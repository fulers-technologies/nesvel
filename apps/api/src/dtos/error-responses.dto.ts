import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base error response structure
 */
export class BaseErrorDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Error message',
    description: 'Error message or array of messages',
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'Error type' })
  error: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request ID for tracking',
  })
  requestId?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Error timestamp',
  })
  timestamp?: string;

  @ApiPropertyOptional({ example: '/api/users', description: 'Request path' })
  path?: string;
}

/**
 * 400 Bad Request - Validation errors
 */
export class BadRequestErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 400 })
  declare statusCode: 400;

  @ApiProperty({
    example: ['name must be a string', 'email must be a valid email'],
    description: 'Array of validation error messages',
  })
  declare message: string[];

  @ApiProperty({ example: 'Bad Request' })
  declare error: 'Bad Request';
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 401 })
  declare statusCode: 401;

  @ApiProperty({ example: 'Unauthorized' })
  declare message: string;

  @ApiProperty({ example: 'Unauthorized' })
  declare error: 'Unauthorized';
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 403 })
  declare statusCode: 403;

  @ApiProperty({ example: 'You do not have permission to perform this action' })
  declare message: string;

  @ApiProperty({ example: 'Forbidden' })
  declare error: 'Forbidden';

  @ApiPropertyOptional({
    example: ['admin', 'moderator'],
    description: 'Required roles to access this resource',
  })
  requiredRoles?: string[];

  @ApiPropertyOptional({
    example: ['users:read', 'users:write'],
    description: 'Required permissions',
  })
  requiredPermissions?: string[];
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 404 })
  declare statusCode: 404;

  @ApiProperty({ example: 'Resource not found' })
  declare message: string;

  @ApiProperty({ example: 'Not Found' })
  declare error: 'Not Found';

  @ApiPropertyOptional({
    example: 'User',
    description: 'Type of resource not found',
  })
  resourceType?: string;

  @ApiPropertyOptional({
    example: '123',
    description: 'ID of resource not found',
  })
  resourceId?: string;
}

/**
 * 409 Conflict - Resource conflict
 */
export class ConflictErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 409 })
  declare statusCode: 409;

  @ApiProperty({ example: 'Resource already exists' })
  declare message: string;

  @ApiProperty({ example: 'Conflict' })
  declare error: 'Conflict';

  @ApiPropertyOptional({
    example: 'duplicate',
    enum: [
      'duplicate',
      'version_mismatch',
      'state_conflict',
      'concurrent_modification',
    ],
    description: 'Type of conflict',
  })
  conflictType?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Conflicting field value',
  })
  conflictingValue?: string;
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationErrorDetail {
  @ApiProperty({
    example: 'email',
    description: 'Field that failed validation',
  })
  field: string;

  @ApiProperty({
    example: 'Email already in use',
    description: 'Validation error message',
  })
  message: string;

  @ApiProperty({ example: 'DUPLICATE_EMAIL', description: 'Error code' })
  code: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Invalid value',
  })
  value?: any;
}

export class UnprocessableEntityErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 422 })
  declare statusCode: 422;

  @ApiProperty({ example: 'Validation failed' })
  declare message: string;

  @ApiProperty({ example: 'Unprocessable Entity' })
  declare error: 'Unprocessable Entity';

  @ApiProperty({
    type: [ValidationErrorDetail],
    description: 'Detailed validation errors',
  })
  errors: ValidationErrorDetail[];
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 429 })
  declare statusCode: 429;

  @ApiProperty({ example: 'Too many requests' })
  declare message: string;

  @ApiProperty({ example: 'Too Many Requests' })
  declare error: 'Too Many Requests';

  @ApiProperty({ example: 60, description: 'Seconds until rate limit resets' })
  retryAfter: number;

  @ApiProperty({ example: 100, description: 'Rate limit threshold' })
  limit: number;

  @ApiProperty({
    example: 0,
    description: 'Remaining requests in current window',
  })
  remaining: number;

  @ApiPropertyOptional({
    example: 1640995200,
    description: 'Unix timestamp when limit resets',
  })
  resetAt?: number;
}

/**
 * 500 Internal Server Error
 */
export class InternalServerErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 500 })
  declare statusCode: 500;

  @ApiProperty({ example: 'Internal server error' })
  declare message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  declare error: 'Internal Server Error';

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request ID for support',
  })
  declare requestId: string;
}

/**
 * 502 Bad Gateway - Upstream service error
 */
export class BadGatewayErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 502 })
  declare statusCode: 502;

  @ApiProperty({ example: 'Bad gateway' })
  declare message: string;

  @ApiProperty({ example: 'Bad Gateway' })
  declare error: 'Bad Gateway';

  @ApiPropertyOptional({
    example: 'payment-service',
    description: 'Upstream service that failed',
  })
  upstreamService?: string;

  @ApiPropertyOptional({
    example: 'Connection refused',
    description: 'Upstream error details',
  })
  upstreamError?: string;
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 503 })
  declare statusCode: 503;

  @ApiProperty({ example: 'Service temporarily unavailable' })
  declare message: string;

  @ApiProperty({ example: 'Service Unavailable' })
  declare error: 'Service Unavailable';

  @ApiProperty({ example: 300, description: 'Seconds to wait before retrying' })
  retryAfter: number;

  @ApiPropertyOptional({
    example: 'maintenance',
    enum: ['maintenance', 'overload', 'deployment'],
    description: 'Reason for unavailability',
  })
  reason?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T12:00:00Z',
    description: 'Expected service restoration time',
  })
  estimatedRestoration?: string;
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 504 })
  declare statusCode: 504;

  @ApiProperty({ example: 'Gateway timeout' })
  declare message: string;

  @ApiProperty({ example: 'Gateway Timeout' })
  declare error: 'Gateway Timeout';

  @ApiProperty({
    example: 30000,
    description: 'Timeout duration in milliseconds',
  })
  timeout: number;

  @ApiPropertyOptional({
    example: 'external-api',
    description: 'Service that timed out',
  })
  upstreamService?: string;
}

/**
 * 202 Accepted - Async operation accepted
 */
export class AcceptedResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Job/Task ID',
  })
  jobId: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'processing', 'queued'],
    description: 'Job status',
  })
  status: string;

  @ApiPropertyOptional({
    example: '/api/jobs/550e8400-e29b-41d4-a716-446655440000',
    description: 'Status endpoint',
  })
  statusUrl?: string;

  @ApiPropertyOptional({
    example: 300,
    description: 'Estimated processing time in seconds',
  })
  estimatedTime?: number;
}

/**
 * 301 Moved Permanently
 */
export class MovedPermanentlyDto {
  @ApiProperty({ example: 301 })
  statusCode: 301;

  @ApiProperty({ example: 'Resource has been moved permanently' })
  message: string;

  @ApiProperty({
    example: '/api/v2/users/123',
    description: 'New location of the resource',
  })
  location: string;
}

/**
 * 302 Found
 */
export class FoundDto {
  @ApiProperty({ example: 302 })
  statusCode: 302;

  @ApiProperty({ example: 'Resource found at different location' })
  message: string;

  @ApiProperty({
    example: '/api/users/123',
    description: 'Temporary location of the resource',
  })
  location: string;
}

/**
 * Default error response for unexpected errors
 */
export class DefaultErrorDto extends BaseErrorDto {
  @ApiProperty({ example: 500, description: 'HTTP status code' })
  declare statusCode: number;

  @ApiProperty({ example: 'An unexpected error occurred' })
  declare message: string;

  @ApiProperty({ example: 'Unknown Error' })
  declare error: string;
}
