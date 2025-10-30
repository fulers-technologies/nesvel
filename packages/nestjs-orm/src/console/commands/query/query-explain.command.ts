import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Query Explain Command
 * Shows query execution plan
 */
@Injectable()
@Command({
  name: 'query:explain',
  arguments: '<query>',
  description: 'Explain query execution plan',
})
export class QueryExplainCommand extends CommandRunner {
  private readonly logger = new Logger(QueryExplainCommand.name);
  constructor(private readonly orm: MikroORM) { super(); }

  async run(inputs: string[]): Promise<void> {
    try {
      const [query] = inputs;
      if (!query) throw new Error('Query is required');

      this.logger.log('Query Execution Plan:\n');
      const connection = this.orm.em.getConnection();
      
      // Execute EXPLAIN (database-specific)
      const result = await connection.execute(`EXPLAIN ${query}`);
      
      this.logger.log('='.repeat(80));
      this.logger.log(JSON.stringify(result, null, 2));
      this.logger.log('='.repeat(80));
      
      this.logger.log('\n✅ Execution plan displayed');
    } catch (error: any) {
      this.logger.error('❌ Failed to explain query:', error.message);
      throw error;
    }
  }
}
