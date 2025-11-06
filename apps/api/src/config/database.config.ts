import { Migrator } from '@mikro-orm/migrations';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { LoadStrategy, DatabaseConfig, UnderscoreNamingStrategy } from '@nesvel/nestjs-orm';

/**
 * Database Configuration for NestJS + MikroORM
 *
 * This is the single source of truth for database configuration.
 * Used by both NestJS application and MikroORM CLI.
 *
 * Configuration includes:
 * - Connection settings (host, port, credentials)
 * - Entity discovery and metadata
 * - Migrations and seeders
 * - Connection pooling and timeouts
 * - Caching strategies
 * - Validation and debugging
 * - NestJS-specific integration options
 *
 * @see https://mikro-orm.io/docs/usage-with-nestjs
 * @see https://mikro-orm.io/docs/configuration
 */
export const databaseConfig: DatabaseConfig = {
  /**
   * Database driver - Better SQLite (for Bun compatibility)
   * Using BetterSqliteDriver instead of SqliteDriver for better Bun support
   * Available drivers: PostgreSqlDriver, MySqlDriver, SqliteDriver, BetterSqliteDriver, MongoDriver
   */
  // driver: PostgreSqlDriver as any,
  driver: SqliteDriver,

  /**
   * Database connection settings
   * Uses environment variables for security
   */
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dbName: process.env.DB_NAME || 'nesvel_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',

  /**
   * Charset and timezone settings
   */
  charset: 'utf8mb4',
  timezone: '+00:00',

  /**
   * Entity discovery settings
   * Entities are auto-discovered from the specified paths
   * Uses explicit src/dist paths to avoid picking up entities from node_modules
   */
  entitiesTs: ['./src/**/*.entity.ts'],
  entities: ['./dist/src/**/*.entity.js'],

  /**
   * Migration settings
   * Controls how database migrations are generated and executed
   * Looks for migrations in all directories under src
   */
  migrations: {
    safe: true,
    emit: 'ts',
    path: './src',
    snapshot: true,
    pathTs: './src',
    dropTables: false,
    allOrNothing: true,
    transactional: true,
    generator: undefined,
    tableName: 'migrations',
    disableForeignKeys: false,
    glob: '**/migrations/*.{js,ts}',
  },

  /**
   * Seeder settings
   * Configuration for database seeding
   * Looks for seeders in all module directories
   */
  seeder: {
    emit: 'ts',
    path: './src',
    pathTs: './src',
    glob: '**/seeders/*.{js,ts}',
    defaultSeeder: 'OrderSeeder',
  },

  /**
   * Schema settings
   * Controls schema generation and updates
   */
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },

  /**
   * Connection pool settings
   * Manages database connection pooling
   */
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  },

  /**
   * Debugging and logging
   */
  logger: undefined,
  debug: process.env.NODE_ENV === 'development',

  /**
   * Validation settings
   */
  strict: true,
  validate: true,
  validateRequired: true,

  /**
   * NestJS-specific: Auto-load entities from modules
   * Disabled because we're using explicit entity paths to avoid duplicates
   * When using explicit entity globs, set this to false
   */
  autoLoadEntities: false,

  /**
   * NestJS-specific: Register request context automatically
   * Essential for proper async context tracking in NestJS
   *
   * NOTE: Set to false to avoid MikroOrmMiddleware dependency resolution issues.
   * Context is managed via EntityManager injection in services instead.
   */
  registerRequestContext: false,

  /**
   * Context management
   * WARNING: allowGlobalContext should only be true in development!
   */
  forceUndefined: false,
  forceUtcTimezone: true,
  forceEntityConstructor: false,
  allowGlobalContext: process.env.NODE_ENV === 'development',

  /**
   * Relationship loading strategy
   * SELECT_IN: Loads relations in a separate query using WHERE IN
   * JOINED: Uses SQL joins to load relations
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  loadStrategy: LoadStrategy.SELECT_IN as any,

  /**
   * Batch size for bulk operations
   */
  batchSize: 100,

  /**
   * Hydration settings
   */
  hydrator: undefined,

  /**
   * Result cache settings (query result caching)
   */
  resultCache: {
    options: {},
    expiration: 1000,
    adapter: undefined,
  },

  /**
   * Entity discovery settings
   */
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: false,
    disableDynamicFileAccess: false,
  },

  /**
   * Naming strategy
   * Controls how entity and column names are converted to database names
   * UnderscoreNamingStrategy: camelCase -> snake_case (recommended)
   */
  namingStrategy: UnderscoreNamingStrategy,

  /**
   * Replica (read-only) database connections
   * Useful for read scaling
   */
  replicas: [],

  /**
   * Populate where condition
   * Controls whether populate accepts where conditions for filtering
   * INFER: Automatically infer based on usage (recommended)
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  populateWhere: 'infer' as any,

  /**
   * Entity repository class
   * Custom base repository class for all entities
   * Can be set to your custom EntityRepository class
   */
  entityRepository: undefined,

  /**
   * Identity map settings
   */
  disableIdentityMap: false,

  /**
   * TypeScript settings
   */
  tsNode: process.env.TS_NODE !== undefined,

  /**
   * Ensure indexes are created
   */
  ensureIndexes: process.env.NODE_ENV === 'development',

  /**
   * Prefer read replicas
   * When true, read operations will prefer replica connections
   */
  preferReadReplicas: true,

  /**
   * Connection retry attempts
   * Number of times to retry connection on failure
   */
  connect: true,

  /**
   * Automatically close connections on app shutdown
   */
  autoJoinOneToOneOwner: true,

  /**
   * Use batch inserts for better performance
   */
  useBatchInserts: true,

  /**
   * Use batch updates for better performance
   */
  useBatchUpdates: true,

  extensions: [Migrator],
};
