import type { AxiosResponse } from 'axios';

/**
 * Response Sequence for Testing
 *
 * Allows defining a sequence of responses to be returned in order
 * when faking HTTP requests. Useful for testing scenarios where
 * multiple requests to the same endpoint should return different responses.
 *
 * @example
 * ```typescript
 * const sequence = new ResponseSequence()
 *   .push({ data: { id: 1 }, status: 200 })
 *   .push({ data: { id: 2 }, status: 200 })
 *   .push({ data: { id: 3 }, status: 200 });
 *
 * HttpClient.fake({
 *   'api.example.com/users': sequence
 * });
 *
 * // First request returns id: 1
 * // Second request returns id: 2
 * // Third request returns id: 3
 * ```
 */
export class ResponseSequence {
  /**
   * The array of responses to return in sequence.
   */
  protected responses: AxiosResponse[] = [];

  /**
   * The current index in the response sequence.
   */
  protected currentIndex = 0;

  /**
   * Whether to repeat the sequence after exhausting all responses.
   */
  protected shouldRepeat = false;

  /**
   * Create a new ResponseSequence instance.
   *
   * @param responses - Optional initial array of responses
   */
  constructor(responses: AxiosResponse[] = []) {
    this.responses = responses;
  }

  /**
   * Add a response to the end of the sequence.
   *
   * @param response - The response to add
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence
   *   .push({ data: { success: true }, status: 200 })
   *   .push({ data: { success: false }, status: 400 });
   * ```
   */
  public push(response: AxiosResponse | any): this {
    // If not an AxiosResponse, wrap it in a basic response structure
    if (!this.isAxiosResponse(response)) {
      this.responses.push(this.makeResponse(response));
    } else {
      this.responses.push(response);
    }
    return this;
  }

  /**
   * Add a response with specific status code.
   *
   * @param data - The response data
   * @param status - The HTTP status code
   * @param headers - Optional headers
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence
   *   .pushStatus({ message: 'Created' }, 201)
   *   .pushStatus({ error: 'Not Found' }, 404);
   * ```
   */
  public pushStatus(data: any, status: number, headers: Record<string, any> = {}): this {
    this.responses.push(this.makeResponse(data, status, headers));
    return this;
  }

  /**
   * Add a successful response (200 OK).
   *
   * @param data - The response data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushOk({ success: true });
   * ```
   */
  public pushOk(data: any): this {
    return this.pushStatus(data, 200);
  }

  /**
   * Add a created response (201 Created).
   *
   * @param data - The response data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushCreated({ id: 1, name: 'John' });
   * ```
   */
  public pushCreated(data: any): this {
    return this.pushStatus(data, 201);
  }

  /**
   * Add a no content response (204 No Content).
   *
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushNoContent();
   * ```
   */
  public pushNoContent(): this {
    return this.pushStatus(null, 204);
  }

  /**
   * Add a bad request response (400 Bad Request).
   *
   * @param data - The error data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushBadRequest({ error: 'Invalid input' });
   * ```
   */
  public pushBadRequest(data: any): this {
    return this.pushStatus(data, 400);
  }

  /**
   * Add an unauthorized response (401 Unauthorized).
   *
   * @param data - The error data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushUnauthorized({ error: 'Invalid credentials' });
   * ```
   */
  public pushUnauthorized(data: any): this {
    return this.pushStatus(data, 401);
  }

  /**
   * Add a forbidden response (403 Forbidden).
   *
   * @param data - The error data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushForbidden({ error: 'Access denied' });
   * ```
   */
  public pushForbidden(data: any): this {
    return this.pushStatus(data, 403);
  }

  /**
   * Add a not found response (404 Not Found).
   *
   * @param data - The error data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushNotFound({ error: 'Resource not found' });
   * ```
   */
  public pushNotFound(data: any): this {
    return this.pushStatus(data, 404);
  }

  /**
   * Add a server error response (500 Internal Server Error).
   *
   * @param data - The error data
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.pushServerError({ error: 'Server malfunction' });
   * ```
   */
  public pushServerError(data: any): this {
    return this.pushStatus(data, 500);
  }

  /**
   * Configure the sequence to repeat after exhausting all responses.
   *
   * When repeat is enabled, the sequence will start over from the
   * beginning once all responses have been used.
   *
   * @param repeat - Whether to repeat the sequence
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence
   *   .push({ data: { success: true }, status: 200 })
   *   .repeat(); // Will keep returning the same response
   * ```
   */
  public repeat(repeat = true): this {
    this.shouldRepeat = repeat;
    return this;
  }

  /**
   * Get the next response in the sequence.
   *
   * Returns the next response and advances the index. If the sequence
   * is exhausted and repeat is disabled, returns undefined.
   *
   * @returns The next response or undefined
   *
   * @example
   * ```typescript
   * const response = sequence.next();
   * ```
   */
  public next(): AxiosResponse | undefined {
    // If we've exhausted the sequence
    if (this.currentIndex >= this.responses.length) {
      if (this.shouldRepeat) {
        // Reset to start if repeating
        this.currentIndex = 0;
      } else {
        // No more responses available
        return undefined;
      }
    }

    // Get the current response and advance index
    const response = this.responses[this.currentIndex];
    this.currentIndex++;

    return response;
  }

  /**
   * Check if the sequence is empty.
   *
   * @returns True if no responses remain (and not repeating)
   *
   * @example
   * ```typescript
   * if (sequence.isEmpty()) {
   *   console.log('No more responses');
   * }
   * ```
   */
  public isEmpty(): boolean {
    return this.currentIndex >= this.responses.length && !this.shouldRepeat;
  }

  /**
   * Check if the sequence has more responses.
   *
   * @returns True if more responses are available
   *
   * @example
   * ```typescript
   * if (sequence.hasMore()) {
   *   const response = sequence.next();
   * }
   * ```
   */
  public hasMore(): boolean {
    return !this.isEmpty();
  }

  /**
   * Reset the sequence to the beginning.
   *
   * @returns This sequence for chaining
   *
   * @example
   * ```typescript
   * sequence.reset(); // Start over from first response
   * ```
   */
  public reset(): this {
    this.currentIndex = 0;
    return this;
  }

  /**
   * Get the total number of responses in the sequence.
   *
   * @returns The number of responses
   *
   * @example
   * ```typescript
   * console.log(`Sequence has ${sequence.count()} responses`);
   * ```
   */
  public count(): number {
    return this.responses.length;
  }

  /**
   * Get the current index in the sequence.
   *
   * @returns The current index
   *
   * @example
   * ```typescript
   * console.log(`Current position: ${sequence.currentPosition()}`);
   * ```
   */
  public currentPosition(): number {
    return this.currentIndex;
  }

  /**
   * Make this sequence callable as a function.
   *
   * This allows the sequence to be used directly as a fake response
   * in HttpClient.fake().
   *
   * @returns The next response in the sequence
   */
  public __invoke(): AxiosResponse | undefined {
    return this.next();
  }

  /**
   * Check if an object is an AxiosResponse.
   *
   * @param obj - The object to check
   * @returns True if object is an AxiosResponse
   */
  private isAxiosResponse(obj: any): obj is AxiosResponse {
    return (
      obj &&
      typeof obj === 'object' &&
      'status' in obj &&
      'statusText' in obj &&
      'headers' in obj &&
      'config' in obj &&
      'data' in obj
    );
  }

  /**
   * Create a basic AxiosResponse structure.
   *
   * @param data - The response data
   * @param status - The HTTP status code
   * @param headers - Optional headers
   * @returns A basic AxiosResponse object
   */
  private makeResponse(data: any, status = 200, headers: Record<string, any> = {}): AxiosResponse {
    return {
      data,
      status,
      statusText: this.getStatusText(status),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      config: {} as any,
      request: {},
    } as AxiosResponse;
  }

  /**
   * Get status text for a status code.
   *
   * @param status - The HTTP status code
   * @returns The status text
   */
  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    return statusTexts[status] || 'Unknown';
  }
}
