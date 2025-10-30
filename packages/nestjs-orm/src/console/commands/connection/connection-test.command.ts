import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Connection Test Command
 * Tests database connection
 */
@Injectable()
@Command({
  name: 'connection:test',
  description: 'Test database connection',
})
export class ConnectionTestCommand extends CommandRunner {
  private readonly logger = new Logger(ConnectionTestCommand.name);
  constructor(private readonly orm: MikroORM) { super(); }

  async run(): Promise<void> {
    try {
      this.logger.log('Testing database connection...\n');
      const connection = this.orm.em.getConnection();
      await connection.execute('SELECT 1');
      this.logger.log('✅ Connection successful');
    } catch (error: any) {
      this.logger.error('❌ Connection failed:', error.message);
      throw error;
    }
  }
}
