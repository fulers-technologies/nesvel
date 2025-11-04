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
   * Execute the query and return all results
   *
   * @returns Promise resolving to search response
   */
  get(): Promise<SearchResponse<T>>;

  /**
   * Alias for get() - returns all results
   *
   * @returns Promise resolving to search response
   */
  all(): Promise<SearchResponse<T>>;

  /**
   * Get the first result
   *
   * @returns Promise resolving to first document or null
   */
  first(): Promise<T | null>;

  /**
   * Get the first result or throw an error
   *
   * @throws Error if no results found
   * @returns Promise resolving to first document
   */
  firstOrFail(): Promise<T>;

  /**
   * Find a document by ID
   *
   * @param id - Document ID
   * @returns Promise resolving to document or null
   */
  find(id: string | number): Promise<T | null>;

  /**
   * Find a document by ID or throw an error
   *
   * @param id - Document ID
   * @throws Error if document not found
   * @returns Promise resolving to document
   */
  findOrFail(id: string | number): Promise<T>;

  /**
   * Get the count of matching documents
   *
   * @returns Promise resolving to count
   */
  count(): Promise<number>;

  /**
   * Check if any results exist
   *
   * @returns Promise resolving to boolean
   */
  exists(): Promise<boolean>;

  /**
   * Paginate results
   *
   * @param perPage - Results per page
   * @param page - Page number (1-indexed)
   * @returns Promise resolving to paginated response
   */
  paginate(perPage: number, page?: number): Promise<PaginatedResponse<T>>;

  /**
   * Get the raw query object (provider-specific)
   *
   * @returns Raw query object
   */
  toQuery(): any;

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
