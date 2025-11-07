/**
 * Logging Configuration
 *
 * Configuration for application logging (Winston, Pino, etc.)
 *
 * @module config/logging.config
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export enum LogTransport {
  CONSOLE = 'console',
  FILE = 'file',
  CLOUDWATCH = 'cloudwatch',
  DATADOG = 'datadog',
  SENTRY = 'sentry',
}

export interface ILoggingConfig {
  level: LogLevel;
  transports: LogTransport[];
  console: {
    colorize: boolean;
    timestamp: boolean;
  };
  file?: {
    filename: string;
    dirname: string;
    maxSize: string; // e.g., '10m', '1g'
    maxFiles: number;
  };
  cloudwatch?: {
    logGroupName: string;
    logStreamName: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  datadog?: {
    apiKey: string;
    service: string;
    host: string;
  };
  sentry?: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
  };
  maskSensitiveData: boolean;
  sensitiveFields: string[];
}

export const loggingConfig: ILoggingConfig = {
  level:
    (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG),
  transports: process.env.LOG_TRANSPORTS
    ? (process.env.LOG_TRANSPORTS.split(',') as LogTransport[])
    : [LogTransport.CONSOLE],
  console: {
    colorize: process.env.LOG_COLORIZE === 'true' || process.env.NODE_ENV !== 'production',
    timestamp: process.env.LOG_TIMESTAMP !== 'false',
  },
  file:
    process.env.LOG_FILE_ENABLED === 'true'
      ? {
          filename: process.env.LOG_FILE_NAME || 'app.log',
          dirname: process.env.LOG_FILE_DIR || './logs',
          maxSize: process.env.LOG_FILE_MAX_SIZE || '10m',
          maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES || '5', 10),
        }
      : undefined,
  cloudwatch: process.env.CLOUDWATCH_LOG_GROUP
    ? {
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
        logStreamName: process.env.CLOUDWATCH_LOG_STREAM || 'api-stream',
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    : undefined,
  datadog: process.env.DATADOG_API_KEY
    ? {
        apiKey: process.env.DATADOG_API_KEY,
        service: process.env.DATADOG_SERVICE || 'api',
        host: process.env.DATADOG_HOST || 'http-intake.logs.datadoghq.com',
      }
    : undefined,
  sentry: process.env.SENTRY_DSN
    ? {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
      }
    : undefined,
  maskSensitiveData: process.env.LOG_MASK_SENSITIVE !== 'false',
  sensitiveFields: process.env.LOG_SENSITIVE_FIELDS
    ? process.env.LOG_SENSITIVE_FIELDS.split(',')
    : ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'],
};
