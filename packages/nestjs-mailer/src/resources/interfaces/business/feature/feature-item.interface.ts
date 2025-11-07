import type { ImageConfig } from '../common/image-config.interface';

/**
 * Single feature item structure.
 */
export interface FeatureItem {
  /**
   * Feature icon image.
   */
  icon: ImageConfig;

  /**
   * Feature title.
   */
  title: string;

  /**
   * Feature description.
   */
  description: string;
}
