import { Injectable } from '@nestjs/common';
import { BaseHelperCommand, Command } from '@nesvel/nestjs-console';

/**
 * Custom Help Command
 *
 * Displays all available commands grouped by category for better organization.
 * Commands are automatically discovered and grouped based on their @Command
 * decorator metadata.
 *
 * @description
 * This command extends BaseHelperCommand which provides automatic command
 * discovery and grouped help formatting. Commands are organized based on
 * the 'group' parameter in their @Command decorator.
 *
 * @remarks
 * - Commands are automatically discovered from the command registry
 * - No need to manually maintain command lists
 * - Groups are defined in each command's @Command decorator
 *
 * @example
 * ```bash
 * # Display all commands grouped
 * nesvel-orm help
 *
 * # Display help for specific command
 * nesvel-orm help make:model
 * ```
 */
@Injectable()
@Command({
  name: 'help',
  description: 'Display help for commands',
  arguments: '[command]',
})
export class HelpCommand extends BaseHelperCommand {
  /**
   * Get the CLI command name
   *
   * @returns The CLI command name used in help text
   */
  protected getCliName(): string {
    return 'nesvel-orm';
  }

  /**
   * Get the title for the help banner
   *
   * @returns The title displayed in the help header
   */
  protected getTitle(): string {
    return 'Nesvel ORM CLI Commands';
  }
}
