import { brandConfig } from './brand.config';
import { appMetadata } from './metadata.config';

/**
 * Display Mode
 *
 * Controls how the app appears when launched from home screen.
 */
export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

/**
 * Orientation Lock
 *
 * Controls device orientation when app is running.
 */
export type OrientationLock =
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';

/**
 * Cache Strategy
 *
 * Workbox caching strategies for different resource types.
 */
export type CacheStrategy =
  | 'CacheFirst' // Cache first, fall back to network
  | 'NetworkFirst' // Network first, fall back to cache
  | 'StaleWhileRevalidate' // Serve from cache while updating in background
  | 'NetworkOnly' // Network only, no cache
  | 'CacheOnly'; // Cache only, no network

/**
 * PWA Manifest Configuration
 *
 * Defines how the app appears when installed.
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export const manifestConfig = {
  /**
   * Application name (full name)
   * Displayed when there's enough space
   */
  name: appMetadata.name,

  /**
   * Short application name
   * Displayed when space is limited (e.g., home screen)
   * @maxLength 12 characters recommended
   */
  short_name: appMetadata.shortName,

  /**
   * Application description
   */
  description: appMetadata.description,

  /**
   * Start URL
   * The URL that loads when the app is launched
   * Use relative path for flexibility across domains
   */
  start_url: '/',

  /**
   * Scope
   * Defines the navigation scope of the app
   * URLs outside this scope open in browser
   */
  scope: '/',

  /**
   * Display mode
   * How the app appears when launched
   *
   * Options:
   * - standalone: Looks like a native app
   * - fullscreen: Full screen, no browser UI
   * - minimal-ui: Minimal browser UI
   * - browser: Opens in browser tab
   */
  display: 'standalone' as DisplayMode,

  /**
   * Theme color
   * Color of the browser UI around the app
   */
  theme_color: brandConfig.colors.primary,

  /**
   * Background color
   * Splash screen background color while app loads
   */
  background_color: brandConfig.colors.background,

  /**
   * Orientation
   * Lock device orientation when app is running
   */
  orientation: 'any' as OrientationLock,

  /**
   * Application icons
   * Multiple sizes for different devices and contexts
   *
   * Required sizes:
   * - 72x72: Android launcher
   * - 96x96: Android launcher
   * - 128x128: Android launcher
   * - 144x144: Android launcher
   * - 152x152: iOS home screen
   * - 192x192: Android launcher (baseline)
   * - 384x384: Android launcher
   * - 512x512: Android splash screen
   */
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    // Maskable icons for adaptive icons on Android
    {
      src: '/icons/icon-192x192-maskable.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: '/icons/icon-512x512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],

  /**
   * Screenshots for app stores and installation prompts
   * @see https://web.dev/app-like-pwas/#screenshots
   */
  screenshots: [
    // Mobile screenshots (required for app stores)
    // {
    //   src: '/screenshots/mobile-1.png',
    //   sizes: '540x720',
    //   type: 'image/png',
    //   form_factor: 'narrow',
    // },
    // Desktop screenshots
    // {
    //   src: '/screenshots/desktop-1.png',
    //   sizes: '1280x720',
    //   type: 'image/png',
    //   form_factor: 'wide',
    // },
  ],

  /**
   * Categories
   * Helps users discover the app in app stores
   * @see https://github.com/w3c/manifest/wiki/Categories
   */
  categories: ['productivity', 'utilities'],

  /**
   * Language direction
   * - ltr: Left to right
   * - rtl: Right to left
   * - auto: Based on language
   */
  dir: 'ltr',

  /**
   * Default language
   */
  lang: 'en',

  /**
   * Related applications
   * Links to native apps in app stores
   */
  related_applications: [],

  /**
   * Prefer related applications
   * If true, promotes native apps over PWA
   */
  prefer_related_applications: false,
} as const;

/**
 * Service Worker Configuration
 *
 * Controls how the service worker behaves and caches content.
 */
export const serviceWorkerConfig = {
  /**
   * Enable service worker
   * Set to false to disable PWA features
   */
  enabled: process.env.NEXT_PUBLIC_PWA_ENABLED === 'true',

  /**
   * Service worker scope
   * Must be same or broader than manifest scope
   */
  scope: '/',

  /**
   * Update check interval (milliseconds)
   * How often to check for service worker updates
   * Default: 1 hour
   */
  updateInterval: 60 * 60 * 1000,

  /**
   * Skip waiting
   * If true, new service worker activates immediately
   * If false, waits for all tabs to close
   */
  skipWaiting: true,

  /**
   * Client claim
   * If true, service worker takes control immediately
   */
  clientsClaim: true,

  /**
   * Clean old caches
   * Automatically remove old cache versions
   */
  cleanupOutdatedCaches: true,
} as const;

/**
 * Caching Configuration
 *
 * Defines what and how content is cached.
 */
export const cachingConfig = {
  /**
   * Cache name prefix
   * Helps identify caches in DevTools
   */
  cacheNamePrefix: 'nesvel',

  /**
   * Cache strategies for different resources
   */
  strategies: {
    /**
     * Static assets (JS, CSS, fonts, images)
     * Cache first for best performance
     */
    static: {
      strategy: 'CacheFirst' as CacheStrategy,
      cacheName: 'static-resources',
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },

    /**
     * API responses
     * Network first to get fresh data
     */
    api: {
      strategy: 'NetworkFirst' as CacheStrategy,
      cacheName: 'api-responses',
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutes
    },

    /**
     * Images
     * Cache first with long expiration
     */
    images: {
      strategy: 'CacheFirst' as CacheStrategy,
      cacheName: 'images',
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },

    /**
     * Pages/HTML
     * Stale while revalidate for good UX
     */
    pages: {
      strategy: 'StaleWhileRevalidate' as CacheStrategy,
      cacheName: 'pages',
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 1 day
    },
  },

  /**
   * Precache
   * Resources to cache on service worker installation
   */
  precache: [
    '/',
    '/offline',
    // Add critical pages and assets here
  ],

  /**
   * Runtime caching patterns
   * URL patterns to cache at runtime
   */
  runtimeCaching: [
    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst' as CacheStrategy,
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst' as CacheStrategy,
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
  ],
} as const;

/**
 * Offline Configuration
 *
 * Settings for offline functionality.
 */
export const offlineConfig = {
  /**
   * Offline page path
   * Fallback page when offline and requested page not cached
   */
  fallbackPage: '/offline',

  /**
   * Offline image
   * Fallback image when offline and requested image not cached
   */
  fallbackImage: '/images/offline-placeholder.png',

  /**
   * Enable offline analytics
   * Queue analytics events when offline
   */
  offlineAnalytics: true,

  /**
   * Offline timeout
   * Time to wait before considering request failed (ms)
   */
  timeout: 3000,
} as const;

/**
 * Install Prompt Configuration
 *
 * Settings for the "Add to Home Screen" prompt.
 */
export const installPromptConfig = {
  /**
   * Enable custom install prompt
   * Show custom UI instead of browser default
   */
  enabled: true,

  /**
   * Delay before showing prompt (ms)
   * Wait before showing install prompt on first visit
   */
  delay: 3000,

  /**
   * Days before reshowing prompt
   * After user dismisses, wait this many days
   */
  daysBeforeReminder: 7,

  /**
   * Maximum dismissals
   * Stop showing after user dismisses this many times
   */
  maxDismissals: 3,

  /**
   * Storage key for tracking dismissals
   */
  storageKey: 'pwa-install-prompt',
} as const;

/**
 * Push Notifications Configuration
 *
 * Settings for web push notifications (optional).
 */
export const pushNotificationsConfig = {
  /**
   * Enable push notifications
   */
  enabled: false,

  /**
   * VAPID public key
   * Required for web push
   * Generate at: https://web-push-codelab.glitch.me/
   */
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',

  /**
   * Notification options
   */
  options: {
    /**
     * Require visible notification
     * Show notification even when app is in focus
     */
    requireInteraction: false,

    /**
     * Badge path
     * Monochrome icon for notification badge
     */
    badge: '/icons/badge-72x72.png',

    /**
     * Default icon
     */
    icon: '/icons/icon-192x192.png',

    /**
     * Vibration pattern (ms)
     */
    vibrate: [100, 50, 100],

    /**
     * Notification tag
     * Groups related notifications
     */
    tag: 'nesvel-notification',
  },
} as const;

/**
 * Development Configuration
 *
 * Settings for PWA development and testing.
 */
export const developmentConfig = {
  /**
   * Disable PWA in development
   * Set to true to test PWA features locally
   */
  disableInDevelopment: process.env.NODE_ENV === 'development',

  /**
   * Force HTTPS
   * Service workers require HTTPS (except localhost)
   */
  requireHttps: process.env.NODE_ENV === 'production',

  /**
   * Debug mode
   * Verbose logging for PWA features
   */
  debug: process.env.NODE_ENV === 'development',

  /**
   * SW file path
   * Location of service worker file
   */
  swFilePath: '/sw.js',
} as const;

/**
 * Combined PWA Configuration
 *
 * Aggregates all PWA settings into a single object.
 */
export const pwaConfig = {
  /**
   * Manifest configuration
   */
  manifest: manifestConfig,

  /**
   * Service worker configuration
   */
  serviceWorker: serviceWorkerConfig,

  /**
   * Caching configuration
   */
  caching: cachingConfig,

  /**
   * Offline configuration
   */
  offline: offlineConfig,

  /**
   * Install prompt configuration
   */
  installPrompt: installPromptConfig,

  /**
   * Push notifications configuration
   */
  pushNotifications: pushNotificationsConfig,

  /**
   * Development configuration
   */
  development: developmentConfig,

  /**
   * Check if PWA is enabled
   */
  get isEnabled(): boolean {
    if (this.development.disableInDevelopment) {
      return false;
    }
    return this.serviceWorker.enabled;
  },
} as const;

/**
 * Type exports for TypeScript consumers
 */
export type PwaConfig = typeof pwaConfig;
export type ManifestConfig = typeof manifestConfig;
export type ServiceWorkerConfig = typeof serviceWorkerConfig;
export type CachingConfig = typeof cachingConfig;
export type OfflineConfig = typeof offlineConfig;
export type InstallPromptConfig = typeof installPromptConfig;
export type PushNotificationsConfig = typeof pushNotificationsConfig;
