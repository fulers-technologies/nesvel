import { Command, Group } from '@nesvel/nestjs-console';
import { CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Entity Graph Command
 * Shows entity relationship graph
 */
@Injectable()
@Command({
  name: 'entity:graph',
  description: 'Show entity relationship graph',
})
@Group('Entity Inspection')
export class EntityGraphCommand extends CommandRunner {
  private readonly logger = new Logger(EntityGraphCommand.name);
  constructor(private readonly orm: MikroORM) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Entity Relationship Graph:\n');
    const metadata = this.orm.getMetadata();
    const entities = Object.values(metadata.getAll());

    entities.forEach((entity: any) => {
      this.logger.log(`${entity.className}:`);
      const relations = entity.relations || [];
      relations.forEach((rel: any) => {
        this.logger.log(`  ${rel.kind} -> ${rel.type} (${rel.name})`);
      });
      this.logger.log('');
    });

    this.logger.log('✅ Relationship graph displayed');
  }
}
