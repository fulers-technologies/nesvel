/**
 * Add Link Headers Configuration Options
 *
 * Adds Link headers for resource preloading (early hints/HTTP/2 push).
 * Improves page load performance by allowing browsers to preload resources.
 */
export interface AddLinkHeadersOptions {
  /**
   * Assets to preload with their attributes.
   * Key is the asset URL, value is the Link header attributes.
   *
   * @example
   * {
   *   '/assets/app.js': ['rel=preload', 'as=script'],
   *   '/assets/style.css': ['rel=preload', 'as=style'],
   * }
   */
  assets?: Record<string, string[]>;

  /**
   * Function to dynamically generate assets based on request.
   */
  assetsFunction?: (req: any) => Record<string, string[]>;

  /**
   * Maximum number of assets to preload.
   * Prevents overwhelming the browser with too many preload hints.
   *
   * @default undefined (no limit)
   */
  limit?: number;

  /**
   * Whether to merge with existing Link headers.
   *
   * @default true
   */
  merge?: boolean;
}
