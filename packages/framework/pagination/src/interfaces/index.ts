/**
 * Pagination Interfaces
 *
 * Type definitions for Laravel-style pagination system.
 * Provides interfaces for all pagination types: offset-based
 * (with and without total count) and cursor-based.
 *
 * @module pagination/interfaces
 */

export * from './cursor.interface';
export * from './pagination-meta.interface';
export * from './pagination-links.interface';
export * from './pagination-config.interface';
export * from './paginator-options.interface';
export * from './simple-paginator-response.interface';
export * from './cursor-paginator-response.interface';
export * from './length-aware-paginator-response.interface';
