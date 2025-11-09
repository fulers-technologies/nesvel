import type { InteractsWithContentTypesInterface } from '@/interfaces';

/**
 * Mixin that provides methods for content type negotiation.
 *
 * Implements Laravel's InteractsWithContentTypes trait functionality
 * for detecting and negotiating content types with clients.
 *
 * @param Base - The base class to extend
 * @returns Extended class with content type methods
 */
export class InteractsWithContentTypes implements InteractsWithContentTypesInterface {
  /**
   * Determine if the request is sending JSON.
   *
   * @returns True if Content-Type indicates JSON
   */
  isJson(): boolean {
    const contentType = (this as any).get('content-type') || '';
    return contentType.includes('/json') || contentType.includes('+json');
  }

  /**
   * Determine if the current request probably expects a JSON response.
   *
   * @returns True if request expects JSON
   */
  expectsJson(): boolean {
    return (
      ((this as any).xhr && !(this as any).isPjax() && (this as any).acceptsAnyContentType()) ||
      (this as any).wantsJson()
    );
  }

  /**
   * Determine if the current request is asking for JSON.
   *
   * @returns True if Accept header indicates JSON
   */
  wantsJson(): boolean {
    const acceptable = (this as any).accepts();
    if (!acceptable || acceptable.length === 0) {
      return false;
    }

    const firstAccept = Array.isArray(acceptable) ? acceptable[0] : acceptable;
    const acceptStr = String(firstAccept).toLowerCase();

    return acceptStr.includes('/json') || acceptStr.includes('+json');
  }

  /**
   * Determines whether the current requests accepts a given content type.
   *
   * @param contentTypes - Content type(s) to check
   * @returns True if any content type is acceptable
   */
  accepts(contentTypes?: string | string[]): boolean {
    if (!contentTypes) {
      // Return all acceptable types via Express's accepts()
      const result = (this as any).acceptsCharsets?.();
      return result !== undefined ? result : true;
    }

    const types = Array.isArray(contentTypes) ? contentTypes : [contentTypes];

    // Use Express's accepts() method for negotiation
    const result = (this as any).accepts(...types);
    return result !== false && result !== undefined;
  }

  /**
   * Return the most suitable content type from the given array based on content negotiation.
   *
   * @param contentTypes - Content types to choose from
   * @returns The preferred content type or null
   */
  prefers(contentTypes: string | string[]): string | null {
    const types = Array.isArray(contentTypes) ? contentTypes : [contentTypes];

    // Use Express's accepts() which returns the best match
    const result = (this as any).accepts(...types);

    if (result && result !== false) {
      return String(result);
    }

    return null;
  }

  /**
   * Determine if the current request accepts any content type.
   *
   * @returns True if accepts any content type
   */
  acceptsAnyContentType(): boolean {
    const acceptHeader = (this as any).get('accept') || '';

    return acceptHeader === '' || acceptHeader === '*/*' || acceptHeader === '*';
  }

  /**
   * Determines whether a request accepts JSON.
   *
   * @returns True if accepts JSON
   */
  acceptsJson(): boolean {
    return (this as any).accepts('application/json');
  }

  /**
   * Determines whether a request accepts HTML.
   *
   * @returns True if accepts HTML
   */
  acceptsHtml(): boolean {
    return (this as any).accepts('text/html');
  }

  /**
   * Determine if the given content types match.
   *
   * @param actual - The actual content type
   * @param type - The type to match against
   * @returns True if types match
   */
  matchesType(actual: string, type: string): boolean {
    if (actual === type) {
      return true;
    }

    const split = actual.split('/');

    if (split.length !== 2) {
      return false;
    }

    // Check for vendor-specific MIME types like application/vnd.api+json
    const pattern = new RegExp(
      `${split[0]}/.+\\+${split[1]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    return pattern.test(type);
  }

  /**
   * Get the data format expected in the response.
   *
   * @param defaultFormat - Default format if none specified
   * @returns The expected format
   */
  format(defaultFormat: string = 'html'): string {
    const acceptHeader = (this as any).get('accept') || '';
    const accepts = acceptHeader.split(',').map((type: string) => type.trim());

    for (const accept of accepts) {
      const format = (this as any).getFormatFromMimeType(accept);
      if (format) {
        return format;
      }
    }

    return defaultFormat;
  }

  /**
   * Get the format from MIME type.
   *
   * @param mimeType - The MIME type
   * @returns The format or null
   */
  protected getFormatFromMimeType(mimeType: string): string | null {
    const formatMap: Record<string, string> = {
      'application/json': 'json',
      'application/xml': 'xml',
      'text/xml': 'xml',
      'text/html': 'html',
      'text/plain': 'txt',
      'application/javascript': 'js',
    };

    const cleanType = mimeType.split(';')[0]?.trim().toLowerCase() || '';
    return formatMap[cleanType] || null;
  }

  /**
   * Check if request is from Pjax.
   *
   * @returns True if Pjax request
   */
  protected isPjax(): boolean {
    return (this as any).get('x-pjax') === 'true';
  }
}
