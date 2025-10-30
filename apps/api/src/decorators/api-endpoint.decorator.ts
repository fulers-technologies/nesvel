import {
  applyDecorators,
  Type,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UseFilters,
  HttpCode,
  Header,
  SetMetadata,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Options,
  Head,
  All,
  PipeTransform,
  Redirect,
  Render,
  Version,
  Sse,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestErrorDto,
  UnauthorizedErrorDto,
  ForbiddenErrorDto,
  NotFoundErrorDto,
  ConflictErrorDto,
  UnprocessableEntityErrorDto,
  TooManyRequestsErrorDto,
  InternalServerErrorDto,
  BadGatewayErrorDto,
  ServiceUnavailableErrorDto,
  GatewayTimeoutErrorDto,
  AcceptedResponseDto,
  MovedPermanentlyDto,
  FoundDto,
  DefaultErrorDto,
} from '../dtos/error-responses.dto';
import {
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  ApiResponseOptions,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiQueryOptions,
  ApiBody,
  ApiBodyOptions,
  ApiHeader,
  ApiHeaderOptions,
  ApiBearerAuth,
  ApiSecurity,
  ApiConsumes,
  ApiProduces,
  ApiExtension,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiMovedPermanentlyResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiUnprocessableEntityResponse,
  ApiTooManyRequestsResponse,
  ApiBadGatewayResponse,
  ApiServiceUnavailableResponse,
  ApiGatewayTimeoutResponse,
  ApiDefaultResponse,
  ApiExcludeEndpoint,
  ApiTags,
  ApiCookieAuth,
  ApiBasicAuth,
  ApiOAuth2,
} from '@nestjs/swagger';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'ALL';

export type EndpointPreset =
  | 'crud.list'
  | 'crud.read'
  | 'crud.create'
  | 'crud.update'
  | 'crud.delete'
  | 'crud.patch'
  | 'health'
  | 'upload'
  | 'download';

export interface FileUploadOptions {
  fieldName?: string;
  maxCount?: number;
  fileFilter?: string[];
  limits?: {
    fileSize?: number;
    files?: number;
  };
}

export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface SecurityOptions {
  csp?: Record<string, string[]>;
  rateLimit?: {
    limit: number;
    ttl: number;
    skipIf?: string;
  };
  ipWhitelist?: string[];
  requireHttps?: boolean;
}

export interface CacheConfig {
  /** Enable caching for this endpoint */
  enabled?: boolean;

  /**
   * Cache key pattern. Supports dynamic parameters with {{param}} syntax.
   * If not specified, auto-generates as: {controller}:{method}:{path}
   *
   * @example
   * 'users:{{id}}'                    // Simple key with param
   * 'posts:{{postId}}:comments'      // Nested resource
   * 'search:{{query}}:{{page}}'      // Multiple params
   *
   * Auto-generated examples:
   * - GET /users/:id -> users:GET:{{id}}
   * - POST /posts/:postId/comments -> posts:POST:{{postId}}:comments
   */
  key?: string;

  /**
   * Time to live in seconds.
   * Defaults to 300 seconds (5 minutes) if not specified.
   */
  ttl?: number;
}

export interface ApiEndpointOptions<TBody = any> {
  preset?: EndpointPreset;
  method?: HttpMethod;
  path?: string | string[];

  // Disable all defaults if needed
  disableDefaults?: boolean;

  /**
   * OpenAPI documentation options.
   * Auto-generates operationId from method name + controller.
   * Auto-generates tags from controller name and operation type.
   * Auto-generates summary based on HTTP method and resource.
   */
  documentation?: ApiOperationOptions;
  auth?: {
    bearer?: boolean | string;
    apiKey?: boolean | string;
    cookie?: boolean | string;
    basic?: boolean | string;
    oauth2?: boolean | string[];
  };
  responses?: {
    ok?: ApiResponseOptions;
    created?: ApiResponseOptions;
    accepted?: ApiResponseOptions;
    noContent?: ApiResponseOptions;
    movedPermanently?: ApiResponseOptions;
    found?: ApiResponseOptions;
    badRequest?: string | ApiResponseOptions;
    unauthorized?: string | ApiResponseOptions;
    forbidden?: string | ApiResponseOptions;
    notFound?: string | ApiResponseOptions;
    conflict?: string | ApiResponseOptions;
    unprocessableEntity?: string | ApiResponseOptions;
    tooManyRequests?: string | ApiResponseOptions;
    internalError?: string | ApiResponseOptions;
    badGateway?: string | ApiResponseOptions;
    serviceUnavailable?: string | ApiResponseOptions;
    gatewayTimeout?: string | ApiResponseOptions;
    default?: ApiResponseOptions;
    custom?: Record<number, ApiResponseOptions>;
  };
  params?: ApiParamOptions[];
  queries?: ApiQueryOptions[];
  body?: ApiBodyOptions | Type<TBody>;
  file?: FileUploadOptions;
  files?: FileUploadOptions;
  headers?: ApiHeaderOptions[];
  consumes?: string[];
  produces?: string[];
  extensions?: Record<string, any>;
  httpCode?: number;
  responseHeaders?: Record<string, string>;
  guards?: Array<Type<any>>;
  pipes?: Array<Type<any> | PipeTransform>;
  interceptors?: Array<Type<any>>;
  filters?: Array<Type<any>>;
  metadata?: Record<string, any>;
  redirect?: { url: string; statusCode?: number };
  render?: string;
  version?: string | string[];
  sse?: boolean;
  exclude?: boolean;

  /**
   * Throttle configuration. Provide an empty object to enable with defaults.
   * Defaults: limit=100, ttl=60s
   */
  throttle?: { limit?: number; ttl?: number };
  cache?: CacheConfig;
  roles?: string[];
  cors?: CorsOptions;
  security?: SecurityOptions;
  telemetry?: {
    trace?: boolean;
    metrics?: boolean;
    spanName?: string;
  };
  featureFlag?: string;
  /**
   * Circuit breaker configuration. Provide an empty object to enable with defaults.
   * Defaults: threshold=5, timeout=3000ms
   */
  circuitBreaker?: {
    threshold?: number;
    timeout?: number;
  };
  /**
   * Retry policy configuration. Provide an empty object to enable with defaults.
   * Defaults: attempts=3, delay=1000ms
   */
  retry?: {
    attempts?: number;
    delay?: number;
  };
}

// Default configurations for standard REST API endpoints
const DEFAULT_CONSUMES = [
  'application/json',
  'application/x-www-form-urlencoded',
];

const DEFAULT_PRODUCES = ['application/json'];

// HTTP response headers (actual headers sent with response)
const DEFAULT_RESPONSE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// OpenAPI response headers (documented in Swagger)
const DEFAULT_API_RESPONSE_HEADERS = {
  'X-Request-ID': {
    description: 'Unique request identifier for tracing',
    schema: { type: 'string', format: 'uuid' },
  },
  'X-Response-Time': {
    description: 'Response time in milliseconds',
    schema: { type: 'integer' },
  },
  'X-RateLimit-Limit': {
    description: 'Request limit per time window',
    schema: { type: 'integer' },
  },
  'X-RateLimit-Remaining': {
    description: 'Remaining requests in current window',
    schema: { type: 'integer' },
  },
  'X-RateLimit-Reset': {
    description: 'Time when the rate limit resets (Unix timestamp)',
    schema: { type: 'integer' },
  },
};

// Default request headers (OpenAPI documentation)
const DEFAULT_REQUEST_HEADERS: ApiHeaderOptions[] = [
  {
    name: 'Accept-Language',
    description: 'Preferred language for response',
    required: false,
    example: 'en-US,en;q=0.9',
    schema: {
      type: 'string',
      pattern: '^[a-z]{2}(-[A-Z]{2})?(;q=\\d\\.\\d)?(,[a-z]{2}.*)?$',
    },
  },
  {
    name: 'X-Request-ID',
    description: 'Unique request identifier for tracing',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
    schema: { type: 'string', format: 'uuid' },
  },
  {
    name: 'X-Client-Version',
    description: 'Client application version',
    required: false,
    example: '2.5.0',
    schema: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
  },
];

// Default cache configuration
const DEFAULT_CACHE_TTL = 300; // 5 minutes

// Default CORS configuration (matches corsConfig defaults)
const DEFAULT_CORS: CorsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:5173']
      : [],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-KEY',
    'Accept',
    'Accept-Language',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
  ],
  credentials: true,
  maxAge: 3600, // 1 hour
};

// Default rate limit configuration (matches rateLimitConfig defaults)
const DEFAULT_RATE_LIMIT = {
  limit: 100,
  ttl: 60, // 60 seconds
};

// Default circuit breaker configuration
const DEFAULT_CIRCUIT_BREAKER = {
  threshold: 5, // Number of failures before opening circuit
  timeout: 3000, // Timeout in milliseconds
};

// Default retry policy configuration
const DEFAULT_RETRY_POLICY = {
  attempts: 3, // Number of retry attempts
  delay: 1000, // Delay between retries in milliseconds
};

// Default throttle configuration
const DEFAULT_THROTTLE = {
  limit: 100, // Maximum number of requests
  ttl: 60, // Time window in seconds
};

const DEFAULT_RESPONSES = {
  ok: {
    description: 'Request successful',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  created: {
    description: 'Resource created successfully',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  accepted: {
    description: 'Request accepted for processing',
    type: AcceptedResponseDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  noContent: {
    description: 'Request successful with no content to return',
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  movedPermanently: {
    description: 'Resource has been moved permanently',
    type: MovedPermanentlyDto,
    headers: {
      ...DEFAULT_API_RESPONSE_HEADERS,
      Location: {
        description: 'New location of the resource',
        schema: { type: 'string', format: 'uri' },
      },
    },
  },
  found: {
    description: 'Resource found at different location',
    type: FoundDto,
    headers: {
      ...DEFAULT_API_RESPONSE_HEADERS,
      Location: {
        description: 'Temporary location of the resource',
        schema: { type: 'string', format: 'uri' },
      },
    },
  },
  badRequest: {
    description: 'Invalid request data',
    type: BadRequestErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  unauthorized: {
    description: 'Authentication required',
    type: UnauthorizedErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  forbidden: {
    description: 'Insufficient permissions to access this resource',
    type: ForbiddenErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  notFound: {
    description: 'Resource not found',
    type: NotFoundErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  conflict: {
    description: 'Resource conflict or duplicate entry',
    type: ConflictErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  unprocessableEntity: {
    description: 'Validation failed for the provided data',
    type: UnprocessableEntityErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  tooManyRequests: {
    description: 'Rate limit exceeded, please try again later',
    type: TooManyRequestsErrorDto,
    headers: {
      ...DEFAULT_API_RESPONSE_HEADERS,
      'Retry-After': {
        description: 'Seconds to wait before retrying',
        schema: { type: 'integer' },
      },
    },
  },
  internalError: {
    description: 'Internal server error occurred',
    type: InternalServerErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  badGateway: {
    description: 'Bad gateway - upstream service error',
    type: BadGatewayErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  serviceUnavailable: {
    description: 'Service temporarily unavailable',
    type: ServiceUnavailableErrorDto,
    headers: {
      ...DEFAULT_API_RESPONSE_HEADERS,
      'Retry-After': {
        description: 'Seconds to wait before retrying',
        schema: { type: 'integer' },
      },
    },
  },
  gatewayTimeout: {
    description: 'Gateway timeout - upstream service timeout',
    type: GatewayTimeoutErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
  default: {
    description: 'Unexpected error response',
    type: DefaultErrorDto,
    headers: DEFAULT_API_RESPONSE_HEADERS,
  },
};

function applyPreset(preset: EndpointPreset): Partial<ApiEndpointOptions> {
  const presets: Record<EndpointPreset, Partial<ApiEndpointOptions>> = {
    'crud.list': {
      method: 'GET',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'List all items' },
      responses: {
        ok: { description: 'List retrieved successfully' },
        badRequest: 'Invalid query parameters',
        unauthorized: 'Unauthorized',
      },
    },
    'crud.read': {
      method: 'GET',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Get item by ID' },
      responses: {
        ok: { description: 'Item found' },
        notFound: 'Item not found',
        unauthorized: 'Unauthorized',
      },
    },
    'crud.create': {
      method: 'POST',
      httpCode: HttpStatus.CREATED,
      documentation: { summary: 'Create new item' },
      responses: {
        created: { description: 'Item created successfully' },
        badRequest: 'Invalid input data',
        conflict: 'Item already exists',
        unauthorized: 'Unauthorized',
      },
    },
    'crud.update': {
      method: 'PUT',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Update item' },
      responses: {
        ok: { description: 'Item updated successfully' },
        notFound: 'Item not found',
        badRequest: 'Invalid data',
        unauthorized: 'Unauthorized',
      },
    },
    'crud.delete': {
      method: 'DELETE',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Delete item' },
      responses: {
        ok: { description: 'Item deleted successfully' },
        notFound: 'Item not found',
        unauthorized: 'Unauthorized',
      },
    },
    'crud.patch': {
      method: 'PATCH',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Partially update item' },
      responses: {
        ok: { description: 'Item updated successfully' },
        notFound: 'Item not found',
        badRequest: 'Invalid update data',
        unauthorized: 'Unauthorized',
      },
    },
    health: {
      method: 'GET',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Health check' },
      responses: {
        ok: { description: 'Service is healthy' },
        serviceUnavailable: 'Service is unavailable',
      },
    },
    upload: {
      method: 'POST',
      httpCode: HttpStatus.CREATED,
      documentation: { summary: 'Upload file(s)' },
      consumes: ['multipart/form-data'],
      responses: {
        created: { description: 'File uploaded successfully' },
        badRequest: 'Invalid file',
        unauthorized: 'Unauthorized',
      },
    },
    download: {
      method: 'GET',
      httpCode: HttpStatus.OK,
      documentation: { summary: 'Download file' },
      produces: ['application/octet-stream'],
      responses: {
        ok: { description: 'File downloaded successfully' },
        notFound: 'File not found',
        unauthorized: 'Unauthorized',
      },
    },
  };

  return presets[preset] || {};
}

export function ApiEndpoint<TBody = any>(
  options: ApiEndpointOptions<TBody>,
): MethodDecorator;
export function ApiEndpoint<TBody = any>(
  path: string | string[],
  options: Omit<ApiEndpointOptions<TBody>, 'path'>,
): MethodDecorator;
export function ApiEndpoint<TBody = any>(
  pathOrOptions?: string | string[] | ApiEndpointOptions<TBody>,
  maybeOptions?: Omit<ApiEndpointOptions<TBody>, 'path'>,
) {
  let options: ApiEndpointOptions<TBody>;

  if (!pathOrOptions) {
    options = maybeOptions!;
  } else if (
    typeof pathOrOptions === 'string' ||
    Array.isArray(pathOrOptions)
  ) {
    options = { ...maybeOptions!, path: pathOrOptions };
  } else {
    options = pathOrOptions;
  }

  // Apply defaults first (unless disabled)
  if (!options.disableDefaults) {
    options = {
      consumes: DEFAULT_CONSUMES,
      produces: DEFAULT_PRODUCES,
      responseHeaders: DEFAULT_RESPONSE_HEADERS,
      ...options, // User options override defaults
      // Merge request headers (append user headers to defaults)
      headers: [...DEFAULT_REQUEST_HEADERS, ...(options.headers || [])],
      // Merge responses instead of replacing
      responses: {
        ...DEFAULT_RESPONSES,
        ...options.responses,
      },
    };
  }

  // Apply default cache settings if cache is enabled
  if (options.cache?.enabled) {
    // Default TTL if not specified
    if (!options.cache.ttl) {
      options.cache.ttl = DEFAULT_CACHE_TTL;
    }

    // Generate default cache key if not specified
    if (!options.cache.key) {
      const method = options.method || 'GET';
      const path =
        typeof options.path === 'string'
          ? options.path
          : Array.isArray(options.path)
            ? options.path[0]
            : '';

      // Extract controller name from the path or use 'api'
      const pathSegments = path.split('/').filter(Boolean);
      const controller = pathSegments[0] || 'api';

      // Generate key pattern: controller:method:path with placeholders for params
      // Example: users:GET:/users/:id -> users:GET:{{id}}
      const keyPath = path
        .split('/')
        .map((segment) => {
          // Convert :param to {{param}} for dynamic replacement
          if (segment.startsWith(':')) {
            return `{{${segment.slice(1)}}}`;
          }
          return segment;
        })
        .filter(Boolean)
        .join(':');

      options.cache.key = `${controller}:${method}:${keyPath || 'root'}`;
    }
  }

  // Apply default CORS if not disabled
  if (options.cors && !options.disableDefaults) {
    options.cors = {
      ...DEFAULT_CORS,
      ...options.cors,
    };
  }

  // Apply default rate limit if specified
  if (options.security?.rateLimit && !options.disableDefaults) {
    options.security.rateLimit = {
      ...DEFAULT_RATE_LIMIT,
      ...options.security.rateLimit,
    };
  }

  // Apply default circuit breaker if enabled
  if (options.circuitBreaker && !options.disableDefaults) {
    options.circuitBreaker = {
      ...DEFAULT_CIRCUIT_BREAKER,
      ...options.circuitBreaker,
    };
  }

  // Apply default retry policy if enabled
  if (options.retry && !options.disableDefaults) {
    options.retry = {
      ...DEFAULT_RETRY_POLICY,
      ...options.retry,
    };
  }

  // Apply default throttle if enabled
  if (options.throttle && !options.disableDefaults) {
    options.throttle = {
      ...DEFAULT_THROTTLE,
      ...options.throttle,
    };
  }

  // Apply preset if specified
  if (options.preset) {
    const presetConfig = applyPreset(options.preset);
    options = { ...presetConfig, ...options };
  }

  // Auto-generate documentation if not provided
  if (!options.documentation) {
    options.documentation = {};
  }

  // Auto-generate operationId: methodName + ControllerName
  // This will be enhanced by the decorator context in NestJS 10+
  if (!options.documentation.operationId) {
    const method = options.method || 'GET';
    const path =
      typeof options.path === 'string'
        ? options.path
        : Array.isArray(options.path)
          ? options.path[0]
          : '';
    const pathSegments = path.split('/').filter(Boolean);
    const controller = pathSegments[0] || 'api';

    // Generate: getUsers, createUser, updateUserById, etc.
    const action = method.toLowerCase();
    const resource = controller
      .split('-')
      .map((word, idx) =>
        idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join('');

    options.documentation.operationId = `${action}${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
  }

  // Auto-generate tags from controller and method if not provided
  if (!options.documentation.tags || options.documentation.tags.length === 0) {
    const path =
      typeof options.path === 'string'
        ? options.path
        : Array.isArray(options.path)
          ? options.path[0]
          : '';
    const pathSegments = path.split('/').filter(Boolean);
    const controller = pathSegments[0] || 'api';

    // Generate tags: ['users'] or ['users', 'nested-resources'] for nested paths
    const tags = [controller];

    // Add operation type tag if using preset
    if (options.preset) {
      const presetParts = options.preset.split('.');
      if (presetParts.length > 1) {
        tags.push(presetParts[0]); // e.g., 'crud', 'health', 'upload'
      }
    }

    options.documentation.tags = tags;
  }

  // Ensure summary exists
  if (!options.documentation.summary) {
    const method = options.method || 'GET';
    const path =
      typeof options.path === 'string'
        ? options.path
        : Array.isArray(options.path)
          ? options.path[0]
          : '';
    const pathSegments = path.split('/').filter(Boolean);
    const resource = pathSegments[0] || 'resource';

    // Generate meaningful summary based on method
    const summaryMap: Record<string, string> = {
      GET: `Get ${resource}`,
      POST: `Create ${resource}`,
      PUT: `Update ${resource}`,
      PATCH: `Partially update ${resource}`,
      DELETE: `Delete ${resource}`,
      OPTIONS: `Get ${resource} options`,
      HEAD: `Get ${resource} headers`,
    };

    options.documentation.summary =
      summaryMap[method] || `${method} ${resource}`;
  }

  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];

  if (options.method) {
    const path = options.path || '';
    switch (options.method) {
      case 'GET':
        decorators.push(Get(path));
        break;
      case 'POST':
        decorators.push(Post(path));
        break;
      case 'PUT':
        decorators.push(Put(path));
        break;
      case 'PATCH':
        decorators.push(Patch(path));
        break;
      case 'DELETE':
        decorators.push(Delete(path));
        break;
      case 'OPTIONS':
        decorators.push(Options(path));
        break;
      case 'HEAD':
        decorators.push(Head(path));
        break;
      case 'ALL':
        decorators.push(All(path));
        break;
    }
  }

  if (options.exclude) {
    decorators.push(ApiExcludeEndpoint());
  }

  if (options.sse) {
    decorators.push(Sse());
  }

  if (options.version) {
    decorators.push(Version(options.version));
  }

  if (options.redirect) {
    decorators.push(
      Redirect(options.redirect.url, options.redirect.statusCode),
    );
  }

  if (options.render) {
    decorators.push(Render(options.render));
  }

  decorators.push(ApiOperation(options.documentation));

  if (options.httpCode !== undefined) {
    decorators.push(HttpCode(options.httpCode));
  }

  if (options.responseHeaders) {
    Object.entries(options.responseHeaders).forEach(([key, value]) => {
      decorators.push(Header(key, value));
    });
  }

  if (options.guards && options.guards.length > 0) {
    decorators.push(UseGuards(...options.guards));
  }

  if (options.pipes && options.pipes.length > 0) {
    decorators.push(UsePipes(...options.pipes));
  }

  if (options.interceptors && options.interceptors.length > 0) {
    decorators.push(UseInterceptors(...options.interceptors));
  }

  if (options.filters && options.filters.length > 0) {
    decorators.push(UseFilters(...options.filters));
  }

  if (options.metadata) {
    Object.entries(options.metadata).forEach(([key, value]) => {
      decorators.push(SetMetadata(key, value));
    });
  }

  if (options.throttle) {
    if (
      options.throttle.limit !== undefined ||
      options.throttle.ttl !== undefined
    ) {
      decorators.push(
        SetMetadata('throttle', {
          limit: options.throttle.limit,
          ttl: options.throttle.ttl,
        }),
      );
    }
  }

  if (options.cache) {
    // Enable cache interceptor if explicitly enabled or if key/ttl provided
    if (options.cache.enabled !== false) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      decorators.push(UseInterceptors(CacheInterceptor));
    }

    // Set cache key
    if (options.cache.key) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      decorators.push(CacheKey(options.cache.key) as MethodDecorator);
    }

    // Set cache TTL
    if (options.cache.ttl !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      decorators.push(CacheTTL(options.cache.ttl) as MethodDecorator);
    }
  }

  if (options.roles && options.roles.length > 0) {
    decorators.push(SetMetadata('roles', options.roles));
  }

  if (options.cors) {
    decorators.push(SetMetadata('cors', options.cors));
  }

  if (options.security) {
    if (options.security.csp) {
      decorators.push(SetMetadata('csp', options.security.csp));
    }
    if (options.security.rateLimit) {
      decorators.push(SetMetadata('rateLimit', options.security.rateLimit));
    }
    if (options.security.ipWhitelist) {
      decorators.push(SetMetadata('ipWhitelist', options.security.ipWhitelist));
    }
    if (options.security.requireHttps) {
      decorators.push(SetMetadata('requireHttps', true));
    }
  }

  if (options.telemetry) {
    decorators.push(SetMetadata('telemetry', options.telemetry));
  }

  if (options.featureFlag) {
    decorators.push(SetMetadata('featureFlag', options.featureFlag));
  }

  if (options.circuitBreaker) {
    decorators.push(SetMetadata('circuitBreaker', options.circuitBreaker));
  }

  if (options.retry) {
    decorators.push(SetMetadata('retry', options.retry));
  }

  if (options.auth?.bearer) {
    const bearerName =
      typeof options.auth.bearer === 'string'
        ? options.auth.bearer
        : 'JWT-auth';
    decorators.push(ApiBearerAuth(bearerName));
  }

  if (options.auth?.apiKey) {
    const apiKeyName =
      typeof options.auth.apiKey === 'string' ? options.auth.apiKey : 'api-key';
    decorators.push(ApiSecurity(apiKeyName));
  }

  if (options.auth?.cookie) {
    const cookieName =
      typeof options.auth.cookie === 'string'
        ? options.auth.cookie
        : 'cookie-auth';
    decorators.push(ApiCookieAuth(cookieName));
  }

  if (options.auth?.basic) {
    const basicName =
      typeof options.auth.basic === 'string' ? options.auth.basic : 'basic';
    decorators.push(ApiBasicAuth(basicName));
  }

  if (options.auth?.oauth2) {
    const scopes = Array.isArray(options.auth.oauth2)
      ? options.auth.oauth2
      : [];
    decorators.push(ApiOAuth2(scopes));
  }

  if (options.responses) {
    const { responses } = options;

    if (responses.ok) {
      // Merge default headers with user-provided headers
      const config = {
        ...responses.ok,
        headers: {
          ...DEFAULT_API_RESPONSE_HEADERS,
          ...responses.ok.headers,
        },
      };
      decorators.push(ApiOkResponse(config));
    }

    if (responses.created) {
      const config = {
        ...responses.created,
        headers: {
          ...DEFAULT_API_RESPONSE_HEADERS,
          ...responses.created.headers,
        },
      };
      decorators.push(ApiCreatedResponse(config));
    }

    if (responses.accepted) {
      const config = {
        ...responses.accepted,
        headers: {
          ...DEFAULT_API_RESPONSE_HEADERS,
          ...responses.accepted.headers,
        },
      };
      decorators.push(ApiAcceptedResponse(config));
    }

    if (responses.noContent) {
      const config = {
        ...responses.noContent,
        headers: {
          ...DEFAULT_API_RESPONSE_HEADERS,
          ...responses.noContent.headers,
        },
      };
      decorators.push(ApiNoContentResponse(config));
    }

    if (responses.movedPermanently) {
      decorators.push(ApiMovedPermanentlyResponse(responses.movedPermanently));
    }

    if (responses.found) {
      decorators.push(ApiFoundResponse(responses.found));
    }

    if (responses.badRequest) {
      const config =
        typeof responses.badRequest === 'string'
          ? { description: responses.badRequest }
          : responses.badRequest;
      decorators.push(ApiBadRequestResponse(config));
    }

    if (responses.unauthorized) {
      const config =
        typeof responses.unauthorized === 'string'
          ? { description: responses.unauthorized }
          : responses.unauthorized;
      decorators.push(ApiUnauthorizedResponse(config));
    }

    if (responses.forbidden) {
      const config =
        typeof responses.forbidden === 'string'
          ? { description: responses.forbidden }
          : responses.forbidden;
      decorators.push(ApiForbiddenResponse(config));
    }

    if (responses.notFound) {
      const config =
        typeof responses.notFound === 'string'
          ? { description: responses.notFound }
          : responses.notFound;
      decorators.push(ApiNotFoundResponse(config));
    }

    if (responses.conflict) {
      const config =
        typeof responses.conflict === 'string'
          ? { description: responses.conflict }
          : responses.conflict;
      decorators.push(ApiConflictResponse(config));
    }

    if (responses.tooManyRequests) {
      const config =
        typeof responses.tooManyRequests === 'string'
          ? { description: responses.tooManyRequests }
          : responses.tooManyRequests;
      decorators.push(ApiTooManyRequestsResponse(config));
    }

    if (responses.unprocessableEntity) {
      const config =
        typeof responses.unprocessableEntity === 'string'
          ? { description: responses.unprocessableEntity }
          : responses.unprocessableEntity;
      decorators.push(ApiUnprocessableEntityResponse(config));
    }

    if (responses.internalError) {
      const config =
        typeof responses.internalError === 'string'
          ? { description: responses.internalError }
          : responses.internalError;
      decorators.push(ApiInternalServerErrorResponse(config));
    }

    if (responses.badGateway) {
      const config =
        typeof responses.badGateway === 'string'
          ? { description: responses.badGateway }
          : responses.badGateway;
      decorators.push(ApiBadGatewayResponse(config));
    }

    if (responses.serviceUnavailable) {
      const config =
        typeof responses.serviceUnavailable === 'string'
          ? { description: responses.serviceUnavailable }
          : responses.serviceUnavailable;
      decorators.push(ApiServiceUnavailableResponse(config));
    }

    if (responses.gatewayTimeout) {
      const config =
        typeof responses.gatewayTimeout === 'string'
          ? { description: responses.gatewayTimeout }
          : responses.gatewayTimeout;
      decorators.push(ApiGatewayTimeoutResponse(config));
    }

    if (responses.default) {
      decorators.push(ApiDefaultResponse(responses.default));
    }

    if (responses.custom) {
      Object.entries(responses.custom).forEach(([statusCode, config]) => {
        decorators.push(ApiResponse({ status: Number(statusCode), ...config }));
      });
    }
  }

  if (options.params) {
    options.params.forEach((param) => {
      decorators.push(ApiParam(param));
    });
  }

  if (options.queries) {
    options.queries.forEach((query) => {
      decorators.push(ApiQuery(query));
    });
  }

  if (options.body) {
    if (typeof options.body === 'function') {
      decorators.push(ApiBody({ type: options.body }));
    } else {
      decorators.push(ApiBody(options.body));
    }
  }

  if (options.file) {
    decorators.push(SetMetadata('file', options.file));
    decorators.push(
      ApiBody({
        description: 'File upload',
        schema: {
          type: 'object',
          properties: {
            [options.file.fieldName || 'file']: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      }),
    );
  }

  if (options.files) {
    decorators.push(SetMetadata('files', options.files));
    decorators.push(
      ApiBody({
        description: 'Multiple files upload',
        schema: {
          type: 'object',
          properties: {
            [options.files.fieldName || 'files']: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      }),
    );
  }

  if (options.headers) {
    options.headers.forEach((header) => {
      decorators.push(ApiHeader(header));
    });
  }

  if (options.consumes) {
    decorators.push(ApiConsumes(...options.consumes));
  }

  if (options.produces) {
    decorators.push(ApiProduces(...options.produces));
  }

  if (options.extensions) {
    Object.entries(options.extensions).forEach(([key, value]) => {
      decorators.push(ApiExtension(key, value));
    });
  }

  // Apply tags (auto-generated or custom)
  if (options.documentation?.tags && options.documentation.tags.length > 0) {
    decorators.push(ApiTags(...options.documentation.tags));
  }

  return applyDecorators(...decorators);
}
