import { Module } from '@nestjs/common';

import {
  IndexListCommand,
  IndexStatusCommand,
  IndexClearCommand,
  IndexCreateCommand,
  IndexDeleteCommand,
  IndexReindexCommand,
} from './commands';
import { HelpCommand } from './commands/help.command';

/**
 * Console Module
 *
 * Registers all CLI commands for search index management.
 * Includes commands for listing, creating, deleting, and managing search indices.
 *
 * @description Console module for search CLI commands
 * @author Nesvel
 * @since 1.0.0
 */
@Module({
  providers: [
    // Index management commands
    IndexListCommand,
    IndexStatusCommand,
    IndexClearCommand,
    IndexCreateCommand,
    IndexDeleteCommand,
    IndexReindexCommand,

    // Help command
    HelpCommand,
  ],
})
export class ConsoleModule {}
