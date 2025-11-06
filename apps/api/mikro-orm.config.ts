import { Options } from '@mikro-orm/core';
import { databaseConfig } from './src/config/database.config';

/**
 * MikroORM CLI Configuration
 *
 * This file is used by the MikroORM CLI for running migrations, seeders,
 * and other database operations. It imports the main database configuration
 * from database.config.ts to maintain a single source of truth.
 *
 * The NestJS-specific options (autoLoadEntities, registerRequestContext)
 * are omitted here as they're only needed in the application context.
 *
 * @see https://mikro-orm.io/docs/configuration
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { autoLoadEntities, registerRequestContext, ...cliConfig } = databaseConfig;

export default cliConfig as Options;
