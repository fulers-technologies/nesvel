import { Command, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import {
  BaseCommand,
  spinner,
  success,
  error,
  info,
  warning,
  newLine,
  confirm,
} from '@nesvel/nestjs-console';
import { InjectSearchService } from '@/decorators';
import { SearchService } from '@/services';

/**
 * Index Create Command
 *
 * Creates a new search index with optional settings and mappings.
 * Supports both Elasticsearch and Meilisearch with provider-specific configurations.
 *
 * **Features**:
 * - Create new indices
 * - Optional settings configuration
 * - Confirm before creation
 * - Pretty formatted output
 *
 * **Usage**:
 * ```bash
 * nesvel-search index:create <index-name>
 * nesvel-search index:create orders
 * nesvel-search index:create products --settings='{"number_of_shards": 3}'
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:create',
  description: 'Create a new search index',
  arguments: '<index>',
  argsDescription: {
    index: 'Name of the index to create',
  },
})
export class IndexCreateCommand extends BaseCommand {
  /**
   * Index settings (JSON string)
   *
   * Optional settings for index configuration.
   * Format depends on the search provider (Elasticsearch/Meilisearch).
   *
   * @private
   */
  @Option({
    flags: '--settings <json>',
    description: 'Index settings as JSON string',
  })
  parseSettings(val: string): Record<string, any> {
    try {
      return JSON.parse(val);
    } catch {
      throw new Error('Invalid JSON for settings');
    }
  }

  /**
   * Skip confirmation prompt
   *
   * If true, creates the index without asking for confirmation.
   *
   * @private
   */
  @Option({
    flags: '--force',
    description: 'Skip confirmation prompt',
  })
  parseForce(): boolean {
    return true;
  }

  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {
    super();
  }

  /**
   * Execute the command
   *
   * Creates a new index with the specified name and optional settings.
   *
   * @param inputs - Command arguments [indexName]
   * @param options - Command options {settings?, force?}
   */
  async run(inputs?: string[], options?: Record<string, any>): Promise<void> {
    const indexName = inputs?.[0];

    // Validate index name
    if (!indexName) {
      error('Index name is required');
      info('Usage: index:create <index-name>');
      return;
    }

    const settings = options?.settings;
    const force = options?.force || false;

    try {
      // Check if index already exists
      const exists = await this.searchService.indexExists(indexName);

      if (exists) {
        warning(`Index "${indexName}" already exists.`);
        newLine();
        info('Use "index:delete ' + indexName + '" to remove it first.');
        info('Or use "index:status ' + indexName + '" to view its details.');
        return;
      }

      // Show settings if provided
      if (settings) {
        info('Index settings:');
        console.log(JSON.stringify(settings, null, 2));
        newLine();
      }

      // Confirm before creating (unless --force is used)
      if (!force) {
        const confirmed = await confirm(`Create index "${indexName}"?`, {
          default: true, // default to yes
        });

        if (!confirmed) {
          warning('Index creation cancelled');
          return;
        }
      }

      // Show spinner while creating
      const spinnerInstance = spinner(`Creating index "${indexName}"...`);
      spinnerInstance.start();

      // Create the index
      await this.searchService.createIndex(indexName, settings);

      spinnerInstance.stop();

      // Success message
      success(`Index "${indexName}" created successfully!`);
      newLine();
      info('Use "index:status ' + indexName + '" to view index details.');
      info('Or start indexing with "index:reindex ' + indexName + '".');
    } catch (err) {
      error(`Failed to create index: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (err instanceof Error && err.message.includes('already exists')) {
        newLine();
        warning(`Index "${indexName}" already exists.`);
        info('Use "index:delete ' + indexName + '" to remove it first.');
        return; // Don't throw
      }

      if (process.env.DEBUG) {
        newLine();
        error('Stack trace:');
        console.error(err);
      }

      throw err;
    }
  }
}
