import type { ImageConfig } from '../common/image-config.interface';

/**
 * Bento grid product item structure.
 */
export interface BentoGridProduct {
  /**
   * Product image.
   */
  image: ImageConfig;

  /**
   * Product title.
   */
  title: string;

  /**
   * Product description.
   */
  description: string;

  /**
   * Product link URL.
   */
  linkUrl: string;
}
