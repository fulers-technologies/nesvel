/**
 * Search Connection Type Enum
 *
 * Defines the supported search engine providers that can be used
 * with the nestjs-search package.
 *
 * @example
 * ```typescript
 * import { SearchModule, SearchConnectionType } from '@nesvel/nestjs-search';
 *
 * @Module({
 *   imports: [
 *     SearchModule.forRoot({
 *       connection: SearchConnectionType.ELASTICSEARCH,
 *       host: 'localhost:9200',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export enum SearchConnectionType {
  /**
   * Elasticsearch search engine
   *
   * A distributed, RESTful search and analytics engine.
   * Requires @nestjs/elasticsearch package to be installed.
   *
   * @see https://www.elastic.co/elasticsearch/
   * @see https://github.com/nestjs/elasticsearch
   */
  ELASTICSEARCH = 'elasticsearch',

  /**
   * Meilisearch search engine
   *
   * A lightning-fast search engine that fits effortlessly into your apps.
   * Requires nestjs-meilisearch package to be installed.
   *
   * @see https://www.meilisearch.com/
   * @see https://github.com/lambrohan/nestjs-meilisearch
   */
  MEILISEARCH = 'meilisearch',
}
