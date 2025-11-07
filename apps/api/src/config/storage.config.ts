/**
 * Storage Configuration
 *
 * Configuration for file storage (local, S3, GCS, etc.)
 *
 * @module config/storage.config
 */

export enum StorageDriver {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
  AZURE = 'azure',
}

export interface IStorageConfig {
  default: StorageDriver;
  local?: {
    root: string;
    url: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };
  gcs?: {
    bucket: string;
    keyFilename: string;
    projectId: string;
  };
  azure?: {
    account: string;
    accountKey: string;
    container: string;
  };
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
}

export const storageConfig: IStorageConfig = {
  default: (process.env.STORAGE_DRIVER as StorageDriver) || StorageDriver.LOCAL,
  local: {
    root: process.env.STORAGE_LOCAL_ROOT || './storage/uploads',
    url: process.env.STORAGE_LOCAL_URL || 'http://localhost:3000/uploads',
  },
  s3: process.env.AWS_S3_BUCKET
    ? {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_S3_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        endpoint: process.env.AWS_S3_ENDPOINT,
      }
    : undefined,
  gcs: process.env.GCS_BUCKET
    ? {
        bucket: process.env.GCS_BUCKET,
        keyFilename: process.env.GCS_KEY_FILENAME || '',
        projectId: process.env.GCS_PROJECT_ID || '',
      }
    : undefined,
  azure: process.env.AZURE_STORAGE_ACCOUNT
    ? {
        account: process.env.AZURE_STORAGE_ACCOUNT,
        accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
        container: process.env.AZURE_STORAGE_CONTAINER || '',
      }
    : undefined,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES
    ? process.env.ALLOWED_MIME_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};
