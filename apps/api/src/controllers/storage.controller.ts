import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Res } from '@nesvel/nestjs-http';
import { StorageService, StorageVisibility } from '@nesvel/nestjs-storage';
import type { MulterFile } from '@nesvel/nestjs-storage';

/**
 * Storage Controller
 *
 * Comprehensive controller for testing all storage operations including:
 * - File uploads (single and multiple)
 * - File downloads (buffer and stream)
 * - File deletion
 * - File metadata retrieval
 * - Presigned URL generation
 * - File listing
 * - File existence checks
 * - Driver information
 *
 * @description RESTful API controller for testing Storage module functionality
 * @author Nesvel
 */
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Upload a single file
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body('path') path?: string,
    @Body('visibility') visibility?: 'public' | 'private'
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    const storagePath = path || `uploads/${Date.now()}-${file.originalname}`;

    const result = await this.storageService.upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      visibility: visibility === 'public' ? StorageVisibility.PUBLIC : StorageVisibility.PRIVATE,
      metadata: {
        customMetadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    return {
      message: 'File uploaded successfully',
      file: result,
    };
  }

  /**
   * Upload multiple files at once
   */
  @Post('upload-multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleFiles(@UploadedFile() files: MulterFile[]) {
    if (!files || !Array.isArray(files)) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map((file) => {
      const storagePath = `uploads/${Date.now()}-${file.originalname}`;
      return this.storageService.upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });
    });

    const results = await Promise.all(uploadPromises);

    return {
      message: `${results.length} files uploaded successfully`,
      files: results,
    };
  }

  /**
   * Download a file as buffer
   */
  @Get('download')
  async downloadFile(@Query('path') path: string, @Res() res: Response) {
    const buffer = await this.storageService.download(path);
    const metadata = await this.storageService.getMetadata(path);

    res.set({
      'Content-Type': metadata.contentType || 'application/octet-stream',
      'Content-Length': buffer.length,
      'Content-Disposition': `attachment; filename="${path.split('/').pop()}"`,
    });

    res.send(buffer);
  }

  /**
   * Stream a file
   */
  @Get('stream')
  async streamFile(@Query('path') path: string): Promise<StreamableFile> {
    const stream = await this.storageService.downloadStream(path);
    return new StreamableFile(stream);
  }

  /**
   * Get file metadata
   */
  @Get('metadata')
  async getMetadata(@Query('path') path: string) {
    const metadata = await this.storageService.getMetadata(path);

    return {
      message: 'Metadata retrieved successfully',
      metadata,
    };
  }

  /**
   * Check if file exists
   */
  @Get('exists')
  async fileExists(@Query('path') path: string) {
    const exists = await this.storageService.exists(path);

    return {
      path,
      exists,
    };
  }

  /**
   * Generate presigned URL
   */
  @Get('presigned-url')
  async getPresignedUrl(@Query('path') path: string, @Query('expiresIn') expiresIn?: number) {
    const url = await this.storageService.getPresignedUrl(path, {
      expiresIn: expiresIn ? parseInt(String(expiresIn)) : undefined,
    });

    return {
      message: 'Presigned URL generated successfully',
      url,
      expiresIn: expiresIn || 3600,
    };
  }

  /**
   * List files in a directory
   */
  @Get('list')
  async listFiles(@Query('prefix') prefix?: string, @Query('maxKeys') maxKeys?: number) {
    const files = await this.storageService.list(prefix, {
      maxResults: maxKeys ? parseInt(String(maxKeys)) : undefined,
    });

    return {
      message: 'Files listed successfully',
      count: files.length,
      files,
    };
  }

  /**
   * Copy a file
   */
  @Post('copy')
  async copyFile(
    @Body('sourcePath') sourcePath: string,
    @Body('destinationPath') destinationPath: string
  ) {
    const result = await this.storageService.copy(sourcePath, destinationPath);

    return {
      message: 'File copied successfully',
      source: sourcePath,
      destination: destinationPath,
      file: result,
    };
  }

  /**
   * Move a file
   */
  @Post('move')
  async moveFile(
    @Body('sourcePath') sourcePath: string,
    @Body('destinationPath') destinationPath: string
  ) {
    const result = await this.storageService.move(sourcePath, destinationPath);

    return {
      message: 'File moved successfully',
      source: sourcePath,
      destination: destinationPath,
      file: result,
    };
  }

  /**
   * Delete a file
   */
  @Delete(':path(*)')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('path') path: string) {
    await this.storageService.delete(path);

    return {
      message: 'File deleted successfully',
      path,
    };
  }

  /**
   * Delete multiple files
   */
  @Post('delete-multiple')
  async deleteMultipleFiles(@Body('paths') paths: string[]) {
    await this.storageService.deleteMultiple(paths);

    return {
      message: `${paths.length} files deleted successfully`,
      paths,
    };
  }

  /**
   * Get storage driver information
   */
  @Get('driver-info')
  async getDriverInfo() {
    const isConnected = this.storageService.isConnected();

    return {
      message: 'Driver information retrieved',
      driver: process.env.STORAGE_DRIVER || 's3',
      connected: isConnected,
    };
  }

  /**
   * Test connection
   */
  @Get('test-connection')
  async testConnection() {
    try {
      const isConnected = this.storageService.isConnected();

      if (!isConnected) {
        await this.storageService.connect();
      }

      return {
        message: 'Storage connection successful',
        connected: true,
      };
    } catch (error: Error | any) {
      return {
        message: 'Storage connection failed',
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file size
   */
  @Get('size')
  async getFileSize(@Query('path') path: string) {
    const metadata = await this.storageService.getMetadata(path);

    return {
      path,
      size: metadata.size,
      sizeFormatted: this.formatBytes(metadata.size || 0),
    };
  }

  /**
   * Helper method to format bytes
   */
  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
