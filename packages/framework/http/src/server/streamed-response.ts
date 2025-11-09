import { Writable } from 'stream';
import { Macroable } from '@nesvel/macroable';
import { Response as ExpressResponse } from 'express';

/**
 * Streamed Response
 *
 * Laravel-style streaming response for sending large data or real-time content.
 * Useful for SSE (Server-Sent Events), CSV exports, and large file generation.
 *
 * @example
 * ```typescript
 * // Stream CSV data
 * return StreamedResponse.make((stream) => {
 *   stream.write('Name,Email\n');
 *   users.forEach(user => {
 *     stream.write(`${user.name},${user.email}\n`);
 *   });
 *   stream.end();
 * }, 200, { 'Content-Type': 'text/csv' });
 *
 * // Server-Sent Events
 * return StreamedResponse.serverSentEvents((stream) => {
 *   setInterval(() => {
 *     stream.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
 *   }, 1000);
 * });
 * ```
 */
@Macroable()
export class StreamedResponse {
  protected callback: (stream: ExpressResponse | Writable) => void;
  protected statusCode: number;
  protected headers: Record<string, string>;
  protected sent: boolean = false;

  /**
   * Constructor
   *
   * @param callback - Callback that writes to the stream
   * @param status - HTTP status code (default: 200)
   * @param headers - Response headers
   *
   * @example
   * ```typescript
   * StreamedResponse.make((stream) => {
   *   stream.write('Hello ');
   *   stream.write('World');
   *   stream.end();
   * }, 200, { 'Content-Type': 'text/plain' });
   * ```
   */
  constructor(
    callback: (stream: ExpressResponse | Writable) => void,
    status: number = 200,
    headers: Record<string, string> = {}
  ) {
    this.callback = callback;
    this.statusCode = status;
    this.headers = headers;
  }

  /**
   * Create a Server-Sent Events (SSE) streaming response.
   *
   * @param callback - Callback that writes SSE events
   * @param status - HTTP status code
   * @returns StreamedResponse instance
   *
   * @example
   * ```typescript
   * StreamedResponse.serverSentEvents((stream) => {
   *   const interval = setInterval(() => {
   *     stream.write(`data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
   *   }, 1000);
   *
   *   // Cleanup on client disconnect
   *   stream.on('close', () => clearInterval(interval));
   * });
   * ```
   */
  public static serverSentEvents(
    callback: (stream: ExpressResponse | Writable) => void,
    status: number = 200
  ): StreamedResponse {
    return StreamedResponse.make(callback, status, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });
  }

  /**
   * Create a JSON streaming response.
   *
   * @param callback - Callback that writes JSON data
   * @param status - HTTP status code
   * @returns StreamedResponse instance
   *
   * @example
   * ```typescript
   * StreamedResponse.json((stream) => {
   *   stream.write('[');
   *   items.forEach((item, index) => {
   *     if (index > 0) stream.write(',');
   *     stream.write(JSON.stringify(item));
   *   });
   *   stream.write(']');
   *   stream.end();
   * });
   * ```
   */
  public static json(
    callback: (stream: ExpressResponse | Writable) => void,
    status: number = 200
  ): StreamedResponse {
    return StreamedResponse.make(callback, status, {
      'Content-Type': 'application/json',
    });
  }

  /**
   * Create a CSV streaming response.
   *
   * @param callback - Callback that writes CSV data
   * @param filename - Optional filename for download
   * @param status - HTTP status code
   * @returns StreamedResponse instance
   *
   * @example
   * ```typescript
   * StreamedResponse.csv((stream) => {
   *   stream.write('ID,Name,Email\n');
   *   users.forEach(user => {
   *     stream.write(`${user.id},${user.name},${user.email}\n`);
   *   });
   *   stream.end();
   * }, 'users.csv');
   * ```
   */
  public static csv(
    callback: (stream: ExpressResponse | Writable) => void,
    filename?: string,
    status: number = 200
  ): StreamedResponse {
    const headers: Record<string, string> = {
      'Content-Type': 'text/csv',
    };

    if (filename) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    }

    return StreamedResponse.make(callback, status, headers);
  }

  /**
   * Set a header on the response.
   *
   * @param key - Header name
   * @param value - Header value
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.setHeader('X-Custom-Header', 'value');
   * ```
   */
  public setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Set multiple headers on the response.
   *
   * @param headers - Headers object
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.setHeaders({
   *   'X-Custom': 'value',
   *   'Cache-Control': 'no-cache'
   * });
   * ```
   */
  public setHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Set the status code.
   *
   * @param status - HTTP status code
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.setStatusCode(201);
   * ```
   */
  public setStatusCode(status: number): this {
    this.statusCode = status;
    return this;
  }

  /**
   * Get the status code.
   *
   * @returns HTTP status code
   */
  public getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * Get all headers.
   *
   * @returns Headers object
   */
  public getHeaders(): Record<string, string> {
    return this.headers;
  }

  /**
   * Check if the response has been sent.
   *
   * @returns True if sent, false otherwise
   */
  public isSent(): boolean {
    return this.sent;
  }

  /**
   * Send the streaming response.
   *
   * @param res - Express response object
   *
   * @example
   * ```typescript
   * const streamed = StreamedResponse.make((stream) => {
   *   stream.write('Hello');
   *   stream.end();
   * });
   * streamed.send(res);
   * ```
   */
  public send(res: ExpressResponse): void {
    if (this.sent) {
      throw new Error('Response has already been sent');
    }

    // Set status code
    res.status(this.statusCode);

    // Set headers
    Object.entries(this.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Mark as sent
    this.sent = true;

    // Execute the callback with the response stream
    try {
      this.callback(res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).send('Error during streaming');
      } else {
        // Headers already sent, can't send error response
        res.end();
      }
      throw error;
    }
  }

  /**
   * Send the response and handle errors gracefully.
   *
   * @param res - Express response object
   * @param onError - Optional error handler
   *
   * @example
   * ```typescript
   * response.sendSafely(res, (error) => {
   *   console.error('Streaming error:', error);
   * });
   * ```
   */
  public sendSafely(res: ExpressResponse, onError?: (error: Error) => void): void {
    try {
      this.send(res);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }

  /**
   * Set the callback function.
   *
   * @param callback - New callback function
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.setCallback((stream) => {
   *   stream.write('New content');
   *   stream.end();
   * });
   * ```
   */
  public setCallback(callback: (stream: ExpressResponse | Writable) => void): this {
    this.callback = callback;
    return this;
  }
}
