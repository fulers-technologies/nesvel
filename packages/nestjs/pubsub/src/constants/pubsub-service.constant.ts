/**
 * Injection token for the PubSub service instance.
 *
 * This symbol is used as a dependency injection token to inject the main
 * PubSub service into consumers. The PubSubService is the primary interface
 * for pub/sub operations in application code.
 *
 * While you can inject the service using the PubSubService class directly,
 * using this token provides better decoupling and makes it easier to mock
 * the service in tests.
 *
 * For convenience, the @InjectPubSub() decorator is provided as a shorthand
 * for @Inject(PUBSUB_SERVICE).
 *
 * @example
 * Using the token directly:
 * ```typescript
 * import { Inject, Injectable } from '@nestjs/common';
 * import { PUBSUB_SERVICE, PubSubService } from '@nestjs-pubsub/core';
 *
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     @Inject(PUBSUB_SERVICE) private readonly pubsub: PubSubService
 *   ) {}
 *
 *   async createUser(data: any) {
 *     await this.pubsub.publish('user.created', data);
 *   }
 * }
 * ```
 *
 * @example
 * Using the @InjectPubSub() decorator (recommended):
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { InjectPubSub, PubSubService } from '@nestjs-pubsub/core';
 *
 * @Injectable()
 * export class UserService {
 *   constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}
 *
 *   async createUser(data: any) {
 *     await this.pubsub.publish('user.created', data);
 *   }
 * }
 * ```
 */
export const PUBSUB_SERVICE = Symbol('PUBSUB_SERVICE');
