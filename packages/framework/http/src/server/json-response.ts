import type { Response as ExpressResponse } from 'express';

import { Response } from './response';

/**
 * JSON Response Builder
 *
 * Specialized response builder for JSON responses with convenience methods.
 * Extends the base Response class with JSON-specific helpers.
 *
 * @example
 * ```typescript
 * import { JsonResponse } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   index(@Res() response: Response) {
 *     return JsonResponse.ok({ users: [] }, response);
 *   }
 *
 *   @Post()
 *   create(@Res() response: Response) {
 *     return JsonResponse.created({ id: 1 }, response);
 *   }
 * }
 * ```
 */
export class JsonResponse extends Response {
  /**
   * Send a successful JSON response (200 OK).
   *
   * @param data - Data to send
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.ok({ users: [] }, response);
   * ```
   */
  public static ok(data: any, res: Response): ExpressResponse {
    return res.status(200).json(data);
  }

  /**
   * Send a created response (201 Created).
   *
   * @param data - Data to send
   * @param res - Enhanced response object
   * @param location - Optional location header
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.created({ id: 1 }, response, '/users/1');
   * ```
   */
  public static created(data: any, res: Response, location?: string): ExpressResponse {
    if (location) {
      res.header('Location', location);
    }
    return res.status(201).json(data);
  }

  /**
   * Send an accepted response (202 Accepted).
   *
   * @param data - Data to send
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.accepted({ queued: true }, response);
   * ```
   */
  public static accepted(data: any, res: Response): ExpressResponse {
    return res.status(202).json(data);
  }

  /**
   * Send a no content response (204 No Content).
   *
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.noContent(response);
   * ```
   */
  public static noContent(res: Response): ExpressResponse {
    return res.status(204).send();
  }

  /**
   * Send a bad request response (400 Bad Request).
   *
   * @param message - Error message or data
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.badRequest({ error: 'Invalid input' }, response);
   * ```
   */
  public static badRequest(message: any, res: Response): ExpressResponse {
    return res.status(400).json(typeof message === 'string' ? { error: message } : message);
  }

  /**
   * Send an unauthorized response (401 Unauthorized).
   *
   * @param message - Error message or data
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.unauthorized('Invalid credentials', response);
   * ```
   */
  public static unauthorized(message: any, res: Response): ExpressResponse {
    return res.status(401).json(typeof message === 'string' ? { error: message } : message);
  }

  /**
   * Send a forbidden response (403 Forbidden).
   *
   * @param message - Error message or data
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.forbidden('Access denied', response);
   * ```
   */
  public static forbidden(message: any, res: Response): ExpressResponse {
    return res.status(403).json(typeof message === 'string' ? { error: message } : message);
  }

  /**
   * Send a not found response (404 Not Found).
   *
   * @param message - Error message or data
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.notFound('User not found', response);
   * ```
   */
  public static notFound(message: any, res: Response): ExpressResponse {
    return res.status(404).json(typeof message === 'string' ? { error: message } : message);
  }

  /**
   * Send a server error response (500 Internal Server Error).
   *
   * @param message - Error message or data
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.serverError('Something went wrong', response);
   * ```
   */
  public static serverError(message: any, res: Response): ExpressResponse {
    return res.status(500).json(typeof message === 'string' ? { error: message } : message);
  }

  /**
   * Send a custom JSON response.
   *
   * @param data - Data to send
   * @param status - HTTP status code
   * @param res - Enhanced response object
   * @returns Express response
   *
   * @example
   * ```typescript
   * return JsonResponse.custom({ data }, 418, response);
   * ```
   */
  public static custom(data: any, status: number, res: Response): ExpressResponse {
    return res.status(status).json(data);
  }
}
