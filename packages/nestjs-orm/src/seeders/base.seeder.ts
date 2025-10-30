import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEntity } from '@/entities/base.entity';
import { FactoryManager } from '@/factories/factory.manager';
import type { ISeeder, ISeederConfig, ISeederContext, ISeederResult } from '@/interfaces';

/**
 * Abstract Base Seeder
 *
 * Laravel Eloquent-inspired seeder implementation for NestJS with MikroORM.
 * Provides a structured approach to database seeding with factory integration,
 * dependency management, environment controls, and comprehensive logging.
 *
 * Features:
 * - Integration with factory system for data generation
 * - Environment-based execution controls
 * - Dependency management and execution ordering
 * - Transaction support for data consistency
 * - Progress tracking and detailed logging
 * - Rollback capabilities for cleanup
 * - Idempotent execution patterns
 *
 * @example
 * ```typescript
 * @Seeder({
 *   priority: 1,
 *   environments: ['development', 'testing'],
 *   dependencies: [RoleSeeder],
 *   description: 'Creates initial user accounts'
 * })
 * export class UserSeeder extends BaseSeeder {
 *   async run(): Promise<void> {
 *     this.info('Seeding users...');
 *
 *     // Check if users already exist
 *     const existingUsers = await this.entityManager.count(User);
 *     if (existingUsers > 0) {
 *       this.info('Users already exist, skipping seeding');
 *       return;
 *     }
 *
 *     // Create admin user
 *     const admin = await this.factoryManager
 *       .get(User)
 *       .state('admin')
 *       .create({ email: 'admin@example.com' });
 *
 *     // Create regular users
 *     const users = await this.factoryManager.createMany(User, 50);
 *
 *     this.success(`Created ${users.length + 1} users successfully`);
 *   }
 *
 *   async rollback(): Promise<void> {
 *     this.info('Rolling back users...');
 *     await this.entityManager.nativeDelete(User, {
 *       email: { $like: '%@example.com' }
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseSeeder implements ISeeder {
  /**
   * Logger instance for seeder output
   *
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * MikroORM EntityManager for database operations
   *
   * @protected
   * @readonly
   */
  protected readonly entityManager: EntityManager;

  /**
   * Factory manager for creating test data
   *
   * @protected
   * @readonly
   */
  protected readonly factoryManager: FactoryManager;

  /**
   * Seeder execution context
   *
   * @protected
   * @readonly
   */
  protected readonly context: ISeederContext;

  /**
   * Seeder configuration
   *
   * @private
   * @readonly
   */
  private readonly config: Required<ISeederConfig>;

  /**
   * Constructor
   *
   * @param entityManager - MikroORM EntityManager instance
   * @param factoryManager - Factory manager for data creation
   * @param context - Execution context
   * @param config - Seeder configuration options
   */
  constructor(
    entityManager: EntityManager,
    factoryManager: FactoryManager,
    context: ISeederContext,
    config: ISeederConfig = {},
  ) {
    this.entityManager = entityManager;
    this.factoryManager = factoryManager;
    this.context = context;

    // Apply default configuration
    this.config = {
      priority: 0,
      runInProduction: false,
      environments: ['development', 'testing', 'local'],
      useTransactions: true,
      description: `Seeds data using ${this.constructor.name}`,
      dependencies: [],
      skipIfExists: false,
      ...config,
    };
  }

  /**
   * Abstract run method - must be implemented by concrete seeders
   *
   * @returns Promise resolving when seeding is complete
   */
  abstract run(): Promise<void>;

  /**
   * Optional rollback method - can be overridden by concrete seeders
   *
   * @returns Promise resolving when rollback is complete
   */
  public async rollback(): Promise<void> {
    this.warn('No rollback method implemented for this seeder');
  }

  /**
   * Get seeder configuration
   *
   * @returns Seeder configuration object
   */
  public getConfig(): Required<ISeederConfig> {
    return { ...this.config };
  }

  /**
   * Check if seeder should run in current environment
   *
   * @returns True if seeder should run
   */
  public shouldRun(): boolean {
    // Check force flag
    if (this.context.force) {
      return true;
    }

    // Check production restriction
    if (this.context.environment === 'production' && !this.config.runInProduction) {
      return false;
    }

    // Check environment allowlist
    return this.config.environments.includes(this.context.environment);
  }

  /**
   * Get seeder dependencies
   *
   * @returns Array of seeder constructor dependencies
   */
  public getDependencies(): (new () => ISeeder)[] {
    return [...this.config.dependencies];
  }

  /**
   * Get seeder priority for execution ordering
   *
   * @returns Priority number (lower runs first)
   */
  public getPriority(): number {
    return this.config.priority;
  }

  /**
   * Execute the seeder with full lifecycle management
   *
   * @returns Promise resolving to execution result
   */
  public async execute(): Promise<ISeederResult> {
    const startTime = Date.now();
    const seederName = this.constructor.name;

    try {
      this.info(`Starting seeder: ${seederName}`);
      this.debug(`Configuration: ${JSON.stringify(this.config)}`);

      // Check if seeder should run
      if (!this.shouldRun()) {
        const message = `Skipping ${seederName} - not allowed in ${this.context.environment} environment`;
        this.warn(message);
        return this.createResult(seederName, false, Date.now() - startTime, 0, message);
      }

      let recordsAffected = 0;

      // Execute with or without transaction based on configuration
      if (this.config.useTransactions) {
        await this.entityManager.transactional(async (em) => {
          // Temporarily replace entityManager with transactional one
          const originalEm = (this as any).entityManager;
          (this as any).entityManager = em;

          try {
            await this.run();
            // TODO: Implement record counting logic
            recordsAffected = await this.getRecordsAffected();
          } finally {
            (this as any).entityManager = originalEm;
          }
        });
      } else {
        await this.run();
        recordsAffected = await this.getRecordsAffected();
      }

      const executionTime = Date.now() - startTime;
      this.success(
        `Completed ${seederName} in ${executionTime}ms (${recordsAffected} records affected)`,
      );

      return this.createResult(seederName, true, executionTime, recordsAffected);
    } catch (error: Error | any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.error(`Failed to execute ${seederName}: ${errorMessage}`);
      this.debug(`Error details:`, error);

      return this.createResult(seederName, false, executionTime, 0, errorMessage);
    }
  }

  /**
   * Get number of records affected by the seeder
   *
   * Override this method in concrete seeders to provide accurate counts.
   *
   * @returns Promise resolving to number of records affected
   * @protected
   */
  protected async getRecordsAffected(): Promise<number> {
    // Default implementation - override in concrete seeders for accurate counting
    return 0;
  }

  /**
   * Create a seeder execution result
   *
   * @param seederName - Name of the seeder
   * @param success - Whether execution was successful
   * @param executionTime - Time taken in milliseconds
   * @param recordsAffected - Number of records affected
   * @param error - Error message if failed
   * @returns Seeder result object
   *
   * @private
   */
  private createResult(
    seederName: string,
    success: boolean,
    executionTime: number,
    recordsAffected = 0,
    error?: string,
  ): ISeederResult {
    return {
      seederName,
      success,
      executionTime,
      recordsAffected,
      error: error || '',
      executedAt: new Date(),
      metadata: {
        environment: this.context.environment,
        config: this.config,
      },
    };
  }

  //============================================================================
  // Utility Methods for Seeders
  //============================================================================

  /**
   * Check if an entity exists by criteria
   *
   * @param entityClass - Entity class to check
   * @param criteria - Search criteria
   * @returns Promise resolving to true if entity exists
   *
   * @protected
   */
  protected async exists<T extends BaseEntity>(
    entityClass: new () => T,
    criteria: any,
  ): Promise<boolean> {
    const count = await this.entityManager.count(entityClass, criteria);
    return count > 0;
  }

  /**
   * Create entity if it doesn't exist
   *
   * @param entityClass - Entity class to create
   * @param criteria - Criteria to check existence
   * @param attributes - Attributes for creation
   * @returns Promise resolving to created or existing entity
   *
   * @protected
   */
  protected async createIfNotExists<T extends BaseEntity>(
    entityClass: new () => T,
    criteria: any,
    attributes: Partial<T>,
  ): Promise<T> {
    let entity = await this.entityManager.findOne(entityClass, criteria);

    if (!entity) {
      entity = await this.factoryManager.create(entityClass, attributes);
      this.debug(`Created ${entityClass.name}:`, criteria);
    } else {
      this.debug(`${entityClass.name} already exists:`, criteria);
    }

    return entity;
  }

  /**
   * Create multiple entities with progress tracking
   *
   * @param entityClass - Entity class to create
   * @param count - Number of entities to create
   * @param attributes - Base attributes for creation
   * @param batchSize - Number of entities to create per batch
   * @returns Promise resolving to array of created entities
   *
   * @protected
   */
  protected async createMany<T extends BaseEntity>(
    entityClass: new () => T,
    count: number,
    attributes: Partial<T> = {},
    batchSize = 100,
  ): Promise<T[]> {
    const entities: T[] = [];
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, count - i * batchSize);
      this.info(`Creating batch ${i + 1}/${batches} (${currentBatchSize} ${entityClass.name}s)`);

      const batch = await this.factoryManager.createMany(entityClass, currentBatchSize, attributes);

      entities.push(...batch);
    }

    return entities;
  }

  /**
   * Truncate a table (delete all records)
   *
   * @param entityClass - Entity class to truncate
   * @returns Promise resolving to number of deleted records
   *
   * @protected
   */
  protected async truncate<T extends BaseEntity>(entityClass: new () => T): Promise<number> {
    const affectedRows = await this.entityManager.nativeDelete(entityClass, {});

    this.info(`Truncated ${entityClass.name} table (${affectedRows} records deleted)`);
    return affectedRows;
  }

  //============================================================================
  // Logging Utility Methods
  //============================================================================

  /**
   * Log info message
   *
   * @param message - Message to log
   * @param context - Optional context data
   * @protected
   */
  protected info(message: string, context?: any): void {
    if (context) {
      this.logger.log(message, context);
    } else {
      this.logger.log(message);
    }
  }

  /**
   * Log success message
   *
   * @param message - Message to log
   * @param context - Optional context data
   * @protected
   */
  protected success(message: string, context?: any): void {
    const successMessage = `✅ ${message}`;
    if (context) {
      this.logger.log(successMessage, context);
    } else {
      this.logger.log(successMessage);
    }
  }

  /**
   * Log warning message
   *
   * @param message - Message to log
   * @param context - Optional context data
   * @protected
   */
  protected warn(message: string, context?: any): void {
    if (context) {
      this.logger.warn(message, context);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log error message
   *
   * @param message - Message to log
   * @param context - Optional context data
   * @protected
   */
  protected error(message: string, context?: any): void {
    if (context) {
      this.logger.error(message, context);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * Log debug message (only if verbose mode is enabled)
   *
   * @param message - Message to log
   * @param context - Optional context data
   * @protected
   */
  protected debug(message: string, context?: any): void {
    if (this.context.verbose) {
      if (context) {
        this.logger.debug(message, context);
      } else {
        this.logger.debug(message);
      }
    }
  }
}
