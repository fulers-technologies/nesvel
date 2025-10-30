// ============================================================================
// APP CONFIGURATION
// ============================================================================

/**
 * Application Metadata
 * App name, description, version, author, keywords
 */
export { appMetadata } from './metadata.config';
export type { AppMetadata } from './metadata.config';

/**
 * URL Configuration
 * Base URLs, API endpoints, CDN, assets
 */
export { urlConfig } from './url.config';
export type { UrlConfig } from './url.config';

/**
 * Brand Configuration
 * Colors, logos, favicons, visual identity
 */
export { brandConfig } from './brand.config';
export type { BrandConfig } from './brand.config';

/**
 * Social Media Configuration
 * Social profiles, handles, sharing settings
 */
export { socialConfig } from './social.config';
export type { SocialConfig } from './social.config';

/**
 * SEO Configuration
 * Meta tags, Open Graph, Twitter Cards, robots
 */
export { seoConfig } from './seo.config';
export type { SeoConfig } from './seo.config';

/**
 * Feature Flags
 * Toggle features on/off for different environments
 */
export { featureFlags } from './features.config';
export type { FeatureFlags } from './features.config';

/**
 * Internationalization Configuration
 * Locales, translations, domain routing
 */
export { i18nConfig } from './i18n.config';
export type { I18nConfig } from './i18n.config';

/**
 * Contact Information
 * Support, sales, general emails, phone, address
 */
export { contactConfig } from './contact.config';
export type { ContactConfig } from './contact.config';

/**
 * Legal Configuration
 * Privacy, terms, cookies, company info
 */
export { legalConfig } from './legal.config';
export type { LegalConfig } from './legal.config';

// ============================================================================
// SITEMAP CONFIGURATION
// ============================================================================

/**
 * Sitemap Configuration
 * SEO sitemap generation settings
 */
export { sitemapConfig, routePriorities, changeFrequencies } from './sitemap.config';
export type {
  ChangeFrequency,
  SitemapEntry,
  SitemapConfig,
  RoutePriorities,
  ChangeFrequencies,
} from './sitemap.config';

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

/**
 * Analytics Configuration
 * Tracking, privacy, events, e-commerce
 */
export {
  analyticsConfig,
  googleAnalyticsConfig,
  vercelAnalyticsConfig,
  speedInsightsConfig,
  privacyConfig,
  customEventsConfig,
  debugConfig as analyticsDebugConfig,
  ecommerceConfig,
} from './analytics.config';

export type {
  AnalyticsProvider,
  EventCategory,
  AnalyticsEvent,
  AnalyticsConfig,
  GoogleAnalyticsConfig,
  VercelAnalyticsConfig,
  PrivacyConfig,
  CustomEventsConfig,
} from './analytics.config';

// ============================================================================
// PWA CONFIGURATION
// ============================================================================

/**
 * Progressive Web App Configuration
 * Manifest, service worker, caching, offline
 */
export {
  pwaConfig,
  manifestConfig,
  serviceWorkerConfig,
  cachingConfig,
  offlineConfig,
  installPromptConfig,
  pushNotificationsConfig,
  developmentConfig as pwaDevConfig,
} from './pwa.config';

export type {
  DisplayMode,
  OrientationLock,
  CacheStrategy,
  PwaConfig,
  ManifestConfig,
  ServiceWorkerConfig,
  CachingConfig,
  OfflineConfig,
  InstallPromptConfig,
  PushNotificationsConfig,
} from './pwa.config';

// ============================================================================
// AGGREGATED CONFIGURATIONS
// ============================================================================

// Import all configs for aggregation
import { appMetadata } from './metadata.config';
import { urlConfig } from './url.config';
import { brandConfig } from './brand.config';
import { socialConfig } from './social.config';
import { seoConfig } from './seo.config';
import { featureFlags } from './features.config';
import { i18nConfig } from './i18n.config';
import { contactConfig } from './contact.config';
import { legalConfig } from './legal.config';
import { sitemapConfig } from './sitemap.config';
import { analyticsConfig } from './analytics.config';
import { pwaConfig } from './pwa.config';

/**
 * Combined App Configuration
 *
 * All app-related configs grouped together
 *
 * @example
 * ```ts
 * import { appConfig } from '@/config';
 *
 * console.log(appConfig.metadata.name);
 * console.log(appConfig.urls.base);
 * console.log(appConfig.brand.colors.primary);
 * ```
 */
export const appConfig = {
  metadata: appMetadata,
  urls: urlConfig,
  brand: brandConfig,
  social: socialConfig,
  seo: seoConfig,
  features: featureFlags,
  i18n: i18nConfig,
  contact: contactConfig,
  legal: legalConfig,
} as const;

/**
 * All Configurations Combined
 *
 * Single object containing all application configurations.
 * Useful when you need access to multiple config areas.
 *
 * @example
 * ```ts
 * import { allConfig } from '@/config';
 *
 * console.log(allConfig.app.metadata.name);
 * console.log(allConfig.analytics.google.measurementId);
 * console.log(allConfig.sitemap.siteUrl);
 * console.log(allConfig.pwa.isEnabled);
 * ```
 */
export const allConfig = {
  app: appConfig,
  sitemap: sitemapConfig,
  analytics: analyticsConfig,
  pwa: pwaConfig,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Type for combined app configuration
 */
export type AppConfig = typeof appConfig;

/**
 * Type for all configurations combined
 */
export type AllConfig = typeof allConfig;

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Check if running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Get environment name
 */
export const environment = process.env.NODE_ENV || 'development';

/**
 * Check if feature is enabled
 *
 * @param feature - Feature name from featureFlags
 * @returns Whether the feature is enabled
 *
 * @example
 * ```ts
 * import { isFeatureEnabled } from '@/config';
 *
 * if (isFeatureEnabled('pwa')) {
 *   // PWA code here
 * }
 * ```
 */
export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature] === true;
};

/**
 * Get full URL for a path
 *
 * @param path - Path to append to base URL
 * @returns Full URL
 *
 * @example
 * ```ts
 * import { getFullUrl } from '@/config';
 *
 * const url = getFullUrl('/blog/post-1');
 * // Returns: 'https://example.com/blog/post-1'
 * ```
 */
export const getFullUrl = (path: string): string => {
  const base = urlConfig.base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

/**
 * Get CDN URL for an asset
 *
 * @param assetPath - Asset path
 * @returns CDN URL or base URL if CDN not configured
 *
 * @example
 * ```ts
 * import { getCdnUrl } from '@/config';
 *
 * const imageUrl = getCdnUrl('/images/hero.jpg');
 * ```
 */
export const getCdnUrl = (assetPath: string): string => {
  const cdn = urlConfig.cdn || urlConfig.base;
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${cdn}${cleanPath}`;
};

/**
 * Get locale-specific URL
 *
 * @param path - Path to localize
 * @param locale - Locale code (defaults to default locale)
 * @returns Localized URL
 *
 * @example
 * ```ts
 * import { getLocalizedUrl } from '@/config';
 *
 * const url = getLocalizedUrl('/about', 'es');
 * // Returns: '/es/about' or domain-based URL
 * ```
 */
export const getLocalizedUrl = (path: string, locale?: string): string => {
  const targetLocale = locale || i18nConfig.defaultLocale;

  // If locale is default, return path as-is
  if (targetLocale === i18nConfig.defaultLocale) {
    return path;
  }

  // Check if domain-based routing is configured
  const domain = i18nConfig.domains[targetLocale as keyof typeof i18nConfig.domains];
  if (domain) {
    return `https://${domain}${path}`;
  }

  // Otherwise, use path-based routing
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${targetLocale}${cleanPath}`;
};

/**
 * Get social profile URL
 *
 * @param platform - Social media platform
 * @returns Profile URL or empty string if not configured
 *
 * @example
 * ```ts
 * import { getSocialUrl } from '@/config';
 *
 * const twitterUrl = getSocialUrl('twitter');
 * ```
 */
export const getSocialUrl = (platform: keyof typeof socialConfig.profiles): string => {
  return socialConfig.profiles[platform] || '';
};

/**
 * Configuration object with utility methods
 *
 * @example
 * ```ts
 * import { config } from '@/config';
 *
 * console.log(config.app.metadata.name);
 * console.log(config.isProduction);
 * console.log(config.getFullUrl('/about'));
 * ```
 */
export const config = {
  // All configurations
  ...allConfig,

  // Individual configs for direct access
  metadata: appMetadata,
  urls: urlConfig,
  brand: brandConfig,
  social: socialConfig,
  seo: seoConfig,
  features: featureFlags,
  i18n: i18nConfig,
  contact: contactConfig,
  legal: legalConfig,

  // Environment
  isProduction,
  isDevelopment,
  isTest,
  environment,

  // Utility methods
  isFeatureEnabled,
  getFullUrl,
  getCdnUrl,
  getLocalizedUrl,
  getSocialUrl,
} as const;

/**
 * Default export for convenience
 *
 * @example
 * ```ts
 * import config from '@/config';
 *
 * console.log(config.metadata.name);
 * console.log(config.isProduction);
 * ```
 */
export default config;
