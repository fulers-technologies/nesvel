import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * ORM Schema Tool Update Command (Alias for schema:update)
 */
@Injectable()
@Command({
  name: 'orm:schema-tool:update',
  description: 'Update database schema',
})
export class OrmSchemaToolUpdateCommand extends CommandRunner {
  private readonly logger = new Logger(OrmSchemaToolUpdateCommand.name);
  constructor(private readonly orm: MikroORM) {
    super();
  }

  async run(): Promise<void> {
    const schemaGenerator = this.orm.getSchemaGenerator();
    await schemaGenerator.updateSchema();
    this.logger.log('✅ Schema updated successfully');
  }
}
