import { Inject, Optional } from '@nestjs/common';

import { SEARCH_SERVICE } from '@/constants';

/**
 * InjectSearchService Decorator
 *
 * Decorator to inject the SearchService into your controllers, services, or any provider.
 * The SearchService provides a unified API for working with Elasticsearch or Meilisearch
 * without needing to know which provider is configured.
 *
 * **Usage Pattern**: This is the recommended way to work with search functionality.
 * The service abstracts away provider-specific details and provides a consistent interface
 * for indexing, searching, updating, and deleting documents.
 *
 * @returns PropertyDecorator & ParameterDecorator - NestJS decorator for dependency injection
 *
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { InjectSearchService, SearchService } from '@nesvel/nestjs-search';
 *
 * @Injectable()
 * export class ProductService {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   async searchProducts(query: string) {
 *     const results = await this.searchService.search('products', {
 *       query,
 *       limit: 20,
 *       offset: 0,
 *     });
 *     return results;
 *   }
 *
 *   async indexProduct(product: Product) {
 *     await this.searchService.index('products', product.id, {
 *       id: product.id,
 *       name: product.name,
 *       description: product.description,
 *       price: product.price,
 *       category: product.category,
 *     });
 *   }
 *
 *   async removeProduct(productId: string) {
 *     await this.searchService.delete('products', productId);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using in a controller
 * import { Controller, Get, Query } from '@nestjs/common';
 * import { InjectSearchService, SearchService } from '@nesvel/nestjs-search';
 *
 * @Controller('search')
 * export class SearchController {
 *   constructor(
 *     @InjectSearchService()
 *     private readonly searchService: SearchService,
 *   ) {}
 *
 *   @Get()
 *   async search(
 *     @Query('q') query: string,
 *     @Query('index') indexName: string,
 *   ) {
 *     return this.searchService.search(indexName, { query });
 *   }
 * }
 * ```
 *
 * @see {@link SearchService} For available methods and API documentation
 * @see {@link SearchModule} For configuration options
 *
 * @author Nesvel
 * @since 1.0.0
 */
export const InjectSearchService = (): ParameterDecorator => {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    Optional()(target, propertyKey, parameterIndex);
    Inject(SEARCH_SERVICE)(target, propertyKey, parameterIndex);
  };
};
