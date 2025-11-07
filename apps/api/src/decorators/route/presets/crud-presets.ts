import { HttpStatus } from '@nestjs/common';
import { HttpMethod } from '@nesvel/shared';

import { RouteOptions } from '../interfaces/api-endpoint-options.interface';

/**
 * CRUD (Create, Read, Update, Delete) operation presets.
 *
 * Provides pre-configured endpoint settings for standard CRUD operations.
 * Each preset includes appropriate HTTP method, status code, and common
 * response configurations for the operation type.
 *
 * These presets reduce boilerplate and ensure consistency across CRUD endpoints.
 */

/**
 * List operation preset configuration.
 *
 * Configured for retrieving multiple resources with pagination support.
 * Typically used for GET /resources endpoints.
 */
export const CRUD_LIST_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.GET,
  httpCode: HttpStatus.OK,
  documentation: {
    summary: 'List all items',
  },
  responses: {
    ok: { description: 'List retrieved successfully' },
    badRequest: 'Invalid query parameters',
    unauthorized: 'Unauthorized',
  },
};

/**
 * Read operation preset configuration.
 *
 * Configured for retrieving a single resource by identifier.
 * Typically used for GET /resources/:id endpoints.
 */
export const CRUD_READ_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.GET,
  httpCode: HttpStatus.OK,
  documentation: {
    summary: 'Get item by ID',
  },
  responses: {
    ok: { description: 'Item found' },
    notFound: 'Item not found',
    unauthorized: 'Unauthorized',
  },
};

/**
 * Create operation preset configuration.
 *
 * Configured for creating new resources.
 * Typically used for POST /resources endpoints.
 */
export const CRUD_CREATE_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.POST,
  httpCode: HttpStatus.CREATED,
  documentation: {
    summary: 'Create new item',
  },
  responses: {
    created: { description: 'Item created successfully' },
    badRequest: 'Invalid input data',
    conflict: 'Item already exists',
    unauthorized: 'Unauthorized',
  },
};

/**
 * Update operation preset configuration.
 *
 * Configured for full resource replacement.
 * Typically used for PUT /resources/:id endpoints.
 */
export const CRUD_UPDATE_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.PUT,
  httpCode: HttpStatus.OK,
  documentation: {
    summary: 'Update item',
  },
  responses: {
    ok: { description: 'Item updated successfully' },
    notFound: 'Item not found',
    badRequest: 'Invalid data',
    unauthorized: 'Unauthorized',
  },
};

/**
 * Delete operation preset configuration.
 *
 * Configured for resource deletion.
 * Typically used for DELETE /resources/:id endpoints.
 */
export const CRUD_DELETE_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.DELETE,
  httpCode: HttpStatus.OK,
  documentation: {
    summary: 'Delete item',
  },
  responses: {
    ok: { description: 'Item deleted successfully' },
    notFound: 'Item not found',
    unauthorized: 'Unauthorized',
  },
};

/**
 * Patch operation preset configuration.
 *
 * Configured for partial resource updates.
 * Typically used for PATCH /resources/:id endpoints.
 */
export const CRUD_PATCH_PRESET: Partial<RouteOptions> = {
  method: HttpMethod.PATCH,
  httpCode: HttpStatus.OK,
  documentation: {
    summary: 'Partially update item',
  },
  responses: {
    ok: { description: 'Item updated successfully' },
    notFound: 'Item not found',
    badRequest: 'Invalid update data',
    unauthorized: 'Unauthorized',
  },
};
