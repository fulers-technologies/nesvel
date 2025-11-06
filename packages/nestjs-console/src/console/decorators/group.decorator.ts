/**
 * Metadata key for storing command group information
 *
 * @constant
 */
export const COMMAND_GROUP_METADATA_KEY = 'nesvel:command:group';

/**
 * Group Decorator
 *
 * Decorator for organizing CLI commands into groups for better help output.
 * This decorator can be stacked with nest-commander's @Command decorator
 * to add grouping metadata without modifying the command definition.
 *
 * @param groupName - The name of the group this command belongs to
 * @returns Class decorator function
 *
 * @description
 * The @Group decorator adds organizational metadata to commands that can be
 * read by help commands to display commands in organized groups. Commands
 * without a @Group decorator will appear in an "Other Commands" section.
 *
 * This decorator uses reflection to store the group name in the class metadata
 * under the key defined by COMMAND_GROUP_METADATA_KEY. This allows the
 * BaseHelperCommand to discover and organize commands automatically.
 *
 * @remarks
 * - Should be used together with nest-commander's @Command decorator
 * - Multiple commands can share the same group name
 * - Group names are case-sensitive
 * - Commands without @Group will be in "Other Commands"
 * - Decorator order doesn't matter (can be before or after @Command)
 *
 * @example
 * ```typescript
 * // Code Generation group
 * @Injectable()
 * @Command({
 *   name: 'make:model',
 *   description: 'Create a new model/entity',
 *   arguments: '<name>',
 * })
 * @Group('Code Generation')
 * export class MakeModelCommand extends CommandRunner {
 *   async run(inputs: string[]): Promise<void> {
 *     // Implementation
 *   }
 * }
 *
 * // Database Migrations group
 * @Injectable()
 * @Command({
 *   name: 'migrate',
 *   description: 'Run pending database migrations',
 * })
 * @Group('Database Migrations')
 * export class MigrateCommand extends CommandRunner {
 *   async run(): Promise<void> {
 *     // Implementation
 *   }
 * }
 *
 * // Command without group (will be in "Other Commands")
 * @Injectable()
 * @Command({
 *   name: 'custom',
 *   description: 'Custom command',
 * })
 * export class CustomCommand extends CommandRunner {
 *   async run(): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Retrieving group metadata
 * import { getCommandGroup } from '@nesvel/nestjs-console';
 *
 * const group = getCommandGroup(MakeModelCommand);
 * console.log(group); // 'Code Generation'
 * ```
 */
export function Group(groupName: string): ClassDecorator {
  return (target: any) => {
    // Store the group name in the class metadata
    // This will be read by BaseHelperCommand to organize commands
    Reflect.defineMetadata(COMMAND_GROUP_METADATA_KEY, groupName, target);
  };
}

/**
 * Helper function to retrieve command group metadata
 *
 * Retrieves the group name that was set by the @Group decorator.
 * Returns undefined if the command doesn't have a @Group decorator.
 *
 * @param target - The command class or instance
 * @returns The group name or undefined if not set
 *
 * @example
 * ```typescript
 * import { getCommandGroup } from '@nesvel/nestjs-console';
 *
 * const group = getCommandGroup(MakeModelCommand);
 * console.log(group); // 'Code Generation'
 *
 * const noGroup = getCommandGroup(CustomCommand);
 * console.log(noGroup); // undefined
 * ```
 */
export function getCommandGroup(target: any): string | undefined {
  // Handle both class and instance
  const constructor = typeof target === 'function' ? target : target.constructor;
  return Reflect.getMetadata(COMMAND_GROUP_METADATA_KEY, constructor);
}
