/**
 * Preset configurations exports for the API endpoint decorator.
 *
 * This module provides pre-configured endpoint settings for common
 * use cases including CRUD operations, health checks, and file handling.
 */

export {
  CRUD_LIST_PRESET,
  CRUD_READ_PRESET,
  CRUD_CREATE_PRESET,
  CRUD_UPDATE_PRESET,
  CRUD_DELETE_PRESET,
  CRUD_PATCH_PRESET,
} from './crud-presets';
export { HEALTH_PRESET } from './health-preset';
export { UPLOAD_PRESET, DOWNLOAD_PRESET } from './file-presets';
export { applyPreset, hasPreset, getAvailablePresets } from './preset-factory';
