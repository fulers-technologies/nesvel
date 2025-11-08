import { Injectable, Optional } from '@nestjs/common';
import { CommandRunner } from 'nest-commander';

import { getCommandGroup } from '../decorators/group.decorator';
import { CommandInfo } from '@/interfaces/command-info.interface';

/**
 * Base Helper Command
 *
 * Abstract base class for help commands that automatically discover and display
 * all registered commands organized by groups.
 *
 * This class reads command metadata from the @Command decorator (including the
 * extended 'group' metadata) and formats a grouped help output similar to
 * Laravel Artisan and other modern CLI tools.
 *
 * @description
 * Provides automatic command discovery and grouped help formatting.
 * Subclasses only need to provide:
 * - CLI name (e.g., 'nesvel-orm', 'nesvel-search')
 * - Title for the help banner (e.g., 'Nesvel ORM CLI Commands')
 *
 * @remarks
 * - Commands are automatically discovered from nest-commander's command registry
 * - Commands are grouped based on the 'group' parameter in @Command decorator
 * - Commands without a group are placed in "Other Commands" section
 * - Help command itself is automatically excluded from the listing
 *
 * @example
 * ```typescript
 * @Injectable()
 * @Command({
 *   name: 'help',
 *   description: 'Display help for commands',
 *   arguments: '[command]',
 * })
 * export class HelpCommand extends BaseHelperCommand {
 *   protected getCliName(): string {
 *     return 'nesvel-orm';
 *   }
 *
 *   protected getTitle(): string {
 *     return 'Nesvel ORM CLI Commands';
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class BaseHelperCommand extends CommandRunner {
  /**
   * Creates an instance of BaseHelperCommand
   *
   * @param rootCommand - Optional root command instance for discovering registered commands
   */
  constructor(@Optional() private readonly rootCommand?: any) {
    super();
  }

  /**
   * Get the CLI command name
   *
   * This is used in usage instructions and help text.
   *
   * @returns The CLI command name (e.g., 'nesvel-orm', 'nesvel-search')
   *
   * @example
   * ```typescript
   * protected getCliName(): string {
   *   return 'nesvel-orm';
   * }
   * ```
   */
  protected abstract getCliName(): string;

  /**
   * Get the title for the help banner
   *
   * This is displayed in the decorative header box.
   *
   * @returns The title text (e.g., 'Nesvel ORM CLI Commands')
   *
   * @example
   * ```typescript
   * protected getTitle(): string {
   *   return 'Nesvel ORM CLI Commands';
   * }
   * ```
   */
  protected abstract getTitle(): string;

  /**
   * Run the help command
   *
   * Displays either grouped help for all commands or help for a specific command.
   *
   * @param passedParams - Command arguments [command name]
   * @returns Promise that resolves when help is displayed
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
  async run(passedParams: string[]): Promise<void> {
    const [commandName] = passedParams;

    if (commandName) {
      // Show help for specific command - delegate to commander's help
      console.log(`\nFor detailed help on a specific command, use:\n`);
      console.log(`  ${this.getCliName()} ${commandName} --help\n`);
      return;
    }

    // Display grouped help
    this.displayGroupedHelp();
  }

  /**
   * Display grouped help output
   *
   * Discovers all registered commands, organizes them by group,
   * and displays them in a formatted output.
   *
   * @remarks
   * - Uses metadata from @Command decorator to get command information
   * - Groups commands based on the 'group' parameter
   * - Commands without a group go into "Other Commands"
   * - The help command itself is excluded from the listing
   */
  private displayGroupedHelp(): void {
    // Discover all registered commands
    const commands = this.discoverCommands();

    // Group commands by their group metadata
    const grouped = this.groupCommands(commands);

    // Display header
    this.displayHeader();

    // Display usage
    console.log(`Usage: ${this.getCliName()} [command] [options]\n`);

    // Display each command group
    const groupOrder = this.getGroupOrder(grouped);
    for (const groupName of groupOrder) {
      const groupCommands = grouped[groupName];
      if (groupCommands && groupCommands.length > 0) {
        console.log(`\x1b[1m\x1b[36m${groupName}:\x1b[0m`);
        for (const cmd of groupCommands) {
          this.displayCommand(cmd);
        }
        console.log('');
      }
    }

    // Display footer
    console.log(
      `\x1b[2mRun '${this.getCliName()} [command] --help' for more information on a command.\x1b[0m\n`
    );
  }

  /**
   * Display the help header with title
   *
   * Creates a decorative box around the title text.
   */
  private displayHeader(): void {
    const title = this.getTitle();
    const boxWidth = 70;
    const titlePadding = Math.max(0, Math.floor((boxWidth - title.length - 2) / 2));
    const titleLine = ' '.repeat(titlePadding) + title + ' '.repeat(titlePadding);

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log(`║${titleLine.padEnd(boxWidth)}║`);
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  }

  /**
   * Display a single command in the help output
   *
   * @param cmd - The command information to display
   */
  private displayCommand(cmd: CommandInfo): void {
    const cmdName = cmd.arguments ? `${cmd.name} ${cmd.arguments}` : cmd.name;
    const padding = ' '.repeat(Math.max(0, 35 - cmdName.length));
    console.log(`  \x1b[33m${cmdName}\x1b[0m${padding}${cmd.description}`);
  }

  /**
   * Discover all registered commands
   *
   * Reads command metadata from all registered command classes.
   * Excludes the help command itself from the listing.
   *
   * @returns Array of command information objects
   *
   * @remarks
   * Uses nest-commander's internal metadata storage to find all commands.
   * Falls back to an empty array if no commands are registered.
   */
  private discoverCommands(): CommandInfo[] {
    const commands: CommandInfo[] = [];

    try {
      // Get all registered command classes from nest-commander's metadata
      // nest-commander stores command classes in the module metadata
      if (!this.rootCommand) {
        return commands;
      }

      // Access the command runners from the root command
      const commandRunners = (this.rootCommand as any).commandRunners || [];

      for (const runner of commandRunners) {
        // Get command metadata from nest-commander
        const metadata = Reflect.getMetadata('CommandBuilder:Command:Meta', runner.constructor);

        if (metadata && metadata.name) {
          // Skip the help command itself
          if (metadata.name === 'help') {
            continue;
          }

          // Get group metadata from @Group decorator
          const group = getCommandGroup(runner.constructor);

          commands.push({
            name: metadata.name,
            description: metadata.description || '',
            arguments: metadata.arguments,
            group,
          });
        }
      }
    } catch (error: Error | any) {
      // If we can't discover commands, return empty array
      console.error('Error discovering commands:', error);
    }

    return commands;
  }

  /**
   * Group commands by their group metadata
   *
   * Organizes commands into groups based on the 'group' parameter
   * from their @Command decorator.
   *
   * @param commands - Array of all commands
   * @returns Object mapping group names to arrays of commands
   *
   * @remarks
   * Commands without a group are placed in "Other Commands" category.
   */
  private groupCommands(commands: CommandInfo[]): Record<string, CommandInfo[]> {
    const grouped: Record<string, CommandInfo[]> = {};

    for (const cmd of commands) {
      const groupName = cmd.group || 'Other Commands';

      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }

      grouped[groupName].push(cmd);
    }

    return grouped;
  }

  /**
   * Get the order in which groups should be displayed
   *
   * Ensures "Other Commands" is always displayed last.
   * Other groups are displayed in alphabetical order.
   *
   * @param grouped - Object mapping group names to command arrays
   * @returns Array of group names in display order
   */
  private getGroupOrder(grouped: Record<string, CommandInfo[]>): string[] {
    const groups = Object.keys(grouped);
    const otherIndex = groups.indexOf('Other Commands');

    // Remove "Other Commands" if it exists
    if (otherIndex !== -1) {
      groups.splice(otherIndex, 1);
    }

    // Sort remaining groups alphabetically
    groups.sort();

    // Add "Other Commands" at the end if it existed
    if (otherIndex !== -1) {
      groups.push('Other Commands');
    }

    return groups;
  }
}
