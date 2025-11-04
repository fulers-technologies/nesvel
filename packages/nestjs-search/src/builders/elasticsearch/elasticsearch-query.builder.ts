import { BaseQueryBuilder } from '@/builders/base-query.builder';

import type { SearchService } from '@/services/search.service';
import type { IWhereClause } from '@/interfaces/where-clause.interface';
import type { SearchOptions } from '@/interfaces/search-options.interface';

/**
 * Elasticsearch Query Builder
 *
 * Provider-specific query builder that translates fluent API calls
 * into Elasticsearch Query DSL (Domain Specific Language).
 *
 * **Translation Strategy**:
 * - WHERE clauses → bool query with must/filter/should/must_not
 * - Basic comparisons → term, range, or match queries
 * - IN/NOT IN → terms query
 * - BETWEEN → range query
 * - NULL checks → exists query
 * - Nested conditions → nested bool queries
 * - Search queries → multi_match or query_string
 * - Aggregations → aggs DSL
 * - Sort → sort array
 *
 * **Query Structure**:
 * ```json
 * {
 *   query: {
 *     bool: {
 *       must: [],     // AND conditions (scoring)
 *       filter: [],   // AND conditions (non-scoring, faster)
 *       should: [],   // OR conditions
 *       must_not: [] // NOT conditions
 *     }
 *   },
 *   sort: [],
 *   from: 0,
 *   size: 20,
 *   aggs: {},
 *   highlight: {}
 * }
 * ```
 *
 * @template T - The document type
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const builder = new ElasticsearchQueryBuilder(searchService);
 *
 * // Simple query
 * builder
 *   .index('products')
 *   .where('status', 'active')
 *   .where('price', '>', 100)
 *   .get();
 *
 * // Generates:
 * {
 *   query: {
 *     bool: {
 *       filter: [
 *         { term: { status: 'active' } },
 *         { range: { price: { gt: 100 } } }
 *       ]
 *     }
 *   }
 * }
 * ```
 */
export class ElasticsearchQueryBuilder<T = any> extends BaseQueryBuilder<T> {
  /**
   * Constructor
   *
   * @param searchService - The search service instance
   */
  constructor(searchService: SearchService) {
    super(searchService);
  }

  /**
   * Build the query options for SearchService
   *
   * Translates all fluent API calls into Elasticsearch-compatible SearchOptions.
   *
   * @returns SearchOptions object for Elasticsearch
   * @protected
   */
  protected buildQuery(): SearchOptions {
    const options: SearchOptions = {
      limit: this._limitValue,
      offset: this._offsetValue,
    };

    // Add search fields if specified
    if (this._searchFields && this._searchFields.length > 0) {
      options.searchFields = this._searchFields;
    }

    // Convert where clauses to filters
    if (this._whereClauses.length > 0) {
      options.filters = this.buildFilters();
    }

    // Add sorting
    if (this._orderByClauses.length > 0) {
      options.sort = this._orderByClauses.map((clause) => ({
        field: clause.field,
        order: clause.direction,
      }));
    }

    // Add highlight fields
    if (this._highlightFields.length > 0) {
      options.highlightFields = this._highlightFields;
    }

    // Add facets (aggregations)
    if (this._aggregations.length > 0) {
      options.facets = this._aggregations.map((agg) => agg.field);
    }

    return options;
  }

  /**
   * Get the raw Elasticsearch DSL query
   *
   * Generates the complete Elasticsearch Query DSL including bool queries,
   * filters, aggregations, sorting, and pagination.
   *
   * @returns Elasticsearch Query DSL object
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
   * //   query: {
   * //     bool: {
   * //       filter: [
   * //         { term: { status: 'active' } },
   * //         { range: { price: { gt: 100 } } }
   * //       ]
   * //     }
   * //   }
   * // }
   * ```
   */
  public toQuery(): any {
    const query: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };

    // Add search query
    if (this._searchQuery) {
      if (this._searchFields && this._searchFields.length > 0) {
        // Multi-field search with fuzzy matching
        query.query.bool.must.push({
          multi_match: {
            query: this._searchQuery,
            fields: this._searchFields,
            fuzziness: 'AUTO',
          },
        });
      } else {
        // Query string search across all fields
        query.query.bool.must.push({
          query_string: {
            query: `*${this._searchQuery}*`,
          },
        });
      }
    }

    // Process where clauses
    if (this._whereClauses.length > 0) {
      this.processWhereClauses(this._whereClauses, query.query.bool);
    }

    // Add sorting
    if (this._orderByClauses.length > 0) {
      query.sort = this._orderByClauses.map((clause) => ({
        [clause.field]: { order: clause.direction },
      }));
    }

    // Add pagination
    if (this._limitValue !== undefined) {
      query.size = this._limitValue;
    }
    query.from = this._offsetValue;

    // Add highlighting
    if (this._highlightFields.length > 0) {
      query.highlight = {
        fields: this._highlightFields.reduce(
          (acc, field) => {
            acc[field] = {};
            return acc;
          },
          {} as Record<string, any>,
        ),
      };
    }

    // Add aggregations
    if (this._aggregations.length > 0) {
      query.aggs = this._aggregations.reduce(
        (acc, agg) => {
          acc[agg.name] = {
            [agg.type]: {
              field: agg.field,
              ...agg.options,
            },
          };
          return acc;
        },
        {} as Record<string, any>,
      );
    }

    return query;
  }

  /**
   * Clone the query builder
   *
   * Creates a new instance with the same state for nested queries.
   *
   * @returns New ElasticsearchQueryBuilder instance
   */
  public clone(): ElasticsearchQueryBuilder<T> {
    const cloned = new ElasticsearchQueryBuilder<T>(this.searchService);
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
   * Process where clauses into Elasticsearch bool query
   *
   * Recursively processes where clauses and adds them to the appropriate
   * bool query section (must, filter, should, must_not).
   *
   * @param clauses - Array of where clauses to process
   * @param boolQuery - The bool query object to populate
   * @protected
   */
  protected processWhereClauses(clauses: IWhereClause[], boolQuery: any): void {
    for (const clause of clauses) {
      const esClause = this.buildElasticsearchClause(clause);

      if (!esClause) continue;

      // Determine which bool section to use based on boolean operator
      if (clause.boolean === 'or') {
        boolQuery.should.push(esClause);
      } else {
        // Use filter for non-scoring queries (more efficient)
        boolQuery.filter.push(esClause);
      }
    }
  }

  /**
   * Build Elasticsearch clause from where clause
   *
   * Converts a single where clause into the appropriate Elasticsearch query clause.
   *
   * @param clause - The where clause to convert
   * @returns Elasticsearch query clause
   * @protected
   */
  protected buildElasticsearchClause(clause: IWhereClause): any {
    switch (clause.type) {
      case 'basic':
        return this.buildBasicClause(clause);

      case 'in':
        // Terms query for IN clause
        return {
          terms: {
            [clause.field]: clause.values,
          },
        };

      case 'not_in':
        // Must not terms query for NOT IN
        return {
          bool: {
            must_not: [
              {
                terms: {
                  [clause.field]: clause.values,
                },
              },
            ],
          },
        };

      case 'between':
        // Range query for BETWEEN
        return {
          range: {
            [clause.field]: {
              gte: clause.values![0],
              lte: clause.values![1],
            },
          },
        };

      case 'not_between':
        // Must not range query for NOT BETWEEN
        return {
          bool: {
            must_not: [
              {
                range: {
                  [clause.field]: {
                    gte: clause.values![0],
                    lte: clause.values![1],
                  },
                },
              },
            ],
          },
        };

      case 'null':
        // Must not exists query for NULL
        return {
          bool: {
            must_not: [
              {
                exists: {
                  field: clause.field,
                },
              },
            ],
          },
        };

      case 'not_null':
        // Exists query for NOT NULL
        return {
          exists: {
            field: clause.field,
          },
        };

      case 'nested':
        // Nested bool query for grouped conditions
        const nestedBool: any = {
          bool: {
            must: [],
            filter: [],
            should: [],
            must_not: [],
          },
        };
        this.processWhereClauses(clause.nested!, nestedBool.bool);
        return nestedBool;

      default:
        return null;
    }
  }

  /**
   * Build basic comparison clause
   *
   * Converts basic where clauses (=, !=, >, <, etc.) into Elasticsearch queries.
   *
   * @param clause - The basic where clause
   * @returns Elasticsearch query clause
   * @protected
   */
  protected buildBasicClause(clause: IWhereClause): any {
    const { field, operator, value } = clause;

    switch (operator) {
      case '=':
        // Term query for exact match
        return {
          term: {
            [field]: value,
          },
        };

      case '!=':
        // Must not term query
        return {
          bool: {
            must_not: [
              {
                term: {
                  [field]: value,
                },
              },
            ],
          },
        };

      case '>':
        // Range query greater than
        return {
          range: {
            [field]: {
              gt: value,
            },
          },
        };

      case '>=':
        // Range query greater than or equal
        return {
          range: {
            [field]: {
              gte: value,
            },
          },
        };

      case '<':
        // Range query less than
        return {
          range: {
            [field]: {
              lt: value,
            },
          },
        };

      case '<=':
        // Range query less than or equal
        return {
          range: {
            [field]: {
              lte: value,
            },
          },
        };

      case 'like':
        // Wildcard query for fuzzy matching
        return {
          wildcard: {
            [field]: {
              value: `*${value}*`,
            },
          },
        };

      case 'exists':
        // Exists query
        return {
          exists: {
            field,
          },
        };

      case 'not exists':
        // Must not exists query
        return {
          bool: {
            must_not: [
              {
                exists: {
                  field,
                },
              },
            ],
          },
        };

      default:
        return null;
    }
  }

  /**
   * Build filters object from where clauses
   *
   * Simplified filter builder for compatibility with SearchService.
   *
   * @returns Filters object
   * @protected
   */
  protected buildFilters(): Record<string, any> {
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
