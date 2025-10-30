import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';

/**
 * Custom Help Command
 *
 * Displays all available commands grouped by category for better organization.
 * Groups are determined by command prefixes (make:, migrate:, db:, etc.).
 */
@Injectable()
@Command({
  name: 'help',
  description: 'Display help for commands',
  arguments: '[command]',
})
export class HelpCommand extends CommandRunner {
  /**
   * Command groups organized by prefix
   */
  private readonly commandGroups = {
    'Code Generation (make)': [
      { name: 'make:model <name>', desc: 'Create a new model/entity' },
      { name: 'make:repository <name>', desc: 'Create a new repository' },
      { name: 'make:service <name>', desc: 'Create a new service' },
      { name: 'make:controller <name>', desc: 'Create a new REST API controller' },
      { name: 'make:module <name>', desc: 'Create a new NestJS module' },
      { name: 'make:dto <name>', desc: 'Create a new Data Transfer Object (DTO)' },
      { name: 'make:middleware <name>', desc: 'Create a new middleware class' },
      { name: 'make:enum <name>', desc: 'Create a new TypeScript enum' },
      { name: 'make:scope <name>', desc: 'Create a new query scope class' },
      { name: 'make:factory <name>', desc: 'Create a new factory' },
      { name: 'make:seeder <name>', desc: 'Create a new seeder' },
      { name: 'make:subscriber <name>', desc: 'Create a new entity subscriber class' },
      { name: 'make:migration <name>', desc: 'Create a new database migration' },
      { name: 'make:resource <name>', desc: 'Create a complete CRUD resource' },
    ],
    'Database Migrations (migrate)': [
      { name: 'migrate [options]', desc: 'Run pending database migrations' },
      { name: 'migrate:rollback [options]', desc: 'Rollback the last batch of migrations' },
      { name: 'migrate:fresh [options]', desc: 'Drop all tables and re-run migrations' },
      { name: 'migrate:refresh [options]', desc: 'Rollback all migrations and re-run them' },
      { name: 'migrate:reset', desc: 'Rollback all database migrations' },
      { name: 'migrate:status', desc: 'Show the status of each migration' },
    ],
    'Schema Management (schema)': [
      { name: 'schema:create [options]', desc: 'Create database schema from entities' },
      { name: 'schema:update [options]', desc: 'Update database schema to match entities' },
      { name: 'schema:drop [options]', desc: 'Drop all database tables' },
      { name: 'schema:validate', desc: 'Validate database schema matches entities' },
    ],
    'Database Seeding (db:seed)': [
      { name: 'db:seed [options]', desc: 'Seed the database with records' },
      { name: 'db:seed:list', desc: 'List all available database seeders' },
      { name: 'db:seed:rollback [options]', desc: 'Rollback the last batch of seeders' },
      { name: 'db:seed:refresh [options]', desc: 'Rollback all seeders and re-run them' },
    ],
    'Entity Inspection (entity)': [
      { name: 'entity:list', desc: 'List all registered entities' },
      { name: 'entity:show <name>', desc: 'Show detailed information about an entity' },
      { name: 'entity:graph', desc: 'Show entity relationship graph' },
    ],
    'Database Inspection (db)': [
      { name: 'db:show', desc: 'Display database information' },
      { name: 'db:table <name>', desc: 'Show table structure' },
    ],
    'Connection Management (connection)': [
      { name: 'connection:list', desc: 'List all database connections' },
      { name: 'connection:test', desc: 'Test database connection' },
    ],
    'ORM Utilities (orm)': [
      { name: 'orm:info', desc: 'Show ORM configuration' },
      { name: 'orm:debug', desc: 'Show ORM debug information' },
      { name: 'orm:mapping:describe <entity>', desc: 'Show entity mapping details' },
      { name: 'orm:schema-tool:create', desc: 'Create database schema from entities' },
      { name: 'orm:schema-tool:update', desc: 'Update database schema' },
      { name: 'orm:schema-tool:drop', desc: 'Drop database schema' },
      { name: 'orm:validate-schema', desc: 'Validate entity mappings' },
    ],
    'Query Analysis (query)': [
      { name: 'query:explain <query>', desc: 'Explain query execution plan' },
    ],
  };

  async run(passedParams: string[]): Promise<void> {
    const [commandName] = passedParams;

    if (commandName) {
      // Show help for specific command - delegate to commander's help
      console.log(`\nFor detailed help on a specific command, use:\n`);
      console.log(`  nesvel-orm ${commandName} --help\n`);
      return;
    }

    // Display grouped help
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    Nesvel ORM CLI Commands                         ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    console.log('Usage: nesvel-orm [command] [options]\n');

    // Display each command group
    for (const [groupName, commands] of Object.entries(this.commandGroups)) {
      console.log(`\x1b[1m\x1b[36m${groupName}:\x1b[0m`);
      for (const cmd of commands) {
        const padding = ' '.repeat(Math.max(0, 35 - cmd.name.length));
        console.log(`  \x1b[33m${cmd.name}\x1b[0m${padding}${cmd.desc}`);
      }
      console.log('');
    }

    console.log('\x1b[2mRun \'nesvel-orm [command] --help\' for more information on a command.\x1b[0m\n');
  }
}
