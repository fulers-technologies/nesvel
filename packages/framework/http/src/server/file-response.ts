import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { Response as ExpressResponse } from 'express';

/**
 * File Response
 *
 * Laravel-style file download response builder.
 * Provides methods for serving files, downloads, and streaming content.
 *
 * @example
 * ```typescript
 * // Download a file
 * return FileResponse.download('/path/to/file.pdf', 'invoice.pdf');
 *
 * // Serve a file inline
 * return FileResponse.file('/path/to/image.jpg');
 *
 * // Stream download
 * return FileResponse.streamDownload((stream) => {
 *   stream.write('File content');
 * }, 'file.txt');
 * ```
 */
export class FileResponse {
  protected filePath?: string;
  protected fileName?: string;
  protected headers: Record<string, string> = {};
  protected disposition: 'attachment' | 'inline' = 'attachment';
  protected deleteAfterSend: boolean = false;

  /**
   * Create a new file response for download.
   *
   * @param filePath - Path to the file
   * @param fileName - Optional custom filename for download
   * @param headers - Additional headers
   * @returns FileResponse instance
   *
   * @example
   * ```typescript
   * FileResponse.download('/storage/invoice.pdf', 'Invoice-2024.pdf');
   * ```
   */
  public static download(
    filePath: string,
    fileName?: string,
    headers?: Record<string, string>
  ): FileResponse {
    const response = FileResponse.make();
    response.filePath = filePath;
    response.fileName = fileName || path.basename(filePath);
    response.disposition = 'attachment';

    if (headers) {
      response.headers = { ...response.headers, ...headers };
    }

    return response;
  }

  /**
   * Create a new file response for inline display.
   *
   * @param filePath - Path to the file
   * @param fileName - Optional custom filename
   * @param headers - Additional headers
   * @returns FileResponse instance
   *
   * @example
   * ```typescript
   * FileResponse.file('/storage/document.pdf');
   * ```
   */
  public static file(
    filePath: string,
    fileName?: string,
    headers?: Record<string, string>
  ): FileResponse {
    const response = FileResponse.make();
    response.filePath = filePath;
    response.fileName = fileName || path.basename(filePath);
    response.disposition = 'inline';

    if (headers) {
      response.headers = { ...response.headers, ...headers };
    }

    return response;
  }

  /**
   * Stream a download response.
   *
   * @param callback - Callback that writes to the stream
   * @param fileName - Filename for the download
   * @param headers - Additional headers
   * @returns FileResponse instance
   *
   * @example
   * ```typescript
   * FileResponse.streamDownload((stream) => {
   *   stream.write('Line 1\n');
   *   stream.write('Line 2\n');
   *   stream.end();
   * }, 'data.txt');
   * ```
   */
  public static streamDownload(
    callback: (stream: ExpressResponse) => void,
    fileName: string,
    headers?: Record<string, string>
  ): { callback: Function; fileName: string; headers?: Record<string, string> } {
    return {
      callback,
      fileName,
      headers,
    };
  }

  /**
   * Set the Content-Disposition header.
   *
   * @param disposition - 'attachment' or 'inline'
   * @param fileName - Optional filename
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.setContentDisposition('attachment', 'custom-name.pdf');
   * ```
   */
  public setContentDisposition(disposition: 'attachment' | 'inline', fileName?: string): this {
    this.disposition = disposition;
    if (fileName) {
      this.fileName = fileName;
    }
    return this;
  }

  /**
   * Delete the file after sending.
   *
   * Useful for temporary files that should be cleaned up after download.
   *
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * FileResponse.download('/tmp/temp-file.zip')
   *   .deleteFileAfterSend();
   * ```
   */
  public deleteFileAfterSend(): this {
    this.deleteAfterSend = true;
    return this;
  }

  /**
   * Set additional headers.
   *
   * @param headers - Headers to set
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * response.withHeaders({
   *   'X-Custom-Header': 'value',
   *   'Cache-Control': 'no-cache'
   * });
   * ```
   */
  public withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  /**
   * Send the file response using Express response object.
   *
   * @param res - Express response object
   *
   * @example
   * ```typescript
   * const fileResponse = FileResponse.download('/path/to/file.pdf');
   * fileResponse.send(res);
   * ```
   */
  public send(res: ExpressResponse): void {
    if (!this.filePath) {
      res.status(500).send('No file path specified');
      return;
    }

    // Check if file exists
    if (!fs.existsSync(this.filePath)) {
      res.status(404).send('File not found');
      return;
    }

    // Get file stats
    const stats = fs.statSync(this.filePath);
    const mimeType = mime.lookup(this.filePath) || 'application/octet-stream';

    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader(
      'Content-Disposition',
      `${this.disposition}; filename="${this.fileName || path.basename(this.filePath)}"`
    );

    // Set custom headers
    Object.entries(this.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(this.filePath);

    fileStream.on('error', (error) => {
      res.status(500).send('Error reading file');
    });

    fileStream.on('end', () => {
      // Delete file after sending if requested
      if (this.deleteAfterSend && this.filePath) {
        fs.unlink(this.filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          }
        });
      }
    });

    fileStream.pipe(res);
  }

  /**
   * Helper method to send file directly via Express response.
   *
   * @param res - Express response
   * @param filePath - Path to file
   * @param fileName - Optional custom filename
   * @param disposition - 'attachment' or 'inline'
   *
   * @example
   * ```typescript
   * FileResponse.sendFile(res, '/path/to/file.pdf', 'download.pdf', 'attachment');
   * ```
   */
  public static sendFile(
    res: ExpressResponse,
    filePath: string,
    fileName?: string,
    disposition: 'attachment' | 'inline' = 'attachment'
  ): void {
    const response = FileResponse.make();
    response.filePath = filePath;
    response.fileName = fileName;
    response.disposition = disposition;
    response.send(res);
  }
}
