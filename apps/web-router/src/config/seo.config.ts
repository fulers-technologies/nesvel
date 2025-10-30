import { urlConfig } from './url.config';
import { appMetadata } from './metadata.config';
import { socialConfig } from './social.config';

/**
 * SEO Configuration
 *
 * Default SEO settings and Open Graph configuration.
 */
export const seoConfig = {
  /**
   * Default page title template
   * %s will be replaced with the page-specific title
   * @example 'About | Nesvel'
   */
  titleTemplate: '%s | Nesvel',

  /**
   * Default title when no page title is provided
   */
  defaultTitle: appMetadata.name,

  /**
   * Default meta description
   */
  defaultDescription: appMetadata.description,

  /**
   * Canonical URL base
   * Used to prevent duplicate content issues
   */
  canonicalBase: urlConfig.base,

  /**
   * Open Graph default settings
   * Used for social media sharing previews
   */
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: appMetadata.name,
    /**
     * Default OG image (absolute URL)
     * Recommended size: 1200x630px
     */
    defaultImage: `${urlConfig.base}/og-image.png`,
    imageWidth: 1200,
    imageHeight: 630,
  },

  /**
   * Twitter Card settings
   */
  twitter: {
    /**
     * Card type: 'summary' | 'summary_large_image' | 'app' | 'player'
     */
    cardType: 'summary_large_image',
    site: socialConfig.twitterHandle,
  },

  /**
   * Robots meta tag defaults
   */
  robots: {
    /**
     * Allow search engines to index pages
     */
    index: true,

    /**
     * Allow search engines to follow links
     */
    follow: true,

    /**
     * Allow search engines to cache pages
     */
    archive: true,

    /**
     * Allow showing snippet in search results
     */
    snippet: true,

    /**
     * Allow showing image preview in search results
     */
    imagePreview: true,
  },
} as const;

/**
 * Type export for TypeScript consumers
 */
export type SeoConfig = typeof seoConfig;
