import { SearchQueryBuilder } from '@/builders/search-query.builder';

import type { IQueryBuilder } from '@/interfaces/query-builder.interface';
import type { SearchResponse } from '@/interfaces/search-response.interface';
import type { SearchDocument } from '@/interfaces/search-document.interface';
import type { PaginatedResponse } from '@/interfaces/paginated-response.interface';

/**
 * Search Model
 *
 * Laravel Eloquent-inspired base class for searchable models.
 * Provides an Active Record pattern for search operations with a fluent API.
 *
 * **Key Features**:
 * - Static query methods (all, find, where, etc.)
 * - Fluent query building
 * - Type-safe operations
 * - Automatic index management
 * - Seamless integration with query builders
 *
 * **Usage Pattern**: Extend this class and define your model's index name
 * and searchable structure.
 *
 * @template T - The document type
 *
 * @example
 * ```typescript
 * // Define a searchable model
 * interface ProductDocument {
 *   id: string;
 *   name: string;
 *   price: number;
 *   category: string;
 *   status: string;
 * }
 *
 * export class Product extends SearchModel<ProductDocument> {
 *   static indexName = 'products';
 *
 *   // Optional: Add custom query methods
 *   static active() {
 *     return this.query().where('status', 'active');
 *   }
 *
 *   static byCategory(category: string) {
 *     return this.query().where('category', category);
 *   }
 * }
 *
 * // Use the model
 * const products = await Product.all();
 * const product = await Product.find('123');
 * const activeProducts = await Product.active().get();
 * const electronics = await Product.byCategory('Electronics')
 *   .where('price', '>', 100)
 *   .orderBy('price', 'asc')
 *   .get();
 * ```
 *
 * @example
 * ```typescript
 * // Complex queries
 * const results = await Product
 *   .query()
 *   .where('status', 'active')
 *   .where((qb) => {
 *     qb.where('category', 'Electronics')
 *       .orWhere('category', 'Computers');
 *   })
 *   .whereIn('brand', ['Apple', 'Dell', 'HP'])
 *   .whereBetween('price', [500, 2000])
 *   .paginate(20, 1);
 * ```
 *
 * @example
 * ```typescript
 * // Aggregations
 * const stats = await Product
 *   .query()
 *   .aggregate('categories', 'category', 'terms')
 *   .aggregate('avgPrice', 'price', 'avg')
 *   .get();
 *
 * console.log(stats.facets.categories); // Category counts
 * console.log(stats.facets.avgPrice); // Average price
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export abstract class SearchModel<T extends SearchDocument = SearchDocument> {
  /**
   * Index name for this model
   *
   * Must be defined in subclasses to specify which search index to query.
   *
   * @static
   * @abstract
   *
   * @example
   * ```typescript
   * export class Product extends SearchModel<ProductDocument> {
   *   static indexName = 'products';
   * }
   * ```
   */
  static indexName: string;

  /**
   * Create a new query builder for this model
   *
   * Returns a query builder instance configured with this model's index.
   * This is the starting point for all query operations.
   *
   * @static
   * @template T - The document type
   * @returns Query builder for this model
   *
   * @example
   * ```typescript
   * const query = Product.query()
   *   .where('status', 'active')
   *   .orderBy('createdAt', 'desc');
   * ```
   */
  static query<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
  ): IQueryBuilder<T> {
    if (!this.indexName) {
      throw new Error(
        `Index name not defined for ${this.name}. Set static indexName property.`,
      );
    }

    return SearchQueryBuilder.for<T>().index(this.indexName);
  }

  /**
   * Get all documents from the index
   *
   * Retrieves all documents without any filters.
   * Use with caution on large indices - consider using pagination.
   *
   * @static
   * @template T - The document type
   * @returns Promise resolving to search response with all documents
   *
   * @example
   * ```typescript
   * const allProducts = await Product.all();
   * console.log(allProducts.hits.length);
   * ```
   */
  static async all<T extends SearchDocument = SearchDocument>(this: typeof SearchModel & {
    indexName: string;
  }): Promise<SearchResponse<T>> {
    return this.query<T>().all();
  }

  static async find<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    id: string,
  ): Promise<T | null> {
    return this.query<T>().find(id);
  }

  static async findOrFail<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    id: string,
  ): Promise<T> {
    return this.query<T>().findOrFail(id);
  }

  static async first<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
  ): Promise<T | null> {
    return this.query<T>().first();
  }

  static async firstOrFail<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
  ): Promise<T> {
    return this.query<T>().firstOrFail();
  }

  static async count<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
  ): Promise<number> {
    return this.query<T>().count();
  }

  static async exists<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
  ): Promise<boolean> {
    return this.query<T>().exists();
  }

  static where<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    field: string,
    operatorOrValue: any,
    value?: any,
  ): IQueryBuilder<T> {
    return this.query<T>().where(field, operatorOrValue, value);
  }

  static whereIn<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    field: string,
    values: any[],
  ): IQueryBuilder<T> {
    return this.query<T>().whereIn(field, values);
  }

  static orderBy<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    field: string,
    direction: 'asc' | 'desc' = 'asc',
  ): IQueryBuilder<T> {
    return this.query<T>().orderBy(field, direction);
  }

  static limit<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    limit: number,
  ): IQueryBuilder<T> {
    return this.query<T>().limit(limit);
  }

  static skip<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    count: number,
  ): IQueryBuilder<T> {
    return this.query<T>().skip(count);
  }

  static async paginate<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    perPage: number = 20,
    page: number = 1,
  ): Promise<PaginatedResponse<T>> {
    return this.query<T>().paginate(perPage, page);
  }

  /**
   * Perform a full-text search
   *
   * Searches across specified fields or all fields for the given query.
   *
   * @static
   * @template T - The document type
   * @param query - The search query string
   * @param fields - Optional array of fields to search in
   * @returns Query builder with search applied
   *
   * @example
   * ```typescript
   * const results = await Product
   *   .search('laptop', ['name', 'description'])
   *   .where('status', 'active')
   *   .get();
   * ```
   */
  static search<T extends SearchDocument = SearchDocument>(
    this: typeof SearchModel & { indexName: string },
    query: string,
    fields?: string[],
  ): IQueryBuilder<T> {
    return SearchQueryBuilder.for<T>()
      .index(this.indexName)
      .search(query, fields);
  }
}
