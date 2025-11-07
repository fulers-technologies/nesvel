import type { ImageConfig } from '../common/image-config.interface';

/**
 * Gallery item structure.
 */
export interface GalleryItem {
  /**
   * Image configuration.
   */
  image: ImageConfig;

  /**
   * Optional link URL for the image.
   */
  href?: string;
}
