import { BaseQueryBuilder } from '@/builders/base-query.builder';

import type { IWhereClause } from '@/interfaces/where-clause.interface';
import type { SearchOptions } from '@/interfaces/search-options.interface';

/**
 * Meilisearch Query Builder
 *
 * Provider-specific query builder that translates fluent API calls
 * into Meilisearch filter strings and search options.
 *
 * **Translation Strategy**:
 * - WHERE clauses → filter strings (e.g., "status = 'active'")
 * - Basic comparisons → filter expressions
 * - IN/NOT IN → multiple OR conditions or NOT IN syntax
 * - BETWEEN → range filters (field >= min AND field <= max)
 * - NULL checks → IS NULL / IS NOT NULL
 * - AND/OR logic → combined filter strings
 * - Search queries → query parameter
 * - Sort → sort array
 *
 * **Filter String Format**:
 * ```
 * status = 'active' AND price > 100
 * category IN ['Electronics', 'Computers']
 * price BETWEEN 100 AND 500
 * (status = 'active' OR status = 'pending')
 * ```
 *
 * **Meilisearch Limitations**:
 * - No aggregations support (limited to basic stats)
 * - No highlighting (returns full text matches)
 * - Simpler query syntax compared to Elasticsearch
 *
 * @template T - The document type
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const builder = new MeilisearchQueryBuilder(searchService);
 *
 * // Simple query
 * builder
 *   .index('products')
 *   .where('status', 'active')
 *   .where('price', '>', 100)
 *   .get();
 *
 * // Generates filter:
 * ['status = "active"', 'price > 100']
 * ```
 */
export class MeilisearchQueryBuilder<T = any> extends BaseQueryBuilder<T> {
  /**
   * Get the raw Meilisearch query object
   *
   * Generates the complete Meilisearch query including filter strings,
   * sorting, and pagination.
   *
   * @returns Meilisearch query object
   *
   * @example
   * ```typescript
   * const query = builder
   *   .where('status', 'active')
   *   .where('price', '>', 100)
   *   .toQuery();
   *
   * console.log(query);
   * // {
   * //   filter: ['status = "active"', 'price > 100'],
   * //   sort: [],
   * //   limit: 20,
   * //   offset: 0
   * // }
   * ```
   */
  public toQuery(): any {
    const query: any = {
      limit: this._limitValue || 20,
      offset: this._offsetValue,
    };

    // Build filter strings
    if (this._whereClauses.length > 0) {
      query.filter = this.buildFilterStrings(this._whereClauses);
    }

    // Add search fields (attributesToSearchOn)
    if (this._searchFields && this._searchFields.length > 0) {
      query.attributesToSearchOn = this._searchFields;
    }

    // Add sorting
    if (this._orderByClauses.length > 0) {
      query.sort = this._orderByClauses.map((clause) => `${clause.field}:${clause.direction}`);
    }

    return query;
  }

  /**
   * Clone the query builder
   *
   * Creates a new instance with the same state for nested queries.
   *
   * @returns New MeilisearchQueryBuilder instance
   */
  public clone(): MeilisearchQueryBuilder<T> {
    const cloned = new MeilisearchQueryBuilder<T>();
    cloned._indexName = this._indexName;
    cloned._searchQuery = this._searchQuery;
    cloned._searchFields = this._searchFields ? [...this._searchFields] : undefined;
    cloned._whereClauses = [...this._whereClauses];
    cloned._orderByClauses = [...this._orderByClauses];
    cloned._aggregations = [...this._aggregations];
    cloned._highlightFields = [...this._highlightFields];
    cloned._limitValue = this._limitValue;
    cloned._offsetValue = this._offsetValue;
    return cloned;
  }

  /**
   * Build filter strings from where clauses
   *
   * Converts where clauses into Meilisearch filter string format.
   *
   * @param clauses - Array of where clauses to process
   * @returns Array of filter strings
   * @protected
   */
  protected buildFilterStrings(clauses: IWhereClause[]): string[] {
    const filters: string[] = [];

    for (const clause of clauses) {
      const filterString = this.buildMeilisearchFilter(clause);
      if (filterString) {
        filters.push(filterString);
      }
    }

    return filters;
  }

  /**
   * Build Meilisearch filter from where clause
   *
   * Converts a single where clause into Meilisearch filter string syntax.
   *
   * @param clause - The where clause to convert
   * @returns Meilisearch filter string
   * @protected
   */
  protected buildMeilisearchFilter(clause: IWhereClause): string | null {
    switch (clause.type) {
      case 'basic':
        return this.buildBasicFilter(clause);

      case 'in':
        // IN clause: field IN [value1, value2, ...]
        const inValues = clause.values!.map((v) => this.formatValue(v)).join(', ');
        return `${clause.field} IN [${inValues}]`;

      case 'not_in':
        // NOT IN clause: field NOT IN [value1, value2, ...]
        const notInValues = clause.values!.map((v) => this.formatValue(v)).join(', ');
        return `${clause.field} NOT IN [${notInValues}]`;

      case 'between':
        // BETWEEN clause: field >= min AND field <= max
        const min = this.formatValue(clause.values![0]);
        const max = this.formatValue(clause.values![1]);
        return `${clause.field} >= ${min} AND ${clause.field} <= ${max}`;

      case 'not_between':
        // NOT BETWEEN clause: (field < min OR field > max)
        const notMin = this.formatValue(clause.values![0]);
        const notMax = this.formatValue(clause.values![1]);
        return `(${clause.field} < ${notMin} OR ${clause.field} > ${notMax})`;

      case 'null':
        // IS NULL clause
        return `${clause.field} IS NULL`;

      case 'not_null':
        // IS NOT NULL clause
        return `${clause.field} IS NOT NULL`;

      case 'nested':
        // Nested clause: (condition1 OR condition2)
        const nestedFilters = this.buildFilterStrings(clause.nested!);
        if (nestedFilters.length > 0) {
          return `(${nestedFilters.join(' OR ')})`;
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Build basic filter string
   *
   * Converts basic where clauses (=, !=, >, <, etc.) into Meilisearch filter strings.
   *
   * @param clause - The basic where clause
   * @returns Meilisearch filter string
   * @protected
   */
  protected buildBasicFilter(clause: IWhereClause): string | null {
    const { field, operator, value } = clause;
    const formattedValue = this.formatValue(value);

    switch (operator) {
      case '=':
        // Equality: field = value
        return `${field} = ${formattedValue}`;

      case '!=':
        // Not equal: field != value
        return `${field} != ${formattedValue}`;

      case '>':
        // Greater than: field > value
        return `${field} > ${formattedValue}`;

      case '>=':
        // Greater than or equal: field >= value
        return `${field} >= ${formattedValue}`;

      case '<':
        // Less than: field < value
        return `${field} < ${formattedValue}`;

      case '<=':
        // Less than or equal: field <= value
        return `${field} <= ${formattedValue}`;

      case 'like':
        // Like/contains: use = for approximate match
        // Note: Meilisearch doesn't have LIKE, this does exact match
        return `${field} = ${formattedValue}`;

      case 'exists':
        // Field exists: IS NOT NULL
        return `${field} IS NOT NULL`;

      case 'not exists':
        // Field doesn't exist: IS NULL
        return `${field} IS NULL`;

      default:
        return null;
    }
  }

  /**
   * Format value for Meilisearch filter
   *
   * Properly formats values for use in filter strings:
   * - Strings are wrapped in double quotes
   * - Numbers and booleans are used as-is
   * - null/undefined become NULL
   *
   * @param value - The value to format
   * @returns Formatted value string
   * @protected
   */
  protected formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'string') {
      // Escape double quotes in strings
      const escaped = value.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // Numbers and other types
    return String(value);
  }

  /**
   * Build simple filters object for compatibility
   *
   * Extracts simple equality filters for use with SearchService.
   *
   * @returns Filters object
   * @protected
   */
  protected buildSimpleFilters(): Record<string, any> {
    const filters: Record<string, any> = {};

    // Extract simple equality filters
    for (const clause of this._whereClauses) {
      if (clause.type === 'basic' && clause.operator === '=') {
        filters[clause.field] = clause.value;
      }
    }

    return filters;
  }
}
