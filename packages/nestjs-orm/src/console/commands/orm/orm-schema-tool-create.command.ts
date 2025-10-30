import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * ORM Schema Tool Create Command (Alias for schema:create)
 */
@Injectable()
@Command({
  name: 'orm:schema-tool:create',
  description: 'Create database schema from entities',
})
export class OrmSchemaToolCreateCommand extends CommandRunner {
  private readonly logger = new Logger(OrmSchemaToolCreateCommand.name);
  constructor(private readonly orm: MikroORM) { super(); }

  async run(): Promise<void> {
    const schemaGenerator = this.orm.getSchemaGenerator();
    await schemaGenerator.createSchema();
    this.logger.log('✅ Schema created successfully');
  }
}
