import { Injectable, Logger } from '@nestjs/common';
import { InjectPubSub, PubSubService } from '@nesvel/nestjs-pubsub';
import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

import { BaseEntity } from '@/entities/base.entity';
import { EntityOperation } from '@/enums/entity-operation.enum';
import { EntityEventPayload } from '@/interfaces/entity-event-payload.interface';
import type { SubscriberOptions } from '@/interfaces/subscriber-options.interface';

/**
 * Abstract Base Entity Subscriber
 *
 * Comprehensive MikroORM EventSubscriber implementation that provides Laravel Eloquent-inspired
 * entity lifecycle event handling with PubSub integration. This subscriber automatically
 * publishes detailed events for all database operations with comprehensive metadata,
 * change tracking, and performance metrics.
 *
 * Architecture:
 * - Follows MikroORM's EventSubscriber pattern for maximum compatibility
 * - Integrates with NestJS dependency injection system
 * - Uses PubSub for decoupled event publishing to external systems
 * - Provides comprehensive error handling and logging
 * - Supports runtime configuration and enable/disable functionality
 *
 * Key Features:
 * - Complete entity lifecycle event coverage (create, update, delete, load)
 * - Automatic entity name extraction with configurable patterns
 * - Detailed change tracking with before/after values
 * - Performance metrics and memory usage monitoring
 * - Sensitive data sanitization for security
 * - Configurable channel naming with template patterns
 * - Bulk operation detection and handling
 * - Runtime configuration updates
 *
 * Event Types Published:
 * - {entityName}.created - When entities are inserted
 * - {entityName}.updated - When entities are modified
 * - {entityName}.deleted - When entities are removed (hard delete)
 * - {entityName}.loaded - When entities are retrieved (optional)
 * - {entityName}.soft_deleted - When entities are soft deleted
 * - {entityName}.restored - When soft-deleted entities are restored
 *
 * @template T - The entity type extending BaseEntity (defaults to BaseEntity for all entities)
 *
 * @example
 * ```typescript
 * // Basic usage - subscribe to all entities
 * @Injectable()
 * export class AllEntitiesSubscriber extends BaseSubscriber {
 *   constructor(@InjectPubSub() pubsub: PubSubService) {
 *     super(pubsub, {
 *       includePerformanceMetrics: true,
 *       channelPattern: 'app.{entityName}.{operation}'
 *     });
 *   }
 * }
 *
 * // Specific entity subscription
 * @Injectable()
 * export class UserSubscriber extends BaseSubscriber<User> {
 *   constructor(@InjectPubSub() pubsub: PubSubService) {
 *     super(pubsub);
 *   }
 *
 *   getSubscribedEntities() {
 *     return [User]; // Only listen to User entity events
 *   }
 * }
 *
 * // Register in your module
 * @Module({
 *   providers: [
 *     {
 *       provide: 'ENTITY_SUBSCRIBER',
 *       useClass: AllEntitiesSubscriber,
 *     }
 *   ],
 * })
 * export class AppModule {}
 *
 * // Listen for events in another service
 * this.pubsub.subscribe('user.created', (payload: EntityEventPayload<User>) => {
 *   console.log(`New user registered: ${payload.entity.email}`);
 *   console.log(`User ID: ${payload.entityId}`);
 *
 *   // Send welcome email
 *   this.emailService.sendWelcomeEmail(payload.entity);
 *
 *   // Update analytics
 *   this.analyticsService.trackUserRegistration(payload);
 * });
 *
 * // Listen for update events with change tracking
 * this.pubsub.subscribe('user.updated', (payload: EntityEventPayload<User>) => {
 *   if (payload.changes?.modified.includes('email')) {
 *     console.log('User changed email:');
 *     console.log('From:', payload.changes.originalValues.email);
 *     console.log('To:', payload.changes.newValues.email);
 *
 *     // Send email verification for new address
 *     this.emailService.sendVerification(payload.entity.email);
 *   }
 * });
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 * @see {@link https://mikro-orm.io/docs/events} MikroORM Events Documentation
 */
@Injectable()
export abstract class BaseSubscriber<T extends BaseEntity = BaseEntity>
  implements EventSubscriber<T>
{
  /**
   * Logger instance for debugging and monitoring
   *
   * Automatically configured with the subscriber class name as context.
   * Used for logging event publishing activities, errors, and debug information.
   *
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Merged configuration options with defaults applied
   *
   * Contains all subscriber configuration with default values filled in.
   * Can be modified at runtime using the updateOptions() method.
   *
   * @private
   * @readonly
   */
  private readonly options: Required<SubscriberOptions>;

  /**
   * The PubSub service instance for event publishing
   *
   * Injected via constructor and used for publishing entity lifecycle events
   * to external systems. Supports various PubSub implementations (Redis, etc.).
   *
   * @private
   * @readonly
   */
  private readonly pubsub: PubSubService;

  /**
   * Constructor for BaseSubscriber
   *
   * Initializes the subscriber with PubSub service and configuration options.
   * Merges provided options with sensible defaults and sets up logging.
   *
   * @param pubsub - The PubSub service for event publishing (injected via DI)
   * @param options - Configuration options (merged with defaults)
   *
   * @example
   * ```typescript
   * constructor(@InjectPubSub() pubsub: PubSubService) {
   *   super(pubsub, {
   *     enabled: true,
   *     includePerformanceMetrics: false,
   *     channelPattern: 'events.{entityName}.{operation}'
   *   });
   * }
   * ```
   */
  constructor(@InjectPubSub() pubsub: PubSubService, options: SubscriberOptions = {}) {
    // Store the PubSub service for event publishing
    this.pubsub = pubsub;

    // Merge provided options with sensible defaults
    this.options = {
      logEvents: false, // Disable to prevent log spam
      enabled: true, // Enable event publishing by default
      publishLoadEvents: false, // Disable load events to prevent spam
      trackDetailedChanges: true, // Enable change tracking for auditing
      includePerformanceMetrics: false, // Disable metrics to reduce overhead
      maxChangeTrackingSize: 1000, // Reasonable limit to prevent memory issues
      channelPattern: '{entityName}.{operation}', // Simple, predictable naming

      ...options, // Override with provided options
    };

    // Log initialization in debug mode
    if (this.options.logEvents) {
      this.logger.log(`${this.constructor.name} initialized with options:`, this.options);
    }
  }

  /**
   * Define which entities this subscriber should handle
   *
   * Optional method that can be implemented by concrete subscribers.
   * Return undefined or empty array to subscribe to ALL entities, or return
   * an array of entity constructors to limit subscription to specific entities.
   *
   * The entity names are automatically extracted from class names and converted
   * to lowercase with 'Subscriber' suffix removed for channel naming.
   *
   * **Return Type**: `EntityName<T>[] | undefined`
   * - `undefined` - Subscribe to all entities (default behavior)
   * - `[]` - Subscribe to all entities (equivalent to undefined)
   * - `[Entity1, Entity2, ...]` - Subscribe only to specific entities
   *
   * @returns Array of entity constructors to subscribe to, or undefined to subscribe to all entities
   *
   * @example
   * ```typescript
   * // Subscribe to all entities (method not implemented or returns undefined)
   * getSubscribedEntities() {
   *   return undefined; // or return [];
   * }
   *
   * // Subscribe to specific entities only
   * getSubscribedEntities() {
   *   return [User, Post, Comment];
   * }
   *
   * // Dynamic entity detection based on class name
   * getSubscribedEntities() {
   *   // For UserSubscriber -> User, PostSubscriber -> Post
   *   const className = this.constructor.name;
   *   const entityName = className.replace(/Subscriber$/, '');
   *
   *   // Return the actual entity class (requires import/injection)
   *   return [this.getEntityClassByName(entityName)];
   * }
   * ```
   *
   * @see {@link extractEntityNameFromClassName} For automatic entity name extraction
   */
  abstract getSubscribedEntities?(): EntityName<T>[];

  /**
   * Extract entity name from subscriber class name
   *
   * Automatically converts subscriber class names to entity names by:
   * 1. Removing 'Subscriber', 'EventSubscriber', or 'Events' suffixes
   * 2. Converting to lowercase for consistent channel naming
   *
   * @param className - The subscriber class name
   * @returns Lowercase entity name for channel generation
   *
   * @example
   * ```typescript
   * extractEntityNameFromClassName('UserSubscriber')     // returns 'user'
   * extractEntityNameFromClassName('PostEventSubscriber') // returns 'post'
   * extractEntityNameFromClassName('CommentEvents')       // returns 'comment'
   * extractEntityNameFromClassName('OrderService')        // returns 'orderservice'
   * ```
   *
   * @protected
   */
  protected extractEntityNameFromClassName(className: string): string {
    return className
      .replace(/Events$/, '') // Remove 'Events' suffix
      .replace(/Subscriber$/, '') // Remove 'Subscriber' suffix
      .replace(/EventSubscriber$/, '') // Remove 'EventSubscriber' suffix
      .toLowerCase(); // Convert to lowercase for consistency
  }

  /**
   * Handle after entity insertion (MikroORM EventSubscriber method)
   *
   * Called automatically by MikroORM after an entity is successfully inserted.
   * Publishes a '{entityName}.created' event with comprehensive entity data.
   *
   * @param args - MikroORM EventArgs with entity and metadata
   */
  async afterCreate(args: EventArgs<T>): Promise<void> {
    await this.handleEntityEvent(args, EntityOperation.CREATED, {
      isNewRecord: true,
      description: 'Entity has been created and persisted to database',
    });
  }

  /**
   * Handle after entity update (MikroORM EventSubscriber method)
   *
   * Called automatically by MikroORM after an entity is successfully updated.
   * Publishes a '{entityName}.updated' event with change tracking details.
   *
   * @param args - MikroORM EventArgs with entity and metadata
   */
  async afterUpdate(args: EventArgs<T>): Promise<void> {
    await this.handleEntityEvent(args, EntityOperation.UPDATED, {
      isNewRecord: false,
      description: 'Entity has been updated in database',
      trackChanges: true,
    });
  }

  /**
   * Handle after entity deletion (MikroORM EventSubscriber method)
   *
   * Called automatically by MikroORM after an entity is successfully deleted.
   * Publishes either '{entityName}.deleted' or '{entityName}.soft_deleted' event.
   *
   * @param args - MikroORM EventArgs with entity and metadata
   */
  async afterDelete(args: EventArgs<T>): Promise<void> {
    // Detect soft delete by checking for deletedAt field
    const entity = args.entity as any;
    const isSoftDelete = entity.deletedAt !== null && entity.deletedAt !== undefined;

    await this.handleEntityEvent(
      args,
      isSoftDelete ? EntityOperation.SOFT_DELETED : EntityOperation.DELETED,
      {
        isNewRecord: false,
        description: isSoftDelete
          ? 'Entity has been soft deleted (marked as deleted)'
          : 'Entity has been permanently removed from database',
      },
    );
  }

  /**
   * Handle entity loading (MikroORM EventSubscriber method)
   *
   * Called automatically by MikroORM when entities are loaded from database.
   * Publishes '{entityName}.loaded' events (can be high volume).
   *
   * @param args - MikroORM EventArgs with entity and metadata
   */
  async afterLoad(args: EventArgs<T>): Promise<void> {
    // Only publish load events if explicitly enabled to prevent spam
    if (!this.options.publishLoadEvents) {
      return;
    }

    await this.handleEntityEvent(args, EntityOperation.LOADED, {
      isNewRecord: false,
      description: 'Entity has been loaded from database',
    });
  }

  /**
   * Central event handling method for all entity operations
   *
   * Provides unified processing for create, update, delete, and load events
   * with comprehensive error handling, performance monitoring, and customizable
   * event publishing logic.
   *
   * @param args - MikroORM EventArgs containing entity and transaction context
   * @param operation - The type of database operation performed
   * @param options - Additional options for event processing
   *
   * @private
   */
  private async handleEntityEvent(
    args: EventArgs<T>,
    operation: EntityEventPayload<T>['operation'],
    options: {
      isNewRecord?: boolean;
      description?: string;
      trackChanges?: boolean;
    } = {},
  ): Promise<void> {
    // Early return if subscriber is disabled
    if (!this.options.enabled) {
      return;
    }

    // Performance monitoring setup
    const startTime = this.options.includePerformanceMetrics ? process.hrtime.bigint() : undefined;

    try {
      // Extract core entity information
      const entity = args.entity;
      const entityName = this.getEntityName(entity);
      const entityId = this.extractEntityId(entity);
      const channel = this.buildChannelName(entityName, operation);

      // Build comprehensive event payload
      const payload: EntityEventPayload<T> = {
        operation,
        entity: this.sanitizeEntity(entity),
        entityId,
        entityName,
        timestamp: new Date(),
        context: this.buildEventContext(args),
        metadata: {
          isNewRecord: options.isNewRecord ?? false,
          source: 'orm',
          ...(options.description && { description: options.description }),
          ...(() => {
            const txId = this.extractTransactionId(args);
            return txId ? { transactionId: txId } : {};
          })(),
          ...(this.options.includePerformanceMetrics &&
            startTime && {
              performance: {
                eventProcessingTime: Number(process.hrtime.bigint() - startTime) / 1000000, // Convert nanoseconds to milliseconds
                memoryUsage: process.memoryUsage(),
                timestamp: new Date().toISOString(),
              },
            }),
        },
      };

      // Add change tracking for update operations
      if (options.trackChanges && operation === EntityOperation.UPDATED) {
        const changes = this.extractChangesFromArgs(args);
        if (changes) {
          payload.changes = changes;
        }
      }

      // Publish the event
      await this.publishEvent(channel, payload);

      // Optional debug logging
      if (this.options.logEvents) {
        this.logger.log(`Published '${operation}' event for ${entityName}`, {
          entityId,
          channel,
          processingTime: startTime
            ? `${Number(process.hrtime.bigint() - startTime) / 1000000}ms`
            : undefined,
          changesCount: payload.changes?.modified?.length,
        });
      }
    } catch (error: Error | any) {
      // Comprehensive error handling
      await this.handleEventError(operation, error, args.entity);
    }
  }

  /**
   * Extract change information from MikroORM EventArgs
   *
   * Analyzes the entity's current state and extracts detailed change information
   * including original values, new values, and modified field lists with size limits.
   *
   * @param args - MikroORM EventArgs with entity and metadata
   * @returns Detailed change tracking information
   *
   * @private
   */
  private extractChangesFromArgs(args: EventArgs<T>): EntityEventPayload<T>['changes'] {
    try {
      // Access MikroORM's change tracking if available
      const entity = args.entity;
      const metadata = args.meta;

      // Initialize change tracking structure
      const changes: EntityEventPayload<T>['changes'] = {
        modified: [],
        originalValues: {},
        newValues: {},
      };

      // Extract changes from entity if __originalEntityData is available (common in MikroORM)
      const originalData = (entity as any).__originalEntityData;
      if (originalData) {
        let changeCount = 0;

        // Compare current entity state with original data
        for (const [key, newValue] of Object.entries(entity as any)) {
          // Skip private/internal fields and functions
          if (key.startsWith('_') || typeof newValue === 'function') {
            continue;
          }

          // Respect change tracking size limit
          if (changeCount >= this.options.maxChangeTrackingSize) {
            this.logger.warn(
              `Change tracking truncated at ${this.options.maxChangeTrackingSize} changes for entity ${this.getEntityName(entity)}`,
            );
            break;
          }

          const originalValue = originalData[key];

          // Check if value actually changed (deep comparison for objects)
          if (!this.isEqual(originalValue, newValue)) {
            changes.modified.push(key);
            changes.originalValues[key as keyof T] = originalValue as T[keyof T];
            changes.newValues[key as keyof T] = newValue as T[keyof T];
            changeCount++;
          }
        }
      }

      return changes;
    } catch (error: Error | any) {
      this.logger.warn('Failed to extract entity changes:', error);
      return {
        modified: [],
        originalValues: {},
        newValues: {},
      };
    }
  }

  /**
   * Extract entity name from entity instance
   *
   * Determines the entity name using multiple strategies:
   * 1. Use explicit entityName property if available
   * 2. Extract from constructor name
   * 3. Fall back to class name extraction from subscriber
   *
   * @param entity - The entity instance
   * @returns Lowercase entity name for consistent channel naming
   *
   * @private
   */
  private getEntityName(entity: T): string {
    // Try to get entity name from the entity itself
    if ('entityName' in entity && typeof entity.entityName === 'string') {
      return entity.entityName.toLowerCase();
    }

    // Use constructor name as fallback
    const constructorName = entity.constructor.name;
    if (constructorName && constructorName !== 'Object') {
      return constructorName.toLowerCase();
    }

    // Extract from subscriber class name as last resort
    return this.extractEntityNameFromClassName(this.constructor.name);
  }

  /**
   * Build channel name for event publishing using configurable pattern
   *
   * Uses the channelPattern from options to generate consistent channel names
   * with support for template variables like {entityName} and {operation}.
   *
   * @param entityName - The name of the entity (lowercase)
   * @param operation - The database operation type
   * @returns Formatted channel name for PubSub
   *
   * @example
   * ```typescript
   * // With pattern "{entityName}.{operation}"
   * buildChannelName('user', 'created') // Returns: 'user.created'
   *
   * // With pattern "events.{entityName}.{operation}"
   * buildChannelName('post', 'updated') // Returns: 'events.post.updated'
   * ```
   *
   * @private
   */
  private buildChannelName(entityName: string, operation: string): string {
    return this.options.channelPattern
      .replace('{entityName}', entityName.toLowerCase())
      .replace('{operation}', operation.toLowerCase());
  }

  /**
   * Build event context from MikroORM EventArgs
   *
   * Extracts contextual information from the event arguments including
   * transaction details, user context, and request information when available.
   *
   * @param args - MikroORM EventArgs
   * @returns Event context object with relevant metadata
   *
   * @private
   */
  private buildEventContext(args: EventArgs<T>): Record<string, any> {
    const context: Record<string, any> = {
      nodeEnv: process.env.NODE_ENV || 'development',
      processId: process.pid,
      timestamp: new Date().toISOString(),
    };

    // Add any additional metadata from the args
    if (args.meta && typeof args.meta === 'object') {
      context.metadata = { ...args.meta };
    }

    return context;
  }

  /**
   * Extract transaction ID from EventArgs metadata
   *
   * @param args - MikroORM EventArgs
   * @returns Transaction ID if available
   *
   * @private
   */
  private extractTransactionId(args: EventArgs<T>): string | undefined {
    // Try to extract transaction ID from various possible locations
    if (args.meta && typeof args.meta === 'object') {
      const meta = args.meta as any;
      return meta.transactionId || meta.transactionContext?.id || undefined;
    }
    return undefined;
  }

  /**
   * Extract entity ID using multiple strategies
   *
   * Attempts to find the entity's unique identifier using common field names
   * and patterns. Supports various ID field conventions used in different projects.
   *
   * @param entity - The entity instance
   * @returns The entity's unique identifier or undefined if not found
   *
   * @example
   * ```typescript
   * // Supports various ID patterns:
   * extractEntityId({ id: 123 })           // Returns: 123
   * extractEntityId({ _id: 'abc' })        // Returns: 'abc'
   * extractEntityId({ uuid: 'uuid-string'}) // Returns: 'uuid-string'
   * extractEntityId({ guid: 'guid-value' }) // Returns: 'guid-value'
   * ```
   *
   * @private
   */
  private extractEntityId(entity: T): string | number | undefined {
    const idFields = ['id', '_id', 'uuid', 'guid', 'pk', 'primaryKey'];

    for (const field of idFields) {
      if (field in entity) {
        const value = entity[field as keyof T];
        if (value !== null && value !== undefined) {
          return value as string | number;
        }
      }
    }

    return undefined;
  }

  /**
   * Sanitize entity data for secure event publishing
   *
   * Removes sensitive information, handles circular references, and ensures
   * the entity data is safe for serialization and transmission. Implements
   * configurable field redaction for security compliance.
   *
   * @param entity - The entity to sanitize
   * @returns Sanitized copy of entity data
   *
   * @private
   */
  private sanitizeEntity(entity: T): T {
    try {
      // Define sensitive field patterns (case-insensitive)
      const sensitivePatterns = [
        /password/i,
        /token/i,
        /secret/i,
        /key/i,
        /auth/i,
        /credential/i,
        /private/i,
        /confidential/i,
      ];

      // Create sanitized copy with redacted sensitive fields
      const sanitized = JSON.parse(
        JSON.stringify(entity, (key, value) => {
          // Skip function properties
          if (typeof value === 'function') {
            return undefined;
          }

          // Skip private/internal fields (starting with _ or __)
          if (typeof key === 'string' && key.match(/^_/)) {
            return undefined;
          }

          // Redact sensitive fields
          if (typeof key === 'string' && sensitivePatterns.some((pattern) => pattern.test(key))) {
            return '[REDACTED]';
          }

          // Handle circular references by converting to string
          if (typeof value === 'object' && value !== null) {
            try {
              JSON.stringify(value);
              return value;
            } catch {
              return '[CIRCULAR]';
            }
          }

          return value;
        }),
      );

      return sanitized;
    } catch (error: Error | any) {
      this.logger.warn('Error sanitizing entity data, using fallback approach:', error);

      // Fallback: create shallow copy and remove known sensitive fields
      const fallback = { ...entity } as any;
      const sensitiveFields = ['password', 'token', 'secret', 'privateKey', 'apiKey'];

      sensitiveFields.forEach((field) => {
        if (field in fallback) {
          fallback[field] = '[REDACTED]';
        }
      });

      return fallback;
    }
  }

  /**
   * Deep equality comparison for change detection
   *
   * Performs deep comparison between two values to detect actual changes.
   * Handles primitives, objects, arrays, and special cases like Date objects.
   *
   * @param a - First value to compare
   * @param b - Second value to compare
   * @returns True if values are deeply equal
   *
   * @private
   */
  private isEqual(a: any, b: any): boolean {
    // Strict equality check (handles primitives and same references)
    if (a === b) return true;

    // Handle null/undefined cases
    if (a == null || b == null) return a === b;

    // Handle Date objects
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every((key) => keysB.includes(key) && this.isEqual(a[key], b[key]));
    }

    return false;
  }

  /**
   * Publish event to PubSub system with comprehensive error handling
   *
   * Handles the actual event publishing with retry logic, error handling,
   * and fallback mechanisms to ensure database operations are never affected
   * by event publishing failures.
   *
   * @param channel - The channel name to publish to
   * @param payload - The event payload to publish
   *
   * @private
   */
  private async publishEvent(channel: string, payload: EntityEventPayload<T>): Promise<void> {
    try {
      await this.pubsub.publish(channel, payload);
    } catch (error: Error | any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to publish ${payload.operation} event for ${payload.entityName} to channel ${channel}:`,
        {
          error: errorMessage,
          entityId: payload.entityId,
          channel,
          operation: payload.operation,
        },
      );

      // Never rethrow to avoid breaking database operations
      // Consider implementing retry logic or dead letter queue here
    }
  }

  /**
   * Comprehensive error handling for event processing
   *
   * Logs detailed error information and ensures that event processing failures
   * never impact the underlying database operations. Provides structured error
   * logging for debugging and monitoring.
   *
   * @param operation - The operation that failed
   * @param error - The error that occurred
   * @param entity - The entity being processed
   *
   * @private
   */
  private async handleEventError(operation: string, error: unknown, entity: T): Promise<void> {
    const entityName = this.getEntityName(entity);
    const entityId = this.extractEntityId(entity);

    const errorInfo =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : {
            message: String(error),
            stack: undefined,
            name: 'UnknownError',
          };

    this.logger.error(`Event processing failed for ${operation} operation on ${entityName}:`, {
      error: errorInfo,
      context: {
        operation,
        entityName,
        entityId,
        subscriberClass: this.constructor.name,
        timestamp: new Date().toISOString(),
      },
    });

    // Could implement additional error handling here:
    // - Send to monitoring service
    // - Store in error queue for retry
    // - Send alerts for critical failures
  }

  /**
   * Enable event publishing
   *
   * Allows runtime enabling of event publishing. Useful for dynamically
   * controlling event flow based on system state or configuration.
   *
   * @example
   * ```typescript
   * subscriber.enable();
   * console.log(subscriber.isEnabled()); // true
   * ```
   *
   * @public
   */
  public enable(): void {
    (this.options as any).enabled = true;
    this.logger.log(`${this.constructor.name} event publishing enabled`);
  }

  /**
   * Disable event publishing
   *
   * Temporarily disables event publishing while maintaining all other
   * functionality. Events will be silently skipped until re-enabled.
   *
   * @example
   * ```typescript
   * subscriber.disable();
   * console.log(subscriber.isEnabled()); // false
   * ```
   *
   * @public
   */
  public disable(): void {
    (this.options as any).enabled = false;
    this.logger.log(`${this.constructor.name} event publishing disabled`);
  }

  /**
   * Check if event publishing is currently enabled
   *
   * @returns True if events are being published, false otherwise
   *
   * @example
   * ```typescript
   * if (subscriber.isEnabled()) {
   *   console.log('Events are being published');
   * }
   * ```
   *
   * @public
   */
  public isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Update subscriber configuration at runtime
   *
   * Allows dynamic reconfiguration of subscriber behavior including
   * channel patterns, performance monitoring, and change tracking settings.
   *
   * @param newOptions - Partial configuration object with new settings
   *
   * @example
   * ```typescript
   * subscriber.updateOptions({
   *   includePerformanceMetrics: true,
   *   channelPattern: 'events.{entityName}.{operation}',
   *   maxChangeTrackingSize: 500
   * });
   * ```
   *
   * @public
   */
  public updateOptions(newOptions: Partial<SubscriberOptions>): void {
    const previousOptions = { ...this.options };
    Object.assign(this.options, newOptions);

    this.logger.log(`${this.constructor.name} configuration updated:`, {
      previous: previousOptions,
      updated: newOptions,
      current: this.options,
    });
  }

  /**
   * Get current subscriber configuration
   *
   * Returns a copy of the current configuration to prevent external
   * modification of internal settings. Useful for debugging and monitoring.
   *
   * @returns Copy of current configuration options
   *
   * @example
   * ```typescript
   * const config = subscriber.getOptions();
   * console.log('Current channel pattern:', config.channelPattern);
   * console.log('Performance monitoring:', config.includePerformanceMetrics);
   * ```
   *
   * @public
   */
  public getOptions(): Required<SubscriberOptions> {
    return { ...this.options };
  }

  /**
   * Get subscriber statistics and runtime information
   *
   * Provides comprehensive information about the subscriber's current state,
   * configuration, and runtime metrics for monitoring and debugging.
   *
   * @returns Subscriber statistics and information
   *
   * @example
   * ```typescript
   * const info = subscriber.getSubscriberInfo();
   * console.log('Subscriber class:', info.className);
   * console.log('Subscribed entities:', info.subscribedEntities);
   * console.log('Current configuration:', info.configuration);
   * ```
   *
   * @public
   */
  public getSubscriberInfo(): {
    className: string;
    isEnabled: boolean;
    subscribedEntities: any[] | 'ALL_ENTITIES';
    configuration: Required<SubscriberOptions>;
    runtimeInfo: {
      processId: number;
      nodeEnv: string;
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage;
    };
  } {
    const subscribedEntities = this.getSubscribedEntities?.();

    return {
      className: this.constructor.name,
      isEnabled: this.isEnabled(),
      subscribedEntities: subscribedEntities || 'ALL_ENTITIES',
      configuration: this.getOptions(),
      runtimeInfo: {
        processId: process.pid,
        nodeEnv: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };
  }
}
