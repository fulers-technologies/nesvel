/**
 * Predefined endpoint configurations for common use cases.
 *
 * Presets provide pre-configured settings for standard REST operations,
 * reducing boilerplate code and ensuring consistency across endpoints.
 * Each preset includes appropriate HTTP method, status codes, and
 * common response configurations.
 *
 * @example
 * ```typescript
 * @Route({ preset: EndpointPreset.CRUD_LIST })
 * async listUsers() { ... }
 *
 * @Route({ preset: EndpointPreset.CRUD_CREATE })
 * async createUser(@Body() dto: CreateUserDto) { ... }
 * ```
 */
export enum EndpointPreset {
  /**
   * CRUD List operation preset.
   * Configured for: GET method, 200 OK status, pagination support.
   * Use for listing/fetching multiple resources.
   */
  CRUD_LIST = 'crud.list',

  /**
   * CRUD Read operation preset.
   * Configured for: GET method, 200 OK status, single resource.
   * Use for fetching a specific resource by identifier.
   */
  CRUD_READ = 'crud.read',

  /**
   * CRUD Create operation preset.
   * Configured for: POST method, 201 Created status.
   * Use for creating new resources.
   */
  CRUD_CREATE = 'crud.create',

  /**
   * CRUD Update operation preset.
   * Configured for: PUT method, 200 OK status, full replacement.
   * Use for updating entire resources.
   */
  CRUD_UPDATE = 'crud.update',

  /**
   * CRUD Delete operation preset.
   * Configured for: DELETE method, 200 OK status.
   * Use for deleting resources.
   */
  CRUD_DELETE = 'crud.delete',

  /**
   * CRUD Patch operation preset.
   * Configured for: PATCH method, 200 OK status, partial update.
   * Use for partially updating resources.
   */
  CRUD_PATCH = 'crud.patch',

  /**
   * Health check endpoint preset.
   * Configured for: GET method, 200 OK or 503 Service Unavailable.
   * Use for application health monitoring.
   */
  HEALTH = 'health',

  /**
   * File upload endpoint preset.
   * Configured for: POST method, 201 Created, multipart/form-data.
   * Use for file upload operations.
   */
  UPLOAD = 'upload',

  /**
   * File download endpoint preset.
   * Configured for: GET method, 200 OK, application/octet-stream.
   * Use for file download operations.
   */
  DOWNLOAD = 'download',
}
