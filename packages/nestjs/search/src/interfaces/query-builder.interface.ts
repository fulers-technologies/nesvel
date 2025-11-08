import type { IWhereClause } from './where-clause.interface';
import type { IOrderByClause } from './order-by-clause.interface';
import type { SearchResponse } from './search-response.interface';
import type { PaginatedResponse } from './paginated-response.interface';
import type { IAggregationClause } from './aggregation-clause.interface';

import type { WhereOperator } from '../types/where-operator.type';
import type { OrderDirection } from '../types/order-direction.type';

/**
 * Query Builder Interface
 *
 * Defines the contract for search query builders.
 * Provides a fluent API for building search queries.
 *
 * @template T - The document type
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IQueryBuilder<T = any> {
  /**
   * Set the index name to search in
   *
   * @param indexName - The name of the index
   * @returns Query builder instance for chaining
   */
  index(indexName: string): this;

  /**
   * Perform full-text search
   *
   * @param query - The search query string
   * @param fields - Optional array of fields to search in
   * @returns Query builder instance for chaining
   */
  search(query: string, fields?: string[]): this;

  /**
   * Add a basic where clause
   *
   * @param field - Field name or callback for nested conditions
   * @param operator - Comparison operator or value (if operator is '=')
   * @param value - Value to compare (optional if operator is provided as second param)
   * @returns Query builder instance for chaining
   */
  where(
    field: string | ((qb: IQueryBuilder<T>) => void),
    operator?: WhereOperator | any,
    value?: any,
  ): this;

  /**
   * Add an OR where clause
   *
   * @param field - Field name or callback for nested conditions
   * @param operator - Comparison operator or value
   * @param value - Value to compare
   * @returns Query builder instance for chaining
   */
  orWhere(
    field: string | ((qb: IQueryBuilder<T>) => void),
    operator?: WhereOperator | any,
    value?: any,
  ): this;

  /**
   * Add a WHERE IN clause
   *
   * @param field - Field name
   * @param values - Array of values
   * @returns Query builder instance for chaining
   */
  whereIn(field: string, values: any[]): this;

  /**
   * Add an OR WHERE IN clause
   *
   * @param field - Field name
   * @param values - Array of values
   * @returns Query builder instance for chaining
   */
  orWhereIn(field: string, values: any[]): this;

  /**
   * Add a WHERE NOT IN clause
   *
   * @param field - Field name
   * @param values - Array of values
   * @returns Query builder instance for chaining
   */
  whereNotIn(field: string, values: any[]): this;

  /**
   * Add an OR WHERE NOT IN clause
   *
   * @param field - Field name
   * @param values - Array of values
   * @returns Query builder instance for chaining
   */
  orWhereNotIn(field: string, values: any[]): this;

  /**
   * Add a WHERE BETWEEN clause
   *
   * @param field - Field name
   * @param range - [min, max] array
   * @returns Query builder instance for chaining
   */
  whereBetween(field: string, range: [any, any]): this;

  /**
   * Add an OR WHERE BETWEEN clause
   *
   * @param field - Field name
   * @param range - [min, max] array
   * @returns Query builder instance for chaining
   */
  orWhereBetween(field: string, range: [any, any]): this;

  /**
   * Add a WHERE NOT BETWEEN clause
   *
   * @param field - Field name
   * @param range - [min, max] array
   * @returns Query builder instance for chaining
   */
  whereNotBetween(field: string, range: [any, any]): this;

  /**
   * Add an OR WHERE NOT BETWEEN clause
   *
   * @param field - Field name
   * @param range - [min, max] array
   * @returns Query builder instance for chaining
   */
  orWhereNotBetween(field: string, range: [any, any]): this;

  /**
   * Add a WHERE NULL clause
   *
   * @param field - Field name
   * @returns Query builder instance for chaining
   */
  whereNull(field: string): this;

  /**
   * Add an OR WHERE NULL clause
   *
   * @param field - Field name
   * @returns Query builder instance for chaining
   */
  orWhereNull(field: string): this;

  /**
   * Add a WHERE NOT NULL clause
   *
   * @param field - Field name
   * @returns Query builder instance for chaining
   */
  whereNotNull(field: string): this;

  /**
   * Add an OR WHERE NOT NULL clause
   *
   * @param field - Field name
   * @returns Query builder instance for chaining
   */
  orWhereNotNull(field: string): this;

  /**
   * Add an ORDER BY clause
   *
   * @param field - Field name to sort by
   * @param direction - Sort direction ('asc' or 'desc')
   * @returns Query builder instance for chaining
   */
  orderBy(field: string, direction?: OrderDirection): this;

  /**
   * Set the maximum number of results
   *
   * @param limit - Maximum number of results
   * @returns Query builder instance for chaining
   */
  limit(limit: number): this;

  /**
   * Alias for limit()
   *
   * @param take - Maximum number of results
   * @returns Query builder instance for chaining
   */
  take(take: number): this;

  /**
   * Set the offset for pagination
   *
   * @param offset - Number of results to skip
   * @returns Query builder instance for chaining
   */
  offset(offset: number): this;

  /**
   * Alias for offset()
   *
   * @param skip - Number of results to skip
   * @returns Query builder instance for chaining
   */
  skip(skip: number): this;

  /**
   * Add fields to highlight in results
   *
   * @param fields - Array of field names to highlight
   * @returns Query builder instance for chaining
   */
  highlight(...fields: string[]): this;

  /**
   * Add aggregation/facet
   *
   * @param name - Aggregation name
   * @param field - Field to aggregate on
   * @param type - Aggregation type
   * @returns Query builder instance for chaining
   */
  aggregate(name: string, field: string, type?: string): this;

  /**
   * Build and return the raw query object (provider-specific)
   * Alias for toQuery()
   *
   * @returns Raw query object (Elasticsearch DSL, Meilisearch filters, etc.)
   */
  build(): any;

  /**
   * Get the raw query object (provider-specific)
   * Alias for build()
   *
   * @returns Raw query object
   */
  toQuery(): any;

  /**
   * Get the index name
   *
   * @returns Index name or undefined if not set
   */
  getIndex(): string | undefined;

  /**
   * Get the search query string
   *
   * @returns Search query string or undefined
   */
  getSearchQuery(): string | undefined;

  /**
   * Get the search fields
   *
   * @returns Array of search fields or undefined
   */
  getSearchFields(): string[] | undefined;

  /**
   * Get the limit value
   *
   * @returns Limit value or undefined
   */
  getLimit(): number | undefined;

  /**
   * Get the offset value
   *
   * @returns Offset value
   */
  getOffset(): number;

  /**
   * Get all query options as a plain object
   * Useful for debugging and inspection
   *
   * @returns Object containing all query parameters
   */
  getOptions(): Record<string, any>;

  /**
   * Convert the query builder to JSON string
   * Useful for debugging and logging
   *
   * @param pretty - Whether to pretty-print the JSON
   * @returns JSON string representation
   */
  toJson(pretty?: boolean): string;

  /**
   * Get the where clauses
   *
   * @returns Array of where clauses
   */
  getWhereClauses(): IWhereClause[];

  /**
   * Get the order by clauses
   *
   * @returns Array of order by clauses
   */
  getOrderByClauses(): IOrderByClause[];

  /**
   * Get the aggregation clauses
   *
   * @returns Array of aggregation clauses
   */
  getAggregations(): IAggregationClause[];

  /**
   * Clone the query builder
   *
   * @returns New query builder instance with same state
   */
  clone(): IQueryBuilder<T>;
}
