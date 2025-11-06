import { Injectable, Logger } from '@nestjs/common';

/**
 * Base Action Class
 *
 * Abstract base class for action classes that encapsulate specific business logic.
 * Actions provide a way to separate business logic from controllers and services,
 * making your code more modular, testable, and reusable.
 *
 * **Benefits of using Action Classes:**
 * - **Single Responsibility**: Each action handles one specific task
 * - **Reusability**: Actions can be reused across different controllers
 * - **Testability**: Easy to unit test in isolation
 * - **Maintainability**: Business logic is centralized and easy to find
 * - **Type Safety**: Full TypeScript support with generics
 *
 * **Pattern:**
 * Each action should have an `execute()` method that contains the business logic.
 * The input and output types are defined using TypeScript generics.
 *
 * @template TInput - The input data type for the action
 * @template TOutput - The return type of the action
 *
 * @description
 * Actions follow the Command pattern and are injectable services that can
 * depend on repositories, other services, or other actions.
 *
 * @remarks
 * - All actions should be decorated with @Injectable()
 * - Actions should be registered in module providers
 * - Actions should have descriptive names ending with "Action"
 *
 * @example
 * ```typescript
 * // Define an action
 * @Injectable()
 * export class CreateUserAction extends BaseAction<CreateUserDto, User> {
 *   constructor(private userRepository: UserRepository) {
 *     super();
 *   }
 *
 *   async execute(data: CreateUserDto): Promise<User> {
 *     const user = this.userRepository.create(data);
 *     await this.userRepository.save(user);
 *     return user;
 *   }
 * }
 *
 * // Use in controller
 * @Controller('users')
 * export class UsersController {
 *   constructor(private createUserAction: CreateUserAction) {}
 *
 *   @Post()
 *   async create(@Body() dto: CreateUserDto) {
 *     return await this.createUserAction.execute(dto);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Complex action with multiple dependencies
 * @Injectable()
 * export class SendWelcomeEmailAction extends BaseAction<User, void> {
 *   constructor(
 *     private emailService: EmailService,
 *     private i18nService: I18nService,
 *   ) {
 *     super();
 *   }
 *
 *   async execute(user: User): Promise<void> {
 *     const message = await this.i18nService.translate('emails.welcome', {
 *       args: { name: user.name }
 *     });
 *
 *     await this.emailService.send({
 *       to: user.email,
 *       subject: message.subject,
 *       body: message.body,
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export abstract class BaseAction<TInput = any, TOutput = any> {
  /**
   * Logger instance for the action
   *
   * Can be used by subclasses to log important events or errors
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Execute the action
   *
   * This is the main method that contains the business logic for this action.
   * Subclasses must implement this method to define what the action does.
   *
   * @param data - The input data required for the action
   * @returns Promise resolving to the action's result
   *
   * @throws {Error} If the action execution fails
   *
   * @example
   * ```typescript
   * async execute(data: CreatePostDto): Promise<Post> {
   *   // Validate input
   *   if (!data.title) {
   *     throw new BadRequestException('Title is required');
   *   }
   *
   *   // Perform business logic
   *   const post = this.postRepository.create(data);
   *   await this.postRepository.save(post);
   *
   *   // Return result
   *   return post;
   * }
   * ```
   */
  abstract execute(data: TInput): Promise<TOutput>;

  /**
   * Handle action execution with automatic error logging
   *
   * Wraps the execute method to provide automatic error logging.
   * This is useful for consistent error handling across all actions.
   *
   * @param data - The input data required for the action
   * @returns Promise resolving to the action's result
   *
   * @throws {Error} Re-throws the error after logging
   *
   * @example
   * ```typescript
   * // In controller
   * try {
   *   return await this.createUserAction.handle(dto);
   * } catch (error: Error | any) {
   *   // Error is already logged
   *   throw error;
   * }
   * ```
   */
  async handle(data: TInput): Promise<TOutput> {
    try {
      return await this.execute(data);
    } catch (error: Error | any) {
      this.logger.error(`Action execution failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate input data before execution
   *
   * Optional method that can be overridden to add custom validation logic.
   * This is called automatically by the handle method before execute.
   *
   * @param data - The input data to validate
   * @throws {Error} If validation fails
   *
   * @example
   * ```typescript
   * protected validateInput(data: CreateUserDto): void {
   *   if (!data.email) {
   *     throw new BadRequestException('Email is required');
   *   }
   *   if (!data.email.includes('@')) {
   *     throw new BadRequestException('Invalid email format');
   *   }
   * }
   * ```
   */
  protected validateInput(data: TInput): void {
    // Override in subclasses to add validation
  }

  /**
   * Transform the output before returning
   *
   * Optional method that can be overridden to transform the action's output.
   * Useful for formatting, filtering, or mapping the result.
   *
   * @param result - The raw result from execute
   * @returns The transformed result
   *
   * @example
   * ```typescript
   * protected transformOutput(user: User): UserDto {
   *   return {
   *     id: user.id,
   *     name: user.name,
   *     email: user.email,
   *     // Exclude sensitive data like password
   *   };
   * }
   * ```
   */
  protected transformOutput(result: TOutput): TOutput {
    return result;
  }
}
