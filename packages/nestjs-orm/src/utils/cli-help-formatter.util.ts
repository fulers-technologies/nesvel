import { Command } from 'commander';

/**
 * Command groups configuration
 */
export const COMMAND_GROUPS = {
  'Code Generation': [
    'make:model',
    'make:repository',
    'make:service',
    'make:controller',
    'make:module',
    'make:dto',
    'make:middleware',
    'make:enum',
    'make:scope',
    'make:factory',
    'make:seeder',
    'make:subscriber',
    'make:migration',
    'make:resource',
  ],
  'Database Migrations': [
    'migrate',
    'migrate:rollback',
    'migrate:fresh',
    'migrate:refresh',
    'migrate:reset',
    'migrate:status',
  ],
  'Schema Management': ['schema:create', 'schema:update', 'schema:drop', 'schema:validate'],
  'Database Seeding': ['db:seed', 'db:seed:list', 'db:seed:rollback', 'db:seed:refresh'],
  'Entity Inspection': ['entity:list', 'entity:show', 'entity:graph'],
  'Database Inspection': ['db:show', 'db:table'],
  'Connection Management': ['connection:list', 'connection:test'],
  'ORM Utilities': [
    'orm:info',
    'orm:debug',
    'orm:mapping:describe',
    'orm:schema-tool:create',
    'orm:schema-tool:update',
    'orm:schema-tool:drop',
    'orm:validate-schema',
  ],
  'Query Analysis': ['query:explain'],
};

/**
 * Format command help with groups
 *
 * @param program - Commander program instance
 * @returns Formatted help text
 */
export function formatGroupedHelp(program: Command): string {
  const commands = program.commands;
  const grouped: Record<string, any[]> = {};
  const ungrouped: any[] = [];

  // Group commands
  for (const cmd of commands) {
    const cmdName = cmd.name();
    let foundGroup = false;

    for (const [groupName, groupCommands] of Object.entries(COMMAND_GROUPS)) {
      if (groupCommands.includes(cmdName)) {
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(cmd);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup && cmdName !== 'help') {
      ungrouped.push(cmd);
    }
  }

  // Build help text
  let helpText = '\nUsage: nesvel-orm [options] [command]\n\n';
  helpText += 'Options:\n';
  helpText += '  -h, --help                  display help for command\n';
  helpText += '  -V, --version               output the version number\n';
  helpText += '\n';

  // Output grouped commands
  for (const [groupName, groupCommands] of Object.entries(COMMAND_GROUPS)) {
    if (grouped[groupName] && grouped[groupName].length > 0) {
      helpText += `${groupName}:\n`;
      for (const cmd of grouped[groupName]) {
        const args = cmd.usage().split(' ').slice(1).join(' ');
        const desc = cmd.description();
        const cmdText = args ? `${cmd.name()} ${args}` : cmd.name();
        helpText += `  ${cmdText.padEnd(35)} ${desc}\n`;
      }
      helpText += '\n';
    }
  }

  // Output ungrouped commands
  if (ungrouped.length > 0) {
    helpText += 'Other Commands:\n';
    for (const cmd of ungrouped) {
      const args = cmd.usage().split(' ').slice(1).join(' ');
      const desc = cmd.description();
      const cmdText = args ? `${cmd.name()} ${args}` : cmd.name();
      helpText += `  ${cmdText.padEnd(35)} ${desc}\n`;
    }
    helpText += '\n';
  }

  helpText += "Run 'nesvel-orm [command] --help' for more information on a command.\n";

  return helpText;
}

/**
 * Configure custom help for a Commander program
 *
 * @param program - Commander program instance
 */
export function configureGroupedHelp(program: Command): void {
  program.configureHelp({
    formatHelp: (cmd: Command) => {
      return formatGroupedHelp(cmd);
    },
  });
}
