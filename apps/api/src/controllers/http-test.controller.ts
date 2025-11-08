import { Controller, Get, Post, Put, Delete, Patch, Body, Query, Param } from '@nestjs/common';
import {
  HttpClient,
  Pool,
  ResponseSequence,
  Request,
  Response,
  JsonResponse,
  Req,
  Res,
} from '@nesvel/nestjs-http';
import type { PoolRequest } from '@nesvel/nestjs-http';

/**
 * HTTP Test Controller
 *
 * Comprehensive controller demonstrating all features of the @nesvel/nestjs-http package.
 * This includes HTTP client requests, concurrent pools, response handling, request helpers,
 * JSON responses, and error handling.
 *
 * @controller http-test
 */
@Controller('http-test')
export class HttpTestController {
  /**
   * Test basic GET request with HttpClient
   *
   * Demonstrates:
   * - Basic GET request
   * - Response status checks
   * - JSON data extraction
   * - Error handling with throw()
   *
   * @route GET /http-test/client/basic
   * @returns JSON response with fetched data
   */
  @Get('client/basic')
  async testBasicClient(@Res() res: Response) {
    // Make a simple GET request
    const response = await HttpClient.get('https://jsonplaceholder.typicode.com/posts/1');

    // Check if successful (2xx status)
    if (response.successful()) {
      return JsonResponse.ok(
        {
          status: response.status(),
          data: response.json(),
          headers: response.headers(),
        },
        res
      );
    }

    // Throw error if failed
    response.throw();
  }

  /**
   * Test POST request with authentication and custom headers
   *
   * Demonstrates:
   * - POST with JSON body
   * - Bearer token authentication
   * - Custom headers
   * - Timeout configuration
   * - Fluent API chaining
   *
   * @route POST /http-test/client/authenticated
   * @returns Created resource response
   */
  @Post('client/authenticated')
  async testAuthenticatedPost(@Body() data: any, @Res() res: Response) {
    const response = await HttpClient.withToken('fake-bearer-token')
      .withHeaders({
        'X-Custom-Header': 'test-value',
        'X-Request-ID': crypto.randomUUID(),
      })
      .timeout(10) // 10 seconds
      .acceptJson()
      .post('https://jsonplaceholder.typicode.com/posts', data);

    // Use status-specific checks
    if (response.created()) {
      return JsonResponse.created(
        {
          message: 'Resource created',
          data: response.json(),
          location: response.header('Location'),
        },
        res
      );
    }

    return JsonResponse.badRequest({ error: 'Failed to create resource' }, res);
  }

  /**
   * Test PUT request with retry logic
   *
   * Demonstrates:
   * - PUT request for updates
   * - Retry configuration with exponential backoff
   * - Response status code checks
   * - Dot notation for nested data
   *
   * @route PUT /http-test/client/retry/:id
   * @returns Updated resource
   */
  @Put('client/retry/:id')
  async testRetryPut(@Param('id') id: string, @Body() data: any, @Res() res: Response) {
    const response = await HttpClient.retry(3, 100) // 3 retries, 100ms delay
      .retryWhen((attempt, exception) => {
        // Custom retry logic - retry on 5xx errors
        return exception.isServerError() && attempt < 3;
      })
      .put(`https://jsonplaceholder.typicode.com/posts/${id}`, data);

    if (response.ok()) {
      return JsonResponse.ok(
        {
          id: response.json('id'),
          title: response.json('title'), // Dot notation support
          body: response.json('body'),
        },
        res
      );
    }

    return JsonResponse.serverError({ error: 'Update failed after retries' }, res);
  }

  /**
   * Test PATCH request with query parameters
   *
   * Demonstrates:
   * - PATCH for partial updates
   * - Query parameter handling
   * - Base URL configuration
   * - Response body methods
   *
   * @route PATCH /http-test/client/patch/:id
   * @returns Patched resource
   */
  @Patch('client/patch/:id')
  async testPatch(
    @Param('id') id: string,
    @Body() data: any,
    @Query() query: any,
    @Res() res: Response
  ) {
    const response = await HttpClient.baseUrl('https://jsonplaceholder.typicode.com')
      .withQueryParameters(query)
      .patch(`/posts/${id}`, data);

    return JsonResponse.ok(
      {
        updated: response.successful(),
        data: response.object(), // Get as plain object
        rawBody: response.body(), // Raw response body
      },
      res
    );
  }

  /**
   * Test DELETE request with authorization
   *
   * Demonstrates:
   * - DELETE requests
   * - Basic authentication
   * - Status code specific checks
   * - No content responses
   *
   * @route DELETE /http-test/client/delete/:id
   * @returns No content or error
   */
  @Delete('client/delete/:id')
  async testDelete(@Param('id') id: string, @Res() res: Response) {
    const response = await HttpClient.withBasicAuth('username', 'password').delete(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );

    if (response.noContent() || response.ok()) {
      return JsonResponse.noContent(res);
    }

    if (response.notFound()) {
      return JsonResponse.notFound({ error: 'Resource not found' }, res);
    }

    return JsonResponse.serverError({ error: 'Delete failed' }, res);
  }

  /**
   * Test concurrent requests with Pool
   * TODO: Implement PoolResult helper methods (successful, status, json, failed)
   *
   * Demonstrates:
   * - Pool for concurrent requests
   * - Multiple HTTP methods in parallel
   * - Result aggregation
   * - Error handling for individual requests
   *
   * @route GET /http-test/client/concurrent
   * @returns Aggregated results from multiple requests
   */
  // @Get('client/concurrent')
  async testConcurrentPool(@Res() res: Response) {
    return JsonResponse.ok({ message: 'TODO: Implement PoolResult helper methods' }, res);
    /*
    // Define multiple requests to execute concurrently
    const requests: PoolRequest[] = [
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      },
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
      },
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/comments',
        config: {
          params: { postId: 1 },
        },
      },
    ];

    // Execute all requests concurrently
    const results = await Pool.send(requests);

    // Process results
    const responses = results.map((response, index) => ({
      request: index + 1,
      successful: response.successful(),
      status: response.status(),
      dataCount: Array.isArray(response.json()) ? response.json().length : 1,
      hasError: response.failed(),
    }));

    return JsonResponse.ok(
      {
        totalRequests: requests.length,
        responses,
        allSuccessful: results.every((r) => r.successful()),
      },
      res
    );
    */
  }

  /**
   * Test Pool with fluent builder
   * TODO: Implement Pool.as() method for named requests
   *
   * Demonstrates:
   * - Pool fluent API
   * - Request configuration
   * - Named requests
   * - Batch processing
   *
   * @route GET /http-test/client/pool-builder
   * @returns Results from pool builder
   */
  // @Get('client/pool-builder')
  async testPoolBuilder(@Res() res: Response) {
    return JsonResponse.ok({ message: 'TODO: Implement Pool.as() method' }, res);
    /*
    const results = await Pool.as('posts')
      .get('https://jsonplaceholder.typicode.com/posts/1')
      .as('users')
      .get('https://jsonplaceholder.typicode.com/users/1')
      .as('comments')
      .get('https://jsonplaceholder.typicode.com/comments', {
        params: { postId: 1, _limit: 5 },
      })
      .send();

    return JsonResponse.ok(
      {
        post: results[0].json(),
        user: results[1].json(),
        comments: results[2].array(), // Get as array
      },
      res
    );
    */
  }

  /**
   * Test multipart file upload simulation
   *
   * Demonstrates:
   * - Multipart form data
   * - File attachments
   * - Mixed form fields
   * - Content type handling
   *
   * @route POST /http-test/client/upload
   * @returns Upload response
   */
  @Post('client/upload')
  async testFileUpload(@Body() data: any, @Res() res: Response) {
    // Simulate file upload with multipart
    const response = await HttpClient.asMultipart()
      .attach('file', Buffer.from('fake file content'), 'test.txt')
      .attach('image', Buffer.from('fake image'), 'image.png', 'image/png')
      .withBody({
        title: data.title || 'Test Upload',
        description: data.description || 'File upload test',
      })
      .post('https://jsonplaceholder.typicode.com/posts');

    return JsonResponse.ok(
      {
        uploaded: response.successful(),
        response: response.json(),
      },
      res
    );
  }

  /**
   * Test form URL encoded submission
   *
   * Demonstrates:
   * - Form URL encoded content type
   * - Form data submission
   * - Content negotiation
   *
   * @route POST /http-test/client/form
   * @returns Form submission response
   */
  @Post('client/form')
  async testFormSubmission(@Body() formData: any, @Res() res: Response) {
    const response = await HttpClient.asForm()
      .withBody(formData)
      .contentType('application/x-www-form-urlencoded')
      .post('https://jsonplaceholder.typicode.com/posts');

    return JsonResponse.ok(
      {
        submitted: response.successful(),
        data: response.json(),
      },
      res
    );
  }

  /**
   * Test response sequence for testing
   * TODO: Implement ResponseSequence.create() method
   *
   * Demonstrates:
   * - ResponseSequence for predictable test responses
   * - Sequential response handling
   * - Status code simulation
   * - Testing utilities
   *
   * @route GET /http-test/client/sequence
   * @returns Sequence test results
   */
  // @Get('client/sequence')
  async testResponseSequence(@Res() res: Response) {
    return JsonResponse.ok({ message: 'TODO: Implement ResponseSequence.create()' }, res);
    /*
    // Create a sequence of test responses
    const sequence = ResponseSequence.create()
      .pushOk({ message: 'First response' })
      .pushCreated({ id: 1, message: 'Second response' })
      .pushBadRequest({ error: 'Third response - error' })
      .repeat(2); // Repeat last response twice

    const results = [];

    // Consume the sequence
    while (!sequence.isEmpty()) {
      const response = sequence.next();
      results.push({
        status: response.status(),
        successful: response.successful(),
        data: response.json(),
      });
    }

    return JsonResponse.ok(
      {
        totalResponses: results.length,
        responses: results,
      },
      res
    );
    */
  }

  /**
   * Test Request helpers - input methods
   *
   * Demonstrates:
   * - Enhanced Request with Laravel-style helpers
   * - input() with default values
   * - only() for whitelisting fields
   * - except() for blacklisting fields
   * - has() and filled() checks
   *
   * @route POST /http-test/request/input
   * @returns Processed input data
   */
  @Post('request/input')
  async testRequestInput(@Req() req: Request, @Res() res: Response) {
    // Get specific input with default
    const page = req.input('page', 1);
    const limit = req.input('limit', 10);

    // Get only specified fields
    const userData = req.only('name', 'email', 'age');

    // Get all except specified fields
    const safeData = req.except('password', 'ssn', 'creditCard');

    // Check if fields exist
    const hasEmail = req.has('email');
    const hasPhone = req.has('phone');

    // Check if fields are filled (not empty/null/undefined)
    const emailFilled = req.filled('email');
    const bioFilled = req.filled('bio');

    return JsonResponse.ok(
      {
        pagination: { page, limit },
        userData,
        safeData,
        checks: {
          hasEmail,
          hasPhone,
          emailFilled,
          bioFilled,
        },
      },
      res
    );
  }

  /**
   * Test Request helpers - conditional methods
   *
   * Demonstrates:
   * - whenHas() conditional execution
   * - whenFilled() conditional execution
   * - Callback-based input processing
   *
   * @route POST /http-test/request/conditional
   * @returns Conditionally processed data
   */
  @Post('request/conditional')
  async testRequestConditional(@Req() req: Request, @Res() res: Response) {
    const result: any = {};

    // Execute callback if field exists
    req.whenHas('email', (email) => {
      result.email = email;
      result.emailProvided = true;
    });

    // Execute callback if field is filled
    req.whenFilled('bio', (bio) => {
      result.bio = bio;
      result.bioLength = bio.length;
    });

    // Multiple conditional checks
    req.whenHas(['name', 'age'], (values) => {
      result.profile = values;
    });

    return JsonResponse.ok(result, res);
  }

  /**
   * Test Request helpers - content negotiation
   *
   * Demonstrates:
   * - expectsJson() check
   * - acceptsJson() check
   * - acceptsHtml() check
   * - Content-Type and Accept header parsing
   *
   * @route GET /http-test/request/negotiation
   * @returns Content negotiation results
   */
  @Get('request/negotiation')
  async testContentNegotiation(@Req() req: Request, @Res() res: Response) {
    return JsonResponse.ok(
      {
        expectsJson: req.expectsJson(),
        acceptsJson: req.acceptsJson(),
        acceptsHtml: req.acceptsHtml(),
        isAjax: req.isAjax(),
        isPjax: req.isPjax(),
        isPrefetch: req.isPrefetch(),
      },
      res
    );
  }

  /**
   * Test Request helpers - URL methods
   *
   * Demonstrates:
   * - fullUrl() complete URL with protocol
   * - fullUrlWithQuery() with additional query params
   * - bearerToken() extraction
   *
   * @route GET /http-test/request/url
   * @returns URL information
   */
  @Get('request/url')
  async testRequestUrl(@Req() req: Request, @Res() res: Response) {
    return JsonResponse.ok(
      {
        fullUrl: req.fullUrl(),
        fullUrlWithExtra: req.fullUrlWithQuery({ extra: 'param' }),
        bearerToken: req.bearerToken(),
        method: req.method,
        path: req.path,
      },
      res
    );
  }

  /**
   * Test Response helpers - fluent API
   *
   * Demonstrates:
   * - Fluent response building
   * - Custom headers
   * - Status codes
   * - Cookie management
   *
   * @route GET /http-test/response/fluent
   * @returns Fluent response
   */
  @Get('response/fluent')
  async testFluentResponse(@Res() res: Response) {
    return res
      .status(200)
      .header('X-Custom-Header', 'test-value')
      .headers({
        'X-Request-ID': crypto.randomUUID(),
        'X-API-Version': '1.0',
      })
      .cookie('session', 'abc123', {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      })
      .json({
        message: 'Fluent response example',
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Test Response helpers - caching
   *
   * Demonstrates:
   * - cache() helper for Cache-Control
   * - noCache() helper
   * - Cache header configuration
   *
   * @route GET /http-test/response/cache
   * @returns Cached response
   */
  @Get('response/cache')
  async testResponseCache(@Res() res: Response, @Query('no_cache') noCache?: string) {
    if (noCache) {
      return res.noCache().json({ message: 'Not cached', timestamp: new Date().toISOString() });
    }

    return res
      .cache(3600)
      .json({ message: 'Cached for 1 hour', timestamp: new Date().toISOString() });
  }

  /**
   * Test Response helpers - redirects
   *
   * Demonstrates:
   * - redirect() method
   * - Status code control
   *
   * @route GET /http-test/response/redirect
   * @returns Redirect response
   */
  @Get('response/redirect')
  async testRedirect(@Res() res: Response, @Query('code') code?: string) {
    const statusCode = code ? parseInt(code, 10) : 302;
    return res.redirect('/http-test/request/url', statusCode);
  }

  /**
   * Test JsonResponse helpers - success responses
   *
   * Demonstrates:
   * - JsonResponse.ok()
   * - JsonResponse.created()
   * - JsonResponse.accepted()
   * - JsonResponse.noContent()
   *
   * @route GET /http-test/json/success
   * @returns Various success responses based on query
   */
  @Get('json/success')
  async testJsonSuccess(@Res() res: Response, @Query('type') type?: string) {
    switch (type) {
      case 'created':
        return JsonResponse.created({ id: 1, message: 'Resource created' }, res, '/resources/1');

      case 'accepted':
        return JsonResponse.accepted({ message: 'Request accepted for processing' }, res);

      case 'no-content':
        return JsonResponse.noContent(res);

      default:
        return JsonResponse.ok({ message: 'Success response' }, res);
    }
  }

  /**
   * Test JsonResponse helpers - error responses
   *
   * Demonstrates:
   * - JsonResponse.badRequest()
   * - JsonResponse.unauthorized()
   * - JsonResponse.forbidden()
   * - JsonResponse.notFound()
   * - JsonResponse.serverError()
   *
   * @route GET /http-test/json/error
   * @returns Various error responses based on query
   */
  @Get('json/error')
  async testJsonError(@Res() res: Response, @Query('type') type?: string) {
    switch (type) {
      case 'bad-request':
        return JsonResponse.badRequest({ error: 'Invalid request parameters' }, res);

      case 'unauthorized':
        return JsonResponse.unauthorized({ error: 'Authentication required' }, res);

      case 'forbidden':
        return JsonResponse.forbidden({ error: 'Access denied' }, res);

      case 'not-found':
        return JsonResponse.notFound({ error: 'Resource not found' }, res);

      case 'server-error':
        return JsonResponse.serverError({ error: 'Internal server error' }, res);

      default:
        return JsonResponse.custom({ error: "I'm a teapot" }, 418, res);
    }
  }

  /**
   * Test error handling with exceptions
   *
   * Demonstrates:
   * - RequestException handling
   * - Error response analysis
   * - Status code checking
   * - Error categorization
   *
   * @route GET /http-test/client/error-handling
   * @returns Error handling results
   */
  @Get('client/error-handling')
  async testErrorHandling(@Res() res: Response) {
    try {
      // Try to access a non-existent resource
      const response = await HttpClient.get('https://jsonplaceholder.typicode.com/posts/99999');

      // Check for various error conditions
      if (response.clientError()) {
        return JsonResponse.ok(
          {
            errorType: 'client',
            status: response.status(),
            notFound: response.notFound(),
            message: 'Client error detected',
          },
          res
        );
      }

      return JsonResponse.ok(response.json(), res);
    } catch (error: any) {
      // Handle exception
      return JsonResponse.serverError(
        {
          error: 'Request failed',
          message: error.message,
          type: error.constructor.name,
        },
        res
      );
    }
  }

  /**
   * Test timeout and retry with error handling
   *
   * Demonstrates:
   * - Timeout configuration
   * - TimeoutException handling
   * - Retry logic with failures
   * - Error recovery
   *
   * @route GET /http-test/client/timeout
   * @returns Timeout test results
   */
  @Get('client/timeout')
  async testTimeout(@Res() res: Response) {
    try {
      // Very short timeout to force timeout error
      const response = await HttpClient.timeout(0.001) // 1ms timeout
        .retry(2, 50)
        .get('https://jsonplaceholder.typicode.com/posts');

      return JsonResponse.ok(response.json(), res);
    } catch (error: any) {
      return JsonResponse.serverError(
        {
          error: 'Request timed out',
          message: error.message,
          isTimeout: error.name === 'TimeoutException',
        },
        res
      );
    }
  }

  /**
   * Test all HTTP methods
   *
   * Demonstrates:
   * - GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
   * - Method-specific handling
   * - Response comparison
   *
   * @route GET /http-test/client/all-methods
   * @returns Results from all HTTP methods
   */
  @Get('client/all-methods')
  async testAllMethods(@Res() res: Response) {
    const baseUrl = 'https://jsonplaceholder.typicode.com/posts/1';

    // Execute all HTTP methods
    const results = {
      get: await HttpClient.get(baseUrl).then((r) => ({
        status: r.status(),
        successful: r.successful(),
      })),
      post: await HttpClient.post('https://jsonplaceholder.typicode.com/posts', {
        title: 'Test',
        body: 'Content',
      }).then((r) => ({ status: r.status(), successful: r.successful() })),
      put: await HttpClient.put(baseUrl, { title: 'Updated' }).then((r) => ({
        status: r.status(),
        successful: r.successful(),
      })),
      patch: await HttpClient.patch(baseUrl, { title: 'Patched' }).then((r) => ({
        status: r.status(),
        successful: r.successful(),
      })),
      delete: await HttpClient.delete(baseUrl).then((r) => ({
        status: r.status(),
        successful: r.successful(),
      })),
      head: await HttpClient.head(baseUrl).then((r) => ({
        status: r.status(),
        successful: r.successful(),
        hasBody: r.body().length > 0,
      })),
      options: await HttpClient.options(baseUrl).then((r) => ({
        status: r.status(),
        successful: r.successful(),
      })),
    };

    return JsonResponse.ok(
      {
        methods: results,
        allSuccessful: Object.values(results).every((r) => r.successful),
      },
      res
    );
  }

  /**
   * Test advanced request configuration
   *
   * Demonstrates:
   * - Custom user agent
   * - Referrer setting
   * - Accept encoding
   * - Cache control
   * - All configuration options combined
   *
   * @route GET /http-test/client/advanced-config
   * @returns Advanced configuration results
   */
  @Get('client/advanced-config')
  async testAdvancedConfig(@Res() res: Response) {
    const response = await HttpClient.withHeaders({
      'User-Agent': 'Nesvel-HTTP-Client/1.0',
      Referer: 'https://example.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    })
      .acceptJson()
      .timeout(30)
      .get('https://jsonplaceholder.typicode.com/posts/1');

    return JsonResponse.ok(
      {
        requestConfig: {
          timeout: '30s',
          headers: 'custom',
          acceptJson: true,
        },
        response: {
          status: response.status(),
          data: response.json(),
          headers: {
            contentType: response.header('content-type'),
            cacheControl: response.header('cache-control'),
          },
        },
      },
      res
    );
  }

  /**
   * Health check endpoint
   *
   * Simple endpoint to verify the controller is working
   *
   * @route GET /http-test/health
   * @returns Health status
   */
  @Get('health')
  async healthCheck(@Res() res: Response) {
    return JsonResponse.ok(
      {
        status: 'healthy',
        package: '@nesvel/nestjs-http',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      res
    );
  }
}
