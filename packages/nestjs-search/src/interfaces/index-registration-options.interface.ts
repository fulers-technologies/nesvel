/**
 * Index Registration Options
 *
 * Configuration options for registering a search index.
 * Similar to BullModule queue registration pattern.
 *
 * @interface IndexRegistrationOptions
 */
export interface IndexRegistrationOptions {
  /**
   * Name of the index
   *
   * This is the primary identifier for the index.
   *
   * @example 'products'
   * @example 'orders'
   */
  name: string;

  /**
   * Index alias (optional)
   *
   * An alias that can be used to reference the index.
   * Useful for zero-downtime reindexing.
   *
   * @example 'products_v1'
   * @example 'active_orders'
   */
  alias?: string;

  /**
   * Elasticsearch-specific settings (optional)
   *
   * Configuration for Elasticsearch indices.
   */
  elasticsearch?: {
    /**
     * Number of primary shards
     *
     * @default 1
     */
    numberOfShards?: number;

    /**
     * Number of replica shards
     *
     * @default 1
     */
    numberOfReplicas?: number;

    /**
     * Refresh interval
     *
     * How often the index should be refreshed.
     *
     * @default '1s'
     */
    refreshInterval?: string;

    /**
     * Custom mappings for the index
     *
     * Define field types and analysis settings.
     */
    mappings?: {
      properties?: Record<string, any>;
      [key: string]: any;
    };

    /**
     * Index settings
     *
     * Additional Elasticsearch index settings.
     */
    settings?: Record<string, any>;

    /**
     * Custom analysis configuration
     *
     * Define analyzers, tokenizers, filters, etc.
     */
    analysis?: {
      analyzer?: Record<string, any>;
      tokenizer?: Record<string, any>;
      filter?: Record<string, any>;
      char_filter?: Record<string, any>;
    };
  };

  /**
   * Meilisearch-specific settings (optional)
   *
   * Configuration for Meilisearch indices.
   */
  meilisearch?: {
    /**
     * Primary key field
     *
     * The field to use as the document ID.
     *
     * @example 'id'
     * @example 'productId'
     */
    primaryKey?: string;

    /**
     * Searchable attributes
     *
     * Fields that should be searchable.
     *
     * @example ['name', 'description', 'tags']
     */
    searchableAttributes?: string[];

    /**
     * Displayed attributes
     *
     * Fields that should be returned in search results.
     *
     * @example ['id', 'name', 'price', 'image']
     */
    displayedAttributes?: string[];

    /**
     * Filterable attributes
     *
     * Fields that can be used in filters.
     *
     * @example ['category', 'price', 'inStock']
     */
    filterableAttributes?: string[];

    /**
     * Sortable attributes
     *
     * Fields that can be used for sorting.
     *
     * @example ['price', 'createdAt', 'rating']
     */
    sortableAttributes?: string[];

    /**
     * Ranking rules
     *
     * Order of ranking rules for search results.
     *
     * @default ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness']
     */
    rankingRules?: string[];

    /**
     * Stop words
     *
     * Words to ignore during search.
     *
     * @example ['the', 'a', 'an']
     */
    stopWords?: string[];

    /**
     * Synonyms
     *
     * Define synonym groups.
     *
     * @example { 'phone': ['cellphone', 'mobile'], 'laptop': ['notebook', 'computer'] }
     */
    synonyms?: Record<string, string[]>;

    /**
     * Distinct attribute
     *
     * Field to use for deduplication.
     *
     * @example 'productId'
     */
    distinctAttribute?: string;

    /**
     * Typo tolerance
     *
     * Configuration for typo tolerance.
     */
    typoTolerance?: {
      enabled?: boolean;
      minWordSizeForTypos?: {
        oneTypo?: number;
        twoTypos?: number;
      };
      disableOnWords?: string[];
      disableOnAttributes?: string[];
    };
  };

  /**
   * Auto-create index on module initialization
   *
   * If true, the index will be automatically created when the module starts.
   *
   * @default true
   */
  autoCreate?: boolean;

  /**
   * Auto-update index settings
   *
   * If true, index settings will be updated on module initialization.
   *
   * @default false
   */
  autoUpdateSettings?: boolean;
}
