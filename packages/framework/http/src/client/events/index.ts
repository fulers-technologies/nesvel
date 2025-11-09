/**
 * HTTP Client Events
 *
 * Event classes for observing HTTP requests using @nestjs/event-emitter.
 * These events integrate seamlessly with NestJS's event system.
 *
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { OnEvent } from '@nestjs/event-emitter';
 * import { RequestSendingEvent, ResponseReceivedEvent } from '@nesvel/nestjs-http';
 *
 * @Injectable()
 * export class HttpEventListener {
 *   @OnEvent('http.request.sending')
 *   logRequest(event: RequestSendingEvent) {
 *     console.log('Request:', event.request.method(), event.request.url());
 *   }
 *
 *   @OnEvent('http.response.received')
 *   logResponse(event: ResponseReceivedEvent) {
 *     console.log('Response:', event.response.status(), event.durationMs + 'ms');
 *   }
 * }
 * ```
 */

export * from './http-event';
export * from './request-sending.event';
export * from './response-received.event';
export * from './connection-failed.event';

// Re-export @nestjs/event-emitter for convenience
export * from '@nestjs/event-emitter';
