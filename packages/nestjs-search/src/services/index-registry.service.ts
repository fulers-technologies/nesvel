import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';

import { SearchService } from './search.service';
import { InjectSearchService } from '@/decorators';
import { IndexNamingService } from './index-naming.service';
import type { IndexRegistry } from '@/interfaces/index-registration.interface';
import type { IndexRegistrationOptions } from '@/interfaces/index-registration-options.interface';

/**
 * Index Registry Service
 *
 * Manages registered search indices and their configurations.
 * Handles automatic index creation and settings updates on module initialization.
 *
 * **Features**:
 * - Register indices with provider-specific settings
 * - Store index configurations
 * - Auto-create indices on startup
 * - Auto-update index settings
 * - Index alias management
 *
 * **Usage**:
 * ```typescript
 * // Typically used internally by SearchModule
 * // Indices are registered via SearchModule.registerIndex()
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class IndexRegistryService implements OnModuleInit {
  /**
   * Logger instance
   *
   * @private
   */
  private readonly logger = new Logger(IndexRegistryService.name);

  /**
   * Registry storage
   *
   * Stores all registered indices and their aliases.
   *
   * @private
   */
  private readonly registry: IndexRegistry = {
    indices: new Map<string, IndexRegistrationOptions>(),
    aliases: new Map<string, string>(),
  };

  constructor(
    @Optional()
    @InjectSearchService()
    private readonly searchService: SearchService | null,
    private readonly namingService: IndexNamingService,
  ) {}

  /**
   * Module initialization hook
   *
   * Called when the module is initialized.
   * Automatically creates indices and updates settings based on registration options.
   */
  async onModuleInit(): Promise<void> {
    if (!this.searchService) {
      this.logger.debug('SearchService not available, skipping index initialization');
      return;
    }

    this.logger.log(`Initializing ${this.registry.indices.size} registered indices...`);

    for (const [name, options] of this.registry.indices.entries()) {
      await this.initializeIndex(name, options);
    }

    this.logger.log('Index initialization complete');
  }

  /**
   * Register an index
   *
   * Adds an index to the registry with its configuration.
   * If an index with the same name already exists, it will be overwritten.
   *
   * @param options - Index registration options
   * @throws Error if index name is missing
   */
  register(options: IndexRegistrationOptions): void {
    if (!options.name) {
      throw new Error('Index name is required');
    }

    this.logger.debug(`Registering index: ${options.name}`);

    // Store the index configuration
    this.registry.indices.set(options.name, options);

    // Register alias if provided
    if (options.alias) {
      this.registry.aliases.set(options.alias, options.name);
      this.logger.debug(`Registered alias: ${options.alias} -> ${options.name}`);
    }
  }

  /**
   * Register multiple indices
   *
   * Convenience method to register multiple indices at once.
   *
   * @param optionsArray - Array of index registration options
   */
  registerMultiple(optionsArray: IndexRegistrationOptions[]): void {
    for (const options of optionsArray) {
      this.register(options);
    }
  }

  /**
   * Get index configuration by name
   *
   * Retrieves the configuration for a registered index.
   *
   * @param name - Index name or alias
   * @returns Index configuration or undefined if not found
   */
  get(name: string): IndexRegistrationOptions | undefined {
    // Check if it's an index name
    if (this.registry.indices.has(name)) {
      return this.registry.indices.get(name);
    }

    // Check if it's an alias
    const indexName = this.registry.aliases.get(name);
    if (indexName) {
      return this.registry.indices.get(indexName);
    }

    return undefined;
  }

  /**
   * Get all registered indices
   *
   * @returns Array of all registered index configurations
   */
  getAll(): IndexRegistrationOptions[] {
    return Array.from(this.registry.indices.values());
  }

  /**
   * Check if an index is registered
   *
   * @param name - Index name or alias
   * @returns True if the index is registered
   */
  has(name: string): boolean {
    return this.registry.indices.has(name) || this.registry.aliases.has(name);
  }

  /**
   * Resolve index name from alias
   *
   * If the provided name is an alias, returns the actual index name.
   * Otherwise, returns the name as-is.
   *
   * @param nameOrAlias - Index name or alias
   * @returns Actual index name
   */
  resolveIndexName(nameOrAlias: string): string {
    return this.registry.aliases.get(nameOrAlias) || nameOrAlias;
  }

  /**
   * Initialize an index
   *
   * Creates the index and applies settings based on configuration.
   *
   * @param name - Index name
   * @param options - Index configuration
   * @private
   */
  private async initializeIndex(name: string, options: IndexRegistrationOptions): Promise<void> {
    const autoCreate = options.autoCreate ?? true;
    const autoUpdateSettings = options.autoUpdateSettings ?? false;

    try {
      // Generate physical index name based on naming strategy
      const physicalIndexName = this.namingService.getPhysicalIndexName(name);
      const aliasName = this.namingService.getAliasName(name);
      const useAliases = this.namingService.shouldUseAliases();

      this.logger.debug(
        `Initializing index: ${name} (physical: ${physicalIndexName}, alias: ${useAliases ? aliasName : 'none'})`,
      );

      // For timestamped/versioned strategies, check if alias exists
      // For simple strategy, check if index exists directly
      const checkName = useAliases ? aliasName : name;
      const exists = await this.searchService!.indexExists(checkName);

      if (!exists && autoCreate) {
        // Create the physical index with settings
        await this.createIndexWithSettings(physicalIndexName, options);
        this.logger.log(`Created physical index: ${physicalIndexName}`);

        // Create alias if using timestamped/versioned strategy
        if (useAliases) {
          await this.searchService!.createAlias(physicalIndexName, aliasName);
          this.logger.log(`Created alias: ${aliasName} -> ${physicalIndexName}`);
        }
      } else if (exists && autoUpdateSettings) {
        // Update index settings (use alias name for lookups)
        await this.updateIndexSettings(checkName, options);
        this.logger.log(`Updated settings for index: ${checkName}`);
      } else if (exists) {
        this.logger.debug(`Index already exists: ${checkName}`);
      } else {
        this.logger.debug(`Skipping auto-create for index: ${name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize index: ${name}`,
        error instanceof Error ? error.stack : error,
      );
      // Don't throw - allow app to start even if index initialization fails
    }
  }

  /**
   * Create index with provider-specific settings
   *
   * @param name - Index name
   * @param options - Index configuration
   * @private
   */
  private async createIndexWithSettings(
    name: string,
    options: IndexRegistrationOptions,
  ): Promise<void> {
    // Build settings object based on provider type
    const settings = this.buildIndexSettings(options);

    await this.searchService!.createIndex(name, settings);

    // Apply Meilisearch-specific settings if configured
    if (options.meilisearch) {
      await this.applyMeilisearchSettings(name, options.meilisearch);
    }
  }

  /**
   * Update index settings
   *
   * Updates settings for an existing index based on the provider type.
   * Handles both Elasticsearch and Meilisearch configurations.
   *
   * @param name - Index name
   * @param options - Index configuration
   * @private
   */
  private async updateIndexSettings(
    name: string,
    options: IndexRegistrationOptions,
  ): Promise<void> {
    // Update Elasticsearch-specific settings if configured
    if (options.elasticsearch) {
      await this.applyElasticsearchSettings(name, options.elasticsearch);
    }

    // Update Meilisearch-specific settings if configured
    if (options.meilisearch) {
      await this.applyMeilisearchSettings(name, options.meilisearch);
    }
  }

  /**
   * Build index settings object
   *
   * Constructs settings object based on provider configuration.
   * Handles both Elasticsearch and Meilisearch settings.
   *
   * **Elasticsearch Settings**:
   * - Shards and replicas configuration
   * - Custom mappings for field types
   * - Analysis configuration (analyzers, tokenizers, filters)
   * - Refresh interval and other index settings
   *
   * **Meilisearch Settings**:
   * - Searchable, filterable, and sortable attributes
   * - Ranking rules and stop words
   * - Synonyms and typo tolerance
   * - Display and distinct attributes
   *
   * @param options - Index configuration
   * @returns Settings object for the provider
   * @private
   */
  private buildIndexSettings(options: IndexRegistrationOptions): Record<string, any> {
    const settings: Record<string, any> = {};

    // Build Elasticsearch settings
    if (options.elasticsearch) {
      const es = options.elasticsearch;

      // Build Elasticsearch settings object
      settings.settings = {
        number_of_shards: es.numberOfShards ?? 1,
        number_of_replicas: es.numberOfReplicas ?? 1,
        refresh_interval: es.refreshInterval ?? '1s',
        ...es.settings,
      };

      // Add analysis configuration if provided
      if (es.analysis) {
        settings.settings.analysis = es.analysis;
      }

      // Add mappings if provided
      if (es.mappings) {
        settings.mappings = es.mappings;
      }
    }

    // Build Meilisearch settings
    if (options.meilisearch) {
      const ms = options.meilisearch;

      // Add primary key
      if (ms.primaryKey) {
        settings.primaryKey = ms.primaryKey;
      }

      // Add searchable attributes
      if (ms.searchableAttributes) {
        settings.searchableAttributes = ms.searchableAttributes;
      }

      // Add displayed attributes
      if (ms.displayedAttributes) {
        settings.displayedAttributes = ms.displayedAttributes;
      }

      // Add filterable attributes
      if (ms.filterableAttributes) {
        settings.filterableAttributes = ms.filterableAttributes;
      }

      // Add sortable attributes
      if (ms.sortableAttributes) {
        settings.sortableAttributes = ms.sortableAttributes;
      }

      // Add ranking rules
      if (ms.rankingRules) {
        settings.rankingRules = ms.rankingRules;
      }

      // Add stop words
      if (ms.stopWords) {
        settings.stopWords = ms.stopWords;
      }

      // Add synonyms
      if (ms.synonyms) {
        settings.synonyms = ms.synonyms;
      }

      // Add distinct attribute
      if (ms.distinctAttribute) {
        settings.distinctAttribute = ms.distinctAttribute;
      }

      // Add typo tolerance
      if (ms.typoTolerance) {
        settings.typoTolerance = ms.typoTolerance;
      }
    }

    return settings;
  }

  /**
   * Apply Elasticsearch-specific settings
   *
   * Updates Elasticsearch index settings via the search service.
   * Only applies dynamic settings that don't require closing the index.
   *
   * **Dynamic Settings Applied**:
   * - Number of replicas (can change without closing)
   * - Refresh interval (can change without closing)
   * - Other dynamic index settings
   *
   * **Static Settings** (NOT applied to avoid disruption):
   * - Number of shards (requires index close/reopen)
   * - Analysis configuration (requires index close/reopen)
   * - Mappings (cannot be changed, only added)
   *
   * @param name - Index name
   * @param config - Elasticsearch configuration
   * @private
   */
  private async applyElasticsearchSettings(
    name: string,
    config: NonNullable<IndexRegistrationOptions['elasticsearch']>,
  ): Promise<void> {
    this.logger.debug(`Applying Elasticsearch settings for index: ${name}`);

    try {
      // Build settings object for Elasticsearch (only dynamic settings)
      const settings: Record<string, any> = {};

      // Add number of replicas (dynamic - can change without closing)
      if (config.numberOfReplicas !== undefined) {
        settings.number_of_replicas = config.numberOfReplicas;
      }

      // Add refresh interval (dynamic - can change without closing)
      if (config.refreshInterval) {
        settings.refresh_interval = config.refreshInterval;
      }

      // Add any additional settings from the settings object
      // Note: We only include these if they're dynamic settings
      if (config.settings) {
        // Filter to only include known dynamic settings
        const dynamicSettings = ['max_result_window', 'max_inner_result_window'];

        Object.keys(config.settings).forEach((key) => {
          if (dynamicSettings.includes(key)) {
            settings[key] = config.settings![key];
          }
        });
      }

      // Apply all settings if any were configured
      if (Object.keys(settings).length > 0) {
        this.logger.debug(
          `Applying ${Object.keys(settings).length} Elasticsearch dynamic setting(s) for index: ${name}`,
        );
        this.logger.debug(`Settings to apply: ${JSON.stringify(Object.keys(settings))}`);

        // Call the provider's updateSettings method via SearchService
        await this.searchService!.updateSettings(name, settings);

        this.logger.log(`Successfully applied Elasticsearch settings for index: ${name}`);
      } else {
        this.logger.debug(`No dynamic Elasticsearch settings to apply for index: ${name}`);
      }

      // Log warning about static settings that cannot be applied
      const hasStaticSettings =
        config.numberOfShards !== undefined ||
        config.analysis !== undefined ||
        config.mappings !== undefined;

      if (hasStaticSettings) {
        this.logger.warn(
          `Index ${name}: Static settings (shards, analysis, mappings) cannot be updated on existing index. ` +
            'These are only applied during index creation.',
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to apply Elasticsearch settings for index ${name}:`,
        error instanceof Error ? error.stack : error,
      );
      // Don't throw - allow graceful degradation
    }
  }

  /**
   * Apply Meilisearch-specific settings
   *
   * Updates Meilisearch index settings via the search service.
   * All Meilisearch settings can be updated without disruption.
   *
   * **Settings Applied**:
   * - Searchable attributes (fields to search in)
   * - Displayed attributes (fields returned in results)
   * - Filterable attributes (fields for WHERE clauses)
   * - Sortable attributes (fields for ORDER BY)
   * - Ranking rules (relevance scoring)
   * - Stop words (words to ignore)
   * - Synonyms (word equivalents)
   * - Distinct attribute (deduplication)
   * - Typo tolerance (fuzzy matching)
   *
   * @param name - Index name
   * @param config - Meilisearch configuration
   * @private
   */
  private async applyMeilisearchSettings(
    name: string,
    config: NonNullable<IndexRegistrationOptions['meilisearch']>,
  ): Promise<void> {
    this.logger.debug(`Applying Meilisearch settings for index: ${name}`);

    try {
      // Build settings object for Meilisearch
      const settings: Record<string, any> = {};

      // Add searchable attributes
      if (config.searchableAttributes) {
        settings.searchableAttributes = config.searchableAttributes;
      }

      // Add displayed attributes
      if (config.displayedAttributes) {
        settings.displayedAttributes = config.displayedAttributes;
      }

      // Add filterable attributes
      if (config.filterableAttributes) {
        settings.filterableAttributes = config.filterableAttributes;
      }

      // Add sortable attributes
      if (config.sortableAttributes) {
        settings.sortableAttributes = config.sortableAttributes;
      }

      // Add ranking rules
      if (config.rankingRules) {
        settings.rankingRules = config.rankingRules;
      }

      // Add stop words
      if (config.stopWords) {
        settings.stopWords = config.stopWords;
      }

      // Add synonyms
      if (config.synonyms) {
        settings.synonyms = config.synonyms;
      }

      // Add distinct attribute
      if (config.distinctAttribute) {
        settings.distinctAttribute = config.distinctAttribute;
      }

      // Add typo tolerance
      if (config.typoTolerance) {
        settings.typoTolerance = config.typoTolerance;
      }

      // Apply all settings if any were configured
      if (Object.keys(settings).length > 0) {
        this.logger.debug(
          `Applying ${Object.keys(settings).length} Meilisearch setting(s) for index: ${name}`,
        );
        this.logger.debug(`Settings to apply: ${JSON.stringify(Object.keys(settings))}`);

        await this.searchService!.updateSettings(name, settings);

        this.logger.log(`Successfully applied Meilisearch settings for index: ${name}`);
      } else {
        this.logger.debug(`No Meilisearch settings to apply for index: ${name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to apply Meilisearch settings for index ${name}:`,
        error instanceof Error ? error.stack : error,
      );
      // Don't throw - allow graceful degradation
    }
  }
}
