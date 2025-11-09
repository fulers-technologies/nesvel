import { BaseException } from '@nesvel/exceptions';

/**
 * Exception thrown when an unfaked HTTP request is made in test mode.
 *
 * This exception is thrown when `preventStrayRequests()` is enabled
 * and a request is made to a URL that hasn't been faked. This helps
 * prevent accidental real HTTP requests in tests.
 *
 * @example
 * ```typescript
 * HttpClient.fake({ 'api.example.com/*': { data: { ok: true } } });
 * HttpClient.preventStrayRequests();
 *
 * // This will throw StrayRequestException
 * await HttpClient.get('https://unfaked-api.com/data');
 * ```
 */
export class StrayRequestException extends BaseException {
  /**
   * The request URL that was not faked.
   */
  public readonly url: string;

  /**
   * The HTTP method used.
   */
  public readonly method: string;

  /**
   * Create a new stray request exception.
   *
   * @param url - The request URL
   * @param method - The HTTP method
   */
  constructor(url: string, method: string) {
    super(
      `Attempted to make a ${method} request to "${url}" without a matching fake. ` +
        `Use HttpClient.fake() to stub this request or HttpClient.allowStrayRequests(['${url}']) to allow it.`
    );

    this.name = 'StrayRequestException';
    this.url = url;
    this.method = method;
  }

  /**
   * Static factory method to create a new exception.
   *
   * @param url - The request URL
   * @param method - The HTTP method
   * @returns New exception instance
   */
  public static make(url: string, method: string): StrayRequestException {
    return new StrayRequestException(url, method);
  }
}
