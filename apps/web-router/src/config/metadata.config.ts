/**
 * Application Metadata
 *
 * Core information about the application including name, description,
 * and version information.
 */
export const appMetadata = {
  /**
   * Application name
   * Used in: Page titles, PWA manifest, meta tags
   */
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Nesvel',

  /**
   * Short name for PWA
   * Used when space is limited (e.g., mobile home screen)
   * @maxLength 12 characters recommended
   */
  shortName: 'Nesvel',

  /**
   * Application description
   * Used in: Meta description, PWA manifest, SEO
   * @maxLength 160 characters recommended for SEO
   */
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern full-stack application built with Next.js',

  /**
   * Application version
   * Follows semantic versioning (major.minor.patch)
   */
  version: '1.0.0',

  /**
   * Author information
   */
  author: {
    name: 'Nesvel Team',
    email: 'hello@nesvel.com',
    url: 'https://nesvel.com',
  },

  /**
   * Application keywords for SEO
   * Used in meta keywords and search engine optimization
   */
  keywords: ['nextjs', 'react', 'typescript', 'full-stack', 'web application'],
} as const;

/**
 * Type export for TypeScript consumers
 */
export type AppMetadata = typeof appMetadata;
