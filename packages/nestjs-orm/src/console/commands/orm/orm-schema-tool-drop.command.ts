import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * ORM Schema Tool Drop Command (Alias for schema:drop)
 */
@Injectable()
@Command({
  name: 'orm:schema-tool:drop',
  description: 'Drop database schema',
})
export class OrmSchemaToolDropCommand extends CommandRunner {
  private readonly logger = new Logger(OrmSchemaToolDropCommand.name);
  constructor(private readonly orm: MikroORM) { super(); }

  async run(): Promise<void> {
    const schemaGenerator = this.orm.getSchemaGenerator();
    await schemaGenerator.dropSchema();
    this.logger.log('✅ Schema dropped successfully');
  }
}
