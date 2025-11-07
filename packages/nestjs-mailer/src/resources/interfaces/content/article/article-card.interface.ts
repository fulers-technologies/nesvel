import type { ImageConfig } from '../common/image-config.interface';

/**
 * Article card data structure.
 */
export interface ArticleCard {
  /**
   * Card image.
   */
  image: ImageConfig;

  /**
   * Card category or label.
   */
  category: string;

  /**
   * Card title.
   */
  title: string;

  /**
   * Card description.
   */
  description: string;
}
