/**
 * Analytics Provider Types
 *
 * All supported tracking and analytics providers.
 */
export type AnalyticsProvider =
  | 'google' // Google Analytics (GA4)
  | 'facebook' // Facebook Pixel
  | 'tiktok' // TikTok Pixel
  | 'snapchat' // Snapchat Pixel
  | 'linkedin' // LinkedIn Insight Tag
  | 'twitter' // Twitter/X Pixel
  | 'pinterest' // Pinterest Tag
  | 'reddit' // Reddit Pixel
  | 'vercel' // Vercel Analytics
  | 'plausible' // Plausible Analytics
  | 'mixpanel' // Mixpanel
  | 'segment' // Segment
  | 'amplitude' // Amplitude
  | 'hotjar' // Hotjar
  | 'custom'; // Custom provider

/**
 * Event Category Types
 *
 * Predefined categories for consistent event tracking across the application.
 */
export type EventCategory =
  | 'engagement'
  | 'conversion'
  | 'navigation'
  | 'user'
  | 'error'
  | 'performance'
  | 'social'
  | 'video'
  | 'download'
  | 'form';

/**
 * Custom Event Structure
 *
 * Interface for custom analytics events.
 */
export interface AnalyticsEvent {
  /**
   * Event name (action)
   * @example 'button_click', 'form_submit', 'video_play'
   */
  name: string;

  /**
   * Event category
   */
  category: EventCategory;

  /**
   * Event label (additional context)
   */
  label?: string;

  /**
   * Numeric value associated with the event
   */
  value?: number;

  /**
   * Additional custom parameters
   */
  params?: Record<string, string | number | boolean>;
}

/**
 * Google Analytics Configuration
 */
export const googleAnalyticsConfig = {
  /**
   * Google Analytics Measurement ID
   * Format: G-XXXXXXXXXX (GA4) or UA-XXXXXXXXX (Universal Analytics - deprecated)
   *
   * Get your ID from: https://analytics.google.com/
   * @example 'G-XXXXXXXXXX'
   */
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',

  /**
   * Enable Google Analytics tracking
   * Automatically disabled if measurementId is empty
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

  /**
   * Debug mode
   * Enables verbose logging in browser console
   * Useful for testing analytics implementation
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Anonymize IP addresses
   * Removes the last octet of IPv4 addresses (GDPR compliance)
   * @see https://support.google.com/analytics/answer/2763052
   */
  anonymizeIp: true,

  /**
   * Cookie configuration
   */
  cookie: {
    /**
     * Cookie prefix for GA cookies
     * Default: '_ga'
     */
    prefix: '_ga',

    /**
     * Cookie domain
     * Use 'auto' for automatic domain detection
     * Or specify your domain for cross-subdomain tracking
     */
    domain: 'auto',

    /**
     * Cookie expiration in seconds
     * Default: 63072000 (2 years)
     */
    expires: 63072000,

    /**
     * Cookie flags
     */
    flags: 'SameSite=None;Secure',
  },

  /**
   * Page view tracking configuration
   */
  pageView: {
    /**
     * Automatically track page views
     * Set to false for manual tracking
     */
    auto: true,

    /**
     * Include URL parameters in page tracking
     * Set to false to exclude query strings for privacy
     */
    includeParams: false,

    /**
     * Send page view on route change (SPA)
     */
    trackRouteChange: true,
  },

  /**
   * User properties to track
   * Do not include PII (Personally Identifiable Information)
   */
  userProperties: {
    /**
     * Track user's preferred theme
     */
    trackTheme: true,

    /**
     * Track user's preferred language
     */
    trackLanguage: true,

    /**
     * Track device type (mobile, tablet, desktop)
     */
    trackDeviceType: true,
  },

  /**
   * Enhanced measurement features
   * Available in GA4
   */
  enhancedMeasurement: {
    /**
     * Track scroll depth (25%, 50%, 75%, 90%, 100%)
     */
    scrollTracking: true,

    /**
     * Track outbound link clicks
     */
    outboundLinks: true,

    /**
     * Track site search
     */
    siteSearch: true,

    /**
     * Track video engagement (YouTube embeds)
     */
    videoEngagement: true,

    /**
     * Track file downloads
     */
    fileDownloads: true,
  },
} as const;

/**
 * Facebook Pixel Configuration
 *
 * @see https://www.facebook.com/business/help/952192354843755
 */
export const facebookPixelConfig = {
  /**
   * Facebook Pixel ID
   * Format: Numeric ID (e.g., 1234567890123456)
   * Get from: Facebook Events Manager
   */
  pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',

  /**
   * Enable Facebook Pixel tracking
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' && !!process.env.NEXT_PUBLIC_FB_PIXEL_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,

  /**
   * Advanced matching
   * Automatically includes hashed user data for better attribution
   */
  advancedMatching: true,
} as const;

/**
 * TikTok Pixel Configuration
 *
 * @see https://ads.tiktok.com/help/article/standard-mode-setup
 */
export const tiktokPixelConfig = {
  /**
   * TikTok Pixel ID
   */
  pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',

  /**
   * Enable TikTok Pixel tracking
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,
} as const;

/**
 * Snapchat Pixel Configuration
 *
 * @see https://businesshelp.snapchat.com/s/article/pixel-website-install
 */
export const snapchatPixelConfig = {
  /**
   * Snapchat Pixel ID
   */
  pixelId: process.env.NEXT_PUBLIC_SNAP_PIXEL_ID || '',

  /**
   * Enable Snapchat Pixel tracking
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_SNAP_PIXEL_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,

  /**
   * User email (hashed) for advanced matching
   */
  userEmail: '',
} as const;

/**
 * LinkedIn Insight Tag Configuration
 *
 * @see https://www.linkedin.com/help/lms/answer/a417993
 */
export const linkedinInsightConfig = {
  /**
   * LinkedIn Partner ID
   */
  partnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',

  /**
   * Enable LinkedIn Insight Tag
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,
} as const;

/**
 * Twitter/X Pixel Configuration
 *
 * @see https://business.twitter.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites.html
 */
export const twitterPixelConfig = {
  /**
   * Twitter Pixel ID
   */
  pixelId: process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID || '',

  /**
   * Enable Twitter Pixel tracking
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,
} as const;

/**
 * Pinterest Tag Configuration
 *
 * @see https://help.pinterest.com/en/business/article/track-conversions-with-pinterest-tag
 */
export const pinterestTagConfig = {
  /**
   * Pinterest Tag ID
   */
  tagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || '',

  /**
   * Enable Pinterest Tag
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_PINTEREST_TAG_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,
} as const;

/**
 * Reddit Pixel Configuration
 *
 * @see https://advertising.reddithelp.com/en/categories/measurement/reddit-pixel
 */
export const redditPixelConfig = {
  /**
   * Reddit Pixel ID
   */
  pixelId: process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || '',

  /**
   * Enable Reddit Pixel tracking
   */
  enabled:
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false' &&
    !!process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID,

  /**
   * Debug mode
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Auto-track page views
   */
  autoPageView: true,
} as const;

/**
 * Vercel Analytics Configuration
 *
 * @see https://vercel.com/analytics
 */
export const vercelAnalyticsConfig = {
  /**
   * Enable Vercel Analytics
   * Automatically enabled for Vercel deployments
   */
  enabled:
    process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED === 'true' ||
    process.env.VERCEL_ENV === 'production',

  /**
   * Debug mode
   * Shows analytics events in console
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * Before send callback
   * Modify or filter events before sending
   */
  beforeSend: (event: { name: string; [key: string]: unknown }) => {
    // Filter out events with sensitive data
    // Return null to prevent sending
    return event;
  },
} as const;

/**
 * Vercel Speed Insights Configuration
 *
 * Tracks Web Vitals and performance metrics
 * @see https://vercel.com/docs/speed-insights
 */
export const speedInsightsConfig = {
  /**
   * Enable Speed Insights
   */
  enabled:
    process.env.NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ENABLED === 'true' ||
    process.env.VERCEL_ENV === 'production',

  /**
   * Sample rate (0.0 to 1.0)
   * 1.0 = track all page views
   * 0.1 = track 10% of page views
   */
  sampleRate: 1.0,

  /**
   * Track route changes in SPA
   */
  route: true,

  /**
   * Script loading strategy
   * - beforeInteractive: Load before page is interactive
   * - afterInteractive: Load after page is interactive (default)
   * - lazyOnload: Load during idle time
   */
  scriptSrc: 'afterInteractive',
} as const;

/**
 * Privacy & Consent Configuration
 *
 * GDPR and privacy-related settings.
 */
export const privacyConfig = {
  /**
   * Require cookie consent before tracking
   * Shows consent banner on first visit
   */
  requireConsent: true,

  /**
   * Cookie consent storage key
   * Used to remember user's consent choice
   */
  consentStorageKey: 'nesvel_analytics_consent',

  /**
   * Cookie consent expiration (days)
   * How long to remember consent choice
   */
  consentExpiration: 365,

  /**
   * Respect Do Not Track (DNT) browser setting
   * If enabled, disables tracking for users with DNT enabled
   */
  respectDNT: true,

  /**
   * Anonymize all tracking data
   * Removes PII from all analytics events
   */
  anonymizeData: true,

  /**
   * Allowed analytics providers when consent is given
   */
  consentOptions: {
    /**
     * Essential analytics (always allowed)
     * Error tracking, performance monitoring
     */
    essential: ['vercel'],

    /**
     * Marketing analytics (requires consent)
     * Google Analytics, conversion tracking
     */
    marketing: ['google'],

    /**
     * Functional analytics (requires consent)
     * User preferences, feature usage
     */
    functional: ['custom'],
  },
} as const;

/**
 * Custom Event Tracking Configuration
 *
 * Configuration for custom application-specific events.
 */
export const customEventsConfig = {
  /**
   * Enable custom event tracking
   */
  enabled: true,

  /**
   * Predefined events to track automatically
   */
  autoTrack: {
    /**
     * Track button clicks with data-track attribute
     */
    buttons: true,

    /**
     * Track form submissions
     */
    forms: true,

    /**
     * Track link clicks
     */
    links: true,

    /**
     * Track errors and exceptions
     */
    errors: true,

    /**
     * Track performance metrics (CLS, FID, LCP, etc.)
     */
    performance: true,
  },

  /**
   * Batch events before sending
   * Reduces number of analytics calls
   */
  batching: {
    enabled: true,
    /**
     * Maximum number of events in a batch
     */
    maxSize: 10,
    /**
     * Maximum time to wait before sending batch (ms)
     */
    maxWait: 5000,
  },
} as const;

/**
 * Development & Debug Configuration
 */
export const debugConfig = {
  /**
   * Enable debug logging
   * Logs all analytics events to console
   */
  enabled: process.env.NODE_ENV === 'development',

  /**
   * Log level
   * - verbose: All events and details
   * - info: Important events only
   * - error: Errors only
   */
  logLevel: 'verbose' as 'verbose' | 'info' | 'error',

  /**
   * Show visual indicators for tracked elements
   * Highlights buttons, links, forms with tracking
   */
  visualIndicators: false,

  /**
   * Dry run mode
   * Logs events but doesn't send to providers
   * Useful for testing without polluting analytics data
   */
  dryRun: process.env.NEXT_PUBLIC_ANALYTICS_DRY_RUN === 'true',
} as const;

/**
 * E-commerce Tracking Configuration
 *
 * Configuration for tracking e-commerce events (if applicable).
 */
export const ecommerceConfig = {
  /**
   * Enable e-commerce tracking
   */
  enabled: false,

  /**
   * Currency code (ISO 4217)
   * @example 'USD', 'EUR', 'GBP'
   */
  currency: 'USD',

  /**
   * Track purchase funnel steps
   */
  funnel: {
    productView: true,
    addToCart: true,
    beginCheckout: true,
    addPaymentInfo: true,
    addShippingInfo: true,
    purchase: true,
  },
} as const;

/**
 * Combined Analytics Configuration
 *
 * Aggregates all analytics settings into a single object.
 */
export const analyticsConfig = {
  /**
   * Google Analytics settings
   */
  google: googleAnalyticsConfig,

  /**
   * Facebook Pixel settings
   */
  facebook: facebookPixelConfig,

  /**
   * TikTok Pixel settings
   */
  tiktok: tiktokPixelConfig,

  /**
   * Snapchat Pixel settings
   */
  snapchat: snapchatPixelConfig,

  /**
   * LinkedIn Insight Tag settings
   */
  linkedin: linkedinInsightConfig,

  /**
   * Twitter/X Pixel settings
   */
  twitter: twitterPixelConfig,

  /**
   * Pinterest Tag settings
   */
  pinterest: pinterestTagConfig,

  /**
   * Reddit Pixel settings
   */
  reddit: redditPixelConfig,

  /**
   * Vercel Analytics settings
   */
  vercel: vercelAnalyticsConfig,

  /**
   * Speed Insights settings
   */
  speedInsights: speedInsightsConfig,

  /**
   * Privacy & consent settings
   */
  privacy: privacyConfig,

  /**
   * Custom events settings
   */
  customEvents: customEventsConfig,

  /**
   * Debug settings
   */
  debug: debugConfig,

  /**
   * E-commerce settings
   */
  ecommerce: ecommerceConfig,

  /**
   * Get list of enabled providers
   */
  get enabledProviders(): AnalyticsProvider[] {
    const providers: AnalyticsProvider[] = [];
    if (this.google.enabled) providers.push('google');
    if (this.facebook.enabled) providers.push('facebook');
    if (this.tiktok.enabled) providers.push('tiktok');
    if (this.snapchat.enabled) providers.push('snapchat');
    if (this.linkedin.enabled) providers.push('linkedin');
    if (this.twitter.enabled) providers.push('twitter');
    if (this.pinterest.enabled) providers.push('pinterest');
    if (this.reddit.enabled) providers.push('reddit');
    if (this.vercel.enabled) providers.push('vercel');
    if (this.customEvents.enabled) providers.push('custom');
    return providers;
  },

  /**
   * Check if any analytics provider is enabled
   */
  get isEnabled(): boolean {
    return this.enabledProviders.length > 0;
  },

  /**
   * Check if user has DNT enabled
   */
  get isDNTEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      navigator.doNotTrack === '1' ||
      // @ts-expect-error - msDoNotTrack is not in types but exists in IE
      window.doNotTrack === '1' ||
      navigator.doNotTrack === 'yes'
    );
  },

  /**
   * Check if tracking should be disabled
   */
  get shouldDisableTracking(): boolean {
    return this.privacy.respectDNT && this.isDNTEnabled;
  },
} as const;

/**
 * Type exports for TypeScript consumers
 */
export type AnalyticsConfig = typeof analyticsConfig;
export type GoogleAnalyticsConfig = typeof googleAnalyticsConfig;
export type VercelAnalyticsConfig = typeof vercelAnalyticsConfig;
export type PrivacyConfig = typeof privacyConfig;
export type CustomEventsConfig = typeof customEventsConfig;
