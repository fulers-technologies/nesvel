import { Injectable } from '@nestjs/common';
import { BaseHelperCommand, Command } from '@nesvel/nestjs-console';

/**
 * Custom Help Command
 *
 * Displays all available commands grouped by category for better organization.
 * Commands are automatically discovered and grouped based on their @Command
 * and @Group decorator metadata.
 *
 * @description
 * This command extends BaseHelperCommand which provides automatic command
 * discovery and grouped help formatting. Commands are organized based on
 * the 'group' parameter from the @Group decorator.
 *
 * @remarks
 * - Commands are automatically discovered from the command registry
 * - No need to manually maintain command lists
 * - Groups are defined in each command's @Group decorator
 *
 * @example
 * ```bash
 * # Display all commands grouped
 * nesvel-search help
 *
 * # Display help for specific command
 * nesvel-search help index:list
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
    return 'nesvel-search';
  }

  /**
   * Get the title for the help banner
   *
   * @returns The title displayed in the help header
   */
  protected getTitle(): string {
    return 'Nesvel Search CLI Commands';
  }
}
