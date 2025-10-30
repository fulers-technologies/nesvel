/**
 * Feature Flags
 *
 * Toggle features on/off for different environments or A/B testing.
 */
export const featureFlags = {
  /**
   * Enable Progressive Web App features
   */
  pwa: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',

  /**
   * Enable analytics tracking
   */
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false',

  /**
   * Enable sitemap generation
   */
  sitemap: true,

  /**
   * Enable internationalization (i18n)
   */
  i18n: false,

  /**
   * Enable dark mode toggle
   */
  darkMode: true,

  /**
   * Enable cookie consent banner
   */
  cookieConsent: true,
} as const;

/**
 * Type export for TypeScript consumers
 */
export type FeatureFlags = typeof featureFlags;
