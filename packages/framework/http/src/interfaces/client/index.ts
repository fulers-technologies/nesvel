/**
 * Client Interfaces
 *
 * All interfaces for client-side HTTP handling.
 */

// Request/Response interfaces
export * from './http-request-config.interface';
export * from './recorded-request.interface';
export * from './fake-options.interface';
export * from './pool-request.interface';
export * from './pool-result.interface';
export * from './file-attachment.interface';

// Circuit Breaker
export * from './circuit-breaker-options.interface';
export * from './circuit-breaker-metrics.interface';

// Retry Strategy
export * from './retry-context.interface';
export * from './retry-strategy.interface';
export * from './exponential-backoff-options.interface';

// HTTP Events
export * from './http-event.interface';
export * from './request-sending-event.interface';
export * from './response-received-event.interface';
export * from './connection-failed-event.interface';

// Concerns
export * from './concerns';
