import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Injectable, Optional } from '@nestjs/common';
import { InjectStorage } from '@nesvel/nestjs-storage';

/**
 * Uploaded File
 *
 * Laravel-style wrapper for uploaded files (Multer/Express).
 * Provides helper methods for file validation, storage, and manipulation.
 *
 * @example Basic usage
 * ```typescript
 * import { UploadedFile } from '@nesvel/nestjs-http';
 *
 * @Post('upload')
 * async upload(@UploadFile() file: UploadedFile) {
 *   // Validate
 *   if (!file.isValid()) {
 *     throw new BadRequestException('Invalid file');
 *   }
 *
 *   // Store with random name
 *   const path = await file.store('avatars');
 *
 *   // Or store with custom name
 *   const path = await file.storeAs('avatars', 'profile.jpg');
 *
 *   return { path };
 * }
 * ```
 *
 * @example Validation
 * ```typescript
 * // Check file type
 * if (file.isImage()) {
 *   const dimensions = await file.dimensions();
 *   console.log(`${dimensions.width}x${dimensions.height}`);
 * }
 *
 * // Validate extension
 * if (!file.hasExtension(['jpg', 'png', 'gif'])) {
 *   throw new BadRequestException('Invalid image format');
 * }
 *
 * // Check MIME type
 * if (file.mimeType() !== 'application/pdf') {
 *   throw new BadRequestException('Only PDF files allowed');
 * }
 * ```
 */
@Injectable()
export class UploadedFile {
  /**
   * The underlying Multer file object.
   */
  protected file: Express.Multer.File;

  /**
   * Cached hash name for the file.
   */
  protected cachedHashName?: string;

  /**
   * Storage service instance (injected when available).
   * Optional - only needed if using store() methods.
   */
  protected storageService?: any;

  /**
   * Constructor
   *
   * @param file - The Multer file object
   * @param storageService - Optional storage service (auto-injected if available)
   *
   * @example
   * ```typescript
   * // Manual construction
   * const uploadedFile = new UploadedFile(multerFile);
   *
   * // With dependency injection (automatically handled by NestJS)
   * const uploadedFile = new UploadedFile(multerFile, storageService);
   * ```
   */
  constructor(file: Express.Multer.File, @Optional() @InjectStorage() storageService?: any) {
    this.file = file;
    this.storageService = storageService;
  }

  /**
   * Create an UploadedFile instance from a Multer file.
   *
   * @param file - The Multer file object
   * @param storageService - Optional storage service
   * @returns UploadedFile instance
   *
   * @example
   * ```typescript
   * const uploadedFile = UploadedFile.createFromMulter(multerFile);
   * const uploadedFile = UploadedFile.createFromMulter(multerFile, storageService);
   * ```
   */
  public static createFromMulter(file: Express.Multer.File, storageService?: any): UploadedFile {
    return new UploadedFile(file, storageService);
  }

  /**
   * Get the fully qualified path to the file.
   *
   * @returns The file path
   *
   * @example
   * ```typescript
   * const filePath = file.path(); // '/tmp/upload_abc123'
   * ```
   */
  public path(): string {
    return this.file.path || '';
  }

  /**
   * Get the file's extension.
   *
   * @returns The file extension without dot
   *
   * @example
   * ```typescript
   * const ext = file.extension(); // 'jpg'
   * ```
   */
  public extension(): string {
    const ext = path.extname(this.file.originalname);
    return ext ? ext.substring(1).toLowerCase() : '';
  }

  /**
   * Get the file's client original name.
   *
   * @returns The original filename
   *
   * @example
   * ```typescript
   * const name = file.getClientOriginalName(); // 'photo.jpg'
   * ```
   */
  public getClientOriginalName(): string {
    return this.file.originalname;
  }

  /**
   * Get the file's client original extension.
   *
   * @returns The original extension
   *
   * @example
   * ```typescript
   * const ext = file.getClientOriginalExtension(); // 'jpg'
   * ```
   */
  public getClientOriginalExtension(): string {
    return this.extension();
  }

  /**
   * Get the file's MIME type.
   *
   * @returns The MIME type
   *
   * @example
   * ```typescript
   * const mime = file.mimeType(); // 'image/jpeg'
   * ```
   */
  public mimeType(): string {
    return this.file.mimetype;
  }

  /**
   * Get the file size in bytes.
   *
   * @returns File size in bytes
   *
   * @example
   * ```typescript
   * const size = file.getSize(); // 1024000
   * ```
   */
  public getSize(): number {
    return this.file.size;
  }

  /**
   * Get the file size in a human-readable format.
   *
   * @returns Human-readable file size
   *
   * @example
   * ```typescript
   * const size = file.getHumanReadableSize(); // '1.5 MB'
   * ```
   */
  public getHumanReadableSize(): string {
    const bytes = this.file.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Generate a hash name for the file.
   *
   * Creates a secure random filename to prevent overwrites and path traversal attacks.
   *
   * @param pathPrefix - Optional path prefix
   * @returns The hash filename
   *
   * @example
   * ```typescript
   * const name = file.hashName(); // 'a1b2c3d4e5f6...jpg'
   * const name = file.hashName('avatars'); // 'avatars/a1b2c3d4e5f6...jpg'
   * ```
   */
  public hashName(pathPrefix?: string): string {
    if (!this.cachedHashName) {
      const hash = crypto.randomBytes(20).toString('hex');
      const ext = this.extension();
      this.cachedHashName = ext ? `${hash}.${ext}` : hash;
    }

    if (pathPrefix) {
      const normalizedPath = pathPrefix.replace(/\\/g, '/').replace(/\/$/, '');
      return `${normalizedPath}/${this.cachedHashName}`;
    }

    return this.cachedHashName;
  }

  /**
   * Check if the uploaded file is valid.
   *
   * @returns True if valid, false otherwise
   *
   * @example
   * ```typescript
   * if (!file.isValid()) {
   *   throw new Error('Invalid file');
   * }
   * ```
   */
  public isValid(): boolean {
    return Boolean(
      this.file &&
        this.file.originalname &&
        this.file.size > 0 &&
        (this.file.buffer || this.file.path)
    );
  }

  /**
   * Check if the file has one of the given extensions.
   *
   * @param extensions - Array of allowed extensions (without dots)
   * @returns True if extension matches
   *
   * @example
   * ```typescript
   * if (file.hasExtension(['jpg', 'png', 'gif'])) {
   *   // Process image
   * }
   * ```
   */
  public hasExtension(extensions: string[]): boolean {
    const fileExt = this.extension().toLowerCase();
    return extensions.some((ext) => ext.toLowerCase() === fileExt);
  }

  /**
   * Check if the file is an image.
   *
   * @returns True if image
   *
   * @example
   * ```typescript
   * if (file.isImage()) {
   *   const dimensions = await file.dimensions();
   * }
   * ```
   */
  public isImage(): boolean {
    return this.file.mimetype.startsWith('image/');
  }

  /**
   * Check if the file is a video.
   *
   * @returns True if video
   *
   * @example
   * ```typescript
   * if (file.isVideo()) {
   *   // Process video
   * }
   * ```
   */
  public isVideo(): boolean {
    return this.file.mimetype.startsWith('video/');
  }

  /**
   * Check if the file is audio.
   *
   * @returns True if audio
   *
   * @example
   * ```typescript
   * if (file.isAudio()) {
   *   // Process audio
   * }
   * ```
   */
  public isAudio(): boolean {
    return this.file.mimetype.startsWith('audio/');
  }

  /**
   * Get the dimensions of an image file.
   *
   * Note: Requires the optional 'image-size' package.
   * Install with: npm install image-size
   *
   * @returns Image dimensions or null if package not installed
   *
   * @example
   * ```typescript
   * const dims = await file.dimensions();
   * if (dims) {
   *   console.log(`${dims.width}x${dims.height}`);
   * }
   * ```
   */
  public async dimensions(): Promise<{ width: number; height: number } | null> {
    if (!this.isImage()) {
      return null;
    }

    try {
      // Dynamically import optional image-size package
      // Using Function constructor to avoid TypeScript module resolution
      const importImageSize = new Function('specifier', 'return import(specifier)');
      const imageSizeModule = await importImageSize('image-size').catch(() => null);

      if (!imageSizeModule) {
        // Package not installed - that's okay, it's optional
        return null;
      }

      const buffer = this.file.buffer || fs.readFileSync(this.file.path);
      const imageSize = imageSizeModule.default || imageSizeModule;
      const dimensions = typeof imageSize === 'function' ? imageSize(buffer) : null;

      if (dimensions && dimensions.width && dimensions.height) {
        return {
          width: dimensions.width,
          height: dimensions.height,
        };
      }
    } catch (error) {
      // Error reading dimensions or package not available
      return null;
    }

    return null;
  }

  /**
   * Store the uploaded file using the configured storage.
   *
   * Uses @nesvel/storage to store the file with a hash name.
   *
   * @param pathPrefix - Directory path prefix
   * @param visibility - File visibility (public/private)
   * @returns The stored file path
   *
   * @example
   * ```typescript
   * const path = await file.store('avatars');
   * const path = await file.store('documents', 'private');
   * ```
   */
  public async store(pathPrefix?: string, visibility?: string): Promise<string> {
    const filename = this.hashName(pathPrefix);
    return this.storeAs(pathPrefix || '', path.basename(filename), visibility);
  }

  /**
   * Store the uploaded file with a custom name.
   *
   * @param pathPrefix - Directory path prefix
   * @param name - Custom filename
   * @param visibility - File visibility (public/private)
   * @returns The stored file path
   *
   * @example
   * ```typescript
   * const path = await file.storeAs('avatars', 'profile.jpg');
   * const path = await file.storeAs('documents', 'contract.pdf', 'private');
   * ```
   */
  public async storeAs(pathPrefix: string, name: string, visibility?: string): Promise<string> {
    if (!this.storageService) {
      throw new Error(
        'Storage service not available. Make sure @nesvel/storage is properly configured and injected.'
      );
    }

    const normalizedPath = pathPrefix.replace(/\\/g, '/').replace(/\/$/, '');
    const fullPath = normalizedPath ? `${normalizedPath}/${name}` : name;

    // Use buffer if available, otherwise read from path
    const content = this.file.buffer || fs.readFileSync(this.file.path);

    // Store using @nesvel/storage
    await this.storageService.upload(fullPath, content, {
      contentType: this.file.mimetype,
      visibility: visibility,
    });

    return fullPath;
  }

  /**
   * Store the file publicly.
   *
   * @param pathPrefix - Directory path prefix
   * @returns The stored file path
   *
   * @example
   * ```typescript
   * const path = await file.storePublicly('public/images');
   * ```
   */
  public async storePublicly(pathPrefix?: string): Promise<string> {
    return this.store(pathPrefix, 'public');
  }

  /**
   * Store the file publicly with a custom name.
   *
   * @param pathPrefix - Directory path prefix
   * @param name - Custom filename
   * @returns The stored file path
   *
   * @example
   * ```typescript
   * const path = await file.storePubliclyAs('avatars', 'user-123.jpg');
   * ```
   */
  public async storePubliclyAs(pathPrefix: string, name: string): Promise<string> {
    return this.storeAs(pathPrefix, name, 'public');
  }

  /**
   * Get the file content as a buffer.
   *
   * @returns File content buffer
   *
   * @example
   * ```typescript
   * const buffer = file.getContent();
   * ```
   */
  public getContent(): Buffer {
    if (this.file.buffer) {
      return this.file.buffer;
    }

    if (this.file.path) {
      return fs.readFileSync(this.file.path);
    }

    return Buffer.from('');
  }

  /**
   * Get the file content as a string.
   *
   * @param encoding - Character encoding (default: 'utf-8')
   * @returns File content as string
   *
   * @example
   * ```typescript
   * const content = file.getContentAsString();
   * ```
   */
  public getContentAsString(encoding: BufferEncoding = 'utf-8'): string {
    return this.getContent().toString(encoding);
  }

  /**
   * Get the underlying Multer file object.
   *
   * @returns The original Multer file
   *
   * @example
   * ```typescript
   * const multerFile = file.getFile();
   * ```
   */
  public getFile(): Express.Multer.File {
    return this.file;
  }

  /**
   * Convert the file to a plain object.
   *
   * @returns Plain object representation
   *
   * @example
   * ```typescript
   * const data = file.toObject();
   * // { originalname: '...', mimetype: '...', size: 123, ... }
   * ```
   */
  public toObject(): Record<string, any> {
    return {
      fieldname: this.file.fieldname,
      originalname: this.file.originalname,
      encoding: this.file.encoding,
      mimetype: this.file.mimetype,
      size: this.file.size,
      destination: this.file.destination,
      filename: this.file.filename,
      path: this.file.path,
    };
  }

  /**
   * Convert to JSON representation.
   *
   * @returns JSON representation
   *
   * @example
   * ```typescript
   * const json = file.toJSON();
   * ```
   */
  public toJSON(): Record<string, any> {
    return this.toObject();
  }
}
