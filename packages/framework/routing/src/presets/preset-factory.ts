import { RouteOptions } from '@interfaces/api-endpoint-options.interface';
import { EndpointPreset } from '@enums/endpoint-preset.enum';
import {
  CRUD_LIST_PRESET,
  CRUD_READ_PRESET,
  CRUD_CREATE_PRESET,
  CRUD_UPDATE_PRESET,
  CRUD_DELETE_PRESET,
  CRUD_PATCH_PRESET,
} from '@presets/crud-presets';
import { HEALTH_PRESET } from '@presets/health-preset';
import { UPLOAD_PRESET, DOWNLOAD_PRESET } from '@presets/file-presets';

/**
 * Preset configuration registry.
 *
 * Maps preset identifiers to their corresponding configuration objects.
 * Used by the preset factory to retrieve and apply preset settings.
 *
 * @internal
 */
const PRESET_REGISTRY: Record<string, Partial<RouteOptions>> = {
  [EndpointPreset.CRUD_LIST]: CRUD_LIST_PRESET,
  [EndpointPreset.CRUD_READ]: CRUD_READ_PRESET,
  [EndpointPreset.CRUD_CREATE]: CRUD_CREATE_PRESET,
  [EndpointPreset.CRUD_UPDATE]: CRUD_UPDATE_PRESET,
  [EndpointPreset.CRUD_DELETE]: CRUD_DELETE_PRESET,
  [EndpointPreset.CRUD_PATCH]: CRUD_PATCH_PRESET,
  [EndpointPreset.HEALTH]: HEALTH_PRESET,
  [EndpointPreset.UPLOAD]: UPLOAD_PRESET,
  [EndpointPreset.DOWNLOAD]: DOWNLOAD_PRESET,
};

/**
 * Retrieves preset configuration by identifier.
 *
 * Factory function that looks up and returns the configuration object
 * for a given preset. If the preset is not found, returns an empty object.
 *
 * The returned configuration is merged with user-provided options, with
 * user options taking precedence over preset defaults.
 *
 * @param preset - Preset identifier (e.g., 'crud.list', 'health')
 * @returns Partial endpoint configuration for the preset
 *
 * @example
 * ```typescript
 * const config = applyPreset(EndpointPreset.CRUD_LIST);
 * // Returns: { method: 'GET', httpCode: 200, ... }
 * ```
 *
 * @example
 * ```typescript
 * const config = applyPreset('unknown-preset');
 * // Returns: {} (empty object for unknown presets)
 * ```
 */
export function applyPreset(preset: string): Partial<RouteOptions> {
  // Look up preset in registry
  const presetConfig = PRESET_REGISTRY[preset];

  // Return preset configuration or empty object if not found
  return presetConfig || {};
}

/**
 * Checks if a preset identifier exists in the registry.
 *
 * Utility function to validate preset identifiers before applying them.
 *
 * @param preset - Preset identifier to check
 * @returns True if preset exists, false otherwise
 *
 * @example
 * ```typescript
 * hasPreset(EndpointPreset.CRUD_LIST); // true
 * hasPreset('invalid-preset');         // false
 * ```
 */
export function hasPreset(preset: string): boolean {
  return preset in PRESET_REGISTRY;
}

/**
 * Returns all available preset identifiers.
 *
 * Utility function for introspection and validation purposes.
 *
 * @returns Array of all registered preset identifiers
 *
 * @example
 * ```typescript
 * const presets = getAvailablePresets();
 * // Returns: ['crud.list', 'crud.read', 'crud.create', ...]
 * ```
 */
export function getAvailablePresets(): string[] {
  return Object.keys(PRESET_REGISTRY);
}
