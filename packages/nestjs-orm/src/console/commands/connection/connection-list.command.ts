import { Command, CommandRunner } from 'nest-commander';
import { MikroORM } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Connection List Command
 * Lists all database connections
 */
@Injectable()
@Command({
  name: 'connection:list',
  description: 'List all database connections',
})
export class ConnectionListCommand extends CommandRunner {
  private readonly logger = new Logger(ConnectionListCommand.name);
  constructor(private readonly orm: MikroORM) { super(); }

  async run(): Promise<void> {
    this.logger.log('Database Connections:\n');
    const config = this.orm.config;
    
    this.logger.log('='.repeat(60));
    this.logger.log(`Type: ${config.get('type')}`);
    this.logger.log(`Database: ${config.get('dbName')}`);
    this.logger.log(`Host: ${config.get('host')}:${config.get('port')}`);
    this.logger.log(`User: ${config.get('user')}`);
    this.logger.log('='.repeat(60));
    
    this.logger.log('\n✅ Connection list displayed');
  }
}
