/**
 * Command Information Interface
 *
 * Represents the information about a command that will be displayed in help output.
 *
 * @interface CommandInfo
 * @property {string} name - The command name (e.g., 'make:model')
 * @property {string} description - The command description
 * @property {string} [arguments] - Optional command arguments (e.g., '<name>')
 * @property {string} [group] - Optional group name for organizing commands
 */
export interface CommandInfo {
  /**
   * The command name (e.g., 'make:model', 'migrate:up')
   */
  name: string;

  /**
   * The command description
   */
  description: string;

  /**
   * Optional command arguments (e.g., '<name>', '[options]')
   */
  arguments?: string;

  /**
   * Optional group name for organizing commands in help output
   */
  group?: string;
}
