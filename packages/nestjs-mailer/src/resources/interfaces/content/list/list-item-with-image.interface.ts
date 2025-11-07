import type { ImageConfig } from '../common/image-config.interface';
import type { ListItem } from './list-item.interface';

/**
 * List item with image structure.
 */
export interface ListItemWithImage extends ListItem {
  /**
   * Item image.
   */
  image: ImageConfig;

  /**
   * Optional "learn more" link URL.
   */
  learnMoreUrl?: string;
}
