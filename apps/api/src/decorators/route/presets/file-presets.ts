import { HttpStatus } from '@nestjs/common';
import { HttpMethod } from '@nesvel/shared';

import { RouteOptions } from '../interfaces/api-endpoint-options.interface';

/**
 * File upload endpoint preset configuration.
 *
 * Provides pre-configured settings for file upload endpoints.
 * Handles multipart/form-data requests and returns appropriate
 * success or error responses.
 *
 * @example
 * ```typescript
 * @Route({ preset: EndpointPreset.UPLOAD })
 * async uploadFile(@UploadedFile() file: Express.Multer.File) {
 *   return { filename: file.filename, size: file.size };
 * }
 * ```
 */
export const UPLOAD_PRESET: Partial<RouteOptions> = {
  /**
   * POST method for file uploads.
   */
  method: HttpMethod.POST,

  /**
   * 201 Created status for successful uploads.
   */
  httpCode: HttpStatus.CREATED,

  /**
   * Documentation configuration.
   */
  documentation: {
    summary: 'Upload file(s)',
    description: 'Uploads one or more files to the server',
  },

  /**
   * Accept multipart/form-data for file uploads.
   */
  consumes: ['multipart/form-data'],

  /**
   * Response configurations.
   * - 201: File uploaded successfully
   * - 400: Invalid file or upload parameters
   * - 401: Authentication required
   */
  responses: {
    created: {
      description: 'File uploaded successfully',
    },
    badRequest: 'Invalid file',
    unauthorized: 'Unauthorized',
  },
};

/**
 * File download endpoint preset configuration.
 *
 * Provides pre-configured settings for file download endpoints.
 * Returns binary file data with appropriate content type headers.
 *
 * @example
 * ```typescript
 * @Route({ preset: EndpointPreset.DOWNLOAD })
 * async downloadFile(@Param('id') id: string, @Res() res: Response) {
 *   const file = await this.filesService.getFile(id);
 *   res.download(file.path, file.name);
 * }
 * ```
 */
export const DOWNLOAD_PRESET: Partial<RouteOptions> = {
  /**
   * GET method for file downloads.
   */
  method: HttpMethod.GET,

  /**
   * 200 OK status for successful downloads.
   */
  httpCode: HttpStatus.OK,

  /**
   * Documentation configuration.
   */
  documentation: {
    summary: 'Download file',
    description: 'Downloads a file from the server',
  },

  /**
   * Produce binary octet stream for file downloads.
   */
  produces: ['application/octet-stream'],

  /**
   * Response configurations.
   * - 200: File downloaded successfully
   * - 404: File not found
   * - 401: Authentication required
   */
  responses: {
    ok: {
      description: 'File downloaded successfully',
    },
    notFound: 'File not found',
    unauthorized: 'Unauthorized',
  },
};
