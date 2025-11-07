/**
 * Monitoring and Telemetry Configuration
 *
 * Configuration for metrics, tracing, and observability
 *
 * @module config/monitoring.config
 */

export interface IMonitoringConfig {
  enabled: boolean;
  metrics: {
    enabled: boolean;
    port: number;
    path: string;
    prometheus?: {
      enabled: boolean;
      defaultLabels: Record<string, string>;
    };
  };
  tracing: {
    enabled: boolean;
    serviceName: string;
    jaeger?: {
      host: string;
      port: number;
      samplingRate: number;
    };
    zipkin?: {
      url: string;
      samplingRate: number;
    };
    openTelemetry?: {
      endpoint: string;
      headers: Record<string, string>;
    };
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number; // ms
    timeout: number; // ms
  };
  apm?: {
    enabled: boolean;
    serviceName: string;
    serverUrl: string;
    secretToken?: string;
    environment: string;
  };
}

export const monitoringConfig: IMonitoringConfig = {
  enabled: process.env.MONITORING_ENABLED !== 'false',
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
    path: process.env.METRICS_PATH || '/metrics',
    prometheus:
      process.env.PROMETHEUS_ENABLED === 'true'
        ? {
            enabled: true,
            defaultLabels: {
              app: process.env.APP_NAME || 'api',
              env: process.env.NODE_ENV || 'development',
            },
          }
        : undefined,
  },
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
    serviceName: process.env.TRACING_SERVICE_NAME || 'api',
    jaeger: process.env.JAEGER_HOST
      ? {
          host: process.env.JAEGER_HOST,
          port: parseInt(process.env.JAEGER_PORT || '6832', 10),
          samplingRate: parseFloat(process.env.JAEGER_SAMPLING_RATE || '0.1'),
        }
      : undefined,
    zipkin: process.env.ZIPKIN_URL
      ? {
          url: process.env.ZIPKIN_URL,
          samplingRate: parseFloat(process.env.ZIPKIN_SAMPLING_RATE || '0.1'),
        }
      : undefined,
    openTelemetry: process.env.OTEL_ENDPOINT
      ? {
          endpoint: process.env.OTEL_ENDPOINT,
          headers: process.env.OTEL_HEADERS ? JSON.parse(process.env.OTEL_HEADERS) : {},
        }
      : undefined,
  },
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    path: process.env.HEALTH_CHECK_PATH || '/health',
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
  },
  apm: process.env.APM_SERVER_URL
    ? {
        enabled: process.env.APM_ENABLED === 'true',
        serviceName: process.env.APM_SERVICE_NAME || 'api',
        serverUrl: process.env.APM_SERVER_URL,
        secretToken: process.env.APM_SECRET_TOKEN,
        environment: process.env.NODE_ENV || 'development',
      }
    : undefined,
};
