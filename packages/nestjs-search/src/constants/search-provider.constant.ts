/**
 * Search Provider injection token
 *
 * Used internally by SearchModule to inject the appropriate search provider
 * (ElasticsearchProvider or MeilisearchProvider) based on configuration.
 *
 * @constant
 * @type {string}
 */
export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';
