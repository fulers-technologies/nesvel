import { Inject } from '@nestjs/common';
import { PUBSUB_SERVICE } from '@constants';

/**
 * Decorator for injecting the PubSub service into a class.
 *
 * This decorator is a convenience wrapper around NestJS's @Inject decorator,
 * providing a more semantic way to inject the PubSub service. It uses the
 * PUBSUB_SERVICE injection token to retrieve the service instance from the
 * NestJS dependency injection container.
 *
 * Using this decorator is equivalent to using @Inject(PUBSUB_SERVICE) but
 * provides better readability and makes the intent clearer.
 *
 * @returns A parameter decorator for dependency injection
 *
 * @example
 * Basic usage in a service:
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}
 *
 *   async createUser(userData: any) {
 *     // ... create user logic
 *     await this.pubsub.publish('user.created', userData);
 *   }
 * }
 * ```
 *
 * @example
 * Usage in a controller:
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}
 *
 *   @Post()
 *   async create(@Body() userData: CreateUserDto) {
 *     const user = await this.userService.create(userData);
 *     await this.pubsub.publish('user.created', user);
 *     return user;
 *   }
 * }
 * ```
 *
 * @example
 * Multiple injections:
 * ```typescript
 * @Injectable()
 * export class NotificationService {
 *   constructor(
 *     @InjectPubSub() private readonly pubsub: PubSubService,
 *     private readonly emailService: EmailService,
 *     private readonly logger: Logger,
 *   ) {}
 *
 *   async sendNotification(userId: string, message: string) {
 *     await this.emailService.send(userId, message);
 *     await this.pubsub.publish('notification.sent', { userId, message });
 *   }
 * }
 * ```
 */
export function InjectPubSub(): ParameterDecorator {
  return Inject(PUBSUB_SERVICE);
}
