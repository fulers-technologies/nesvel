import { urlConfig } from './url.config';

/**
 * Change Frequency
 *
 * Indicates how frequently a page is likely to change.
 * This is a hint to search engines, not a command.
 *
 * Values:
 * - always: Changes on every access
 * - hourly: Changes hourly
 * - daily: Changes daily
 * - weekly: Changes weekly
 * - monthly: Changes monthly
 * - yearly: Changes yearly
 * - never: Archived URLs that never change
 */
export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

/**
 * Sitemap Entry Configuration
 *
 * Defines the structure for individual sitemap entries.
 */
export interface SitemapEntry {
  /**
   * URL path (relative to base URL)
   * @example '/about'
   */
  url: string;

  /**
   * Priority of this URL relative to other URLs (0.0 to 1.0)
   * Default: 0.5
   *
   * Priority interpretation:
   * - 1.0: Highest priority (homepage, main landing pages)
   * - 0.8: High priority (important category pages)
   * - 0.6: Medium-high priority (sub-category pages)
   * - 0.5: Medium priority (standard pages)
   * - 0.4: Medium-low priority (less important pages)
   * - 0.2-0.3: Low priority (archives, old blog posts)
   */
  priority?: number;

  /**
   * How frequently the page is likely to change
   */
  changeFrequency?: ChangeFrequency;

  /**
   * Last modification date
   * ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDThh:mm:ss+00:00
   */
  lastModified?: string | Date;

  /**
   * Alternate language versions of this page
   * Used for multi-language sites
   */
  alternateRefs?: Array<{
    href: string;
    hreflang: string;
  }>;
}

/**
 * Sitemap Configuration Object
 */
export const sitemapConfig = {
  /**
   * Base URL for the sitemap
   * Should match your production domain
   */
  siteUrl: urlConfig.base,

  /**
   * Generate robots.txt file
   * Automatically includes sitemap reference
   */
  generateRobotsTxt: true,

  /**
   * Generate index sitemap
   * Useful when you have multiple sitemaps (>50k URLs)
   * Creates a sitemap index that references other sitemaps
   */
  generateIndexSitemap: false,

  /**
   * Output directory for sitemap files
   * Relative to public directory
   */
  outDir: './public',

  /**
   * Maximum URLs per sitemap file
   * Split into multiple files if exceeded
   * Max allowed by protocol: 50,000
   */
  sitemapSize: 50000,

  /**
   * Sitemap filename
   * @default 'sitemap.xml'
   */
  sitemapBaseFileName: 'sitemap',

  /**
   * Compress sitemap to .gz format
   * Reduces file size for faster downloads
   */
  compress: true,

  /**
   * Additional paths to include in sitemap
   * These are static routes that should always be included
   */
  additionalPaths: async () => {
    return [
      // Add any additional static paths here
      // Example: { loc: '/special-page', priority: 0.8 }
    ];
  },

  /**
   * Default change frequency for all pages
   * Can be overridden per page
   */
  changefreq: 'weekly' as ChangeFrequency,

  /**
   * Default priority for all pages
   * Can be overridden per page
   * Range: 0.0 to 1.0
   */
  priority: 0.7,

  /**
   * Exclude specific paths from sitemap
   * Supports glob patterns
   *
   * Common exclusions:
   * - Admin/dashboard pages
   * - User profile pages
   * - Authentication pages
   * - API routes
   * - Development/test pages
   */
  exclude: [
    '/api/*', // API routes
    '/admin/*', // Admin panel
    '/dashboard/*', // User dashboard
    '/auth/*', // Authentication pages
    '/login', // Login page
    '/signup', // Signup page
    '/register', // Registration page
    '/_next/*', // Next.js internal
    '/404', // Error pages
    '/500',
    '/*.json', // JSON files
    '/*.xml', // XML files (except sitemap)
    '/private/*', // Private pages
    '/draft/*', // Draft content
    '/test/*', // Test pages
  ],

  /**
   * Transform function for modifying sitemap entries
   * Useful for adding custom logic, metadata, or filtering
   *
   * @param config - The sitemap entry configuration
   * @param path - The page path
   * @returns Modified sitemap entry or null to exclude
   */
  transform: async (config: SitemapEntry, path: string) => {
    // Custom transformation logic here
    // Example: Set different priorities based on path patterns

    // Homepage gets highest priority
    if (path === '/') {
      return {
        ...config,
        priority: 1.0,
        changefreq: 'daily' as ChangeFrequency,
      };
    }

    // Blog posts get high priority and frequent updates
    if (path.startsWith('/blog/')) {
      return {
        ...config,
        priority: 0.8,
        changefreq: 'weekly' as ChangeFrequency,
      };
    }

    // Documentation pages
    if (path.startsWith('/docs/')) {
      return {
        ...config,
        priority: 0.7,
        changefreq: 'monthly' as ChangeFrequency,
      };
    }

    // About/static pages
    if (['/about', '/contact', '/privacy', '/terms'].includes(path)) {
      return {
        ...config,
        priority: 0.6,
        changefreq: 'monthly' as ChangeFrequency,
      };
    }

    // Default config for other pages
    return config;
  },

  /**
   * Robots.txt configuration
   * Generated when generateRobotsTxt is true
   */
  robotsTxtOptions: {
    /**
     * User agents and their specific rules
     *
     * Common user agents:
     * - '*': All robots
     * - 'Googlebot': Google's crawler
     * - 'Bingbot': Bing's crawler
     * - 'Slurp': Yahoo's crawler
     */
    policies: [
      {
        userAgent: '*',
        /**
         * Paths allowed for this user agent
         * Empty array or not specified = allow all
         */
        allow: '/',
        /**
         * Paths disallowed for this user agent
         */
        disallow: ['/api/', '/admin/', '/dashboard/', '/auth/', '/login', '/signup', '/private/'],
        /**
         * Crawl delay in seconds
         * Time to wait between requests
         * Useful for preventing server overload
         */
        crawlDelay: 0,
      },
      // Specific rules for Google's crawler
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      // Block specific bots if needed
      // {
      //   userAgent: 'BadBot',
      //   disallow: '/',
      // },
    ],

    /**
     * Additional sitemap URLs to include in robots.txt
     * Useful if you have multiple sitemaps or external sitemaps
     */
    additionalSitemaps: [
      // `${urlConfig.base}/sitemap-blog.xml`,
      // `${urlConfig.base}/sitemap-products.xml`,
    ],

    /**
     * Additional robots.txt entries
     * For custom directives not covered by policies
     */
    additionalLines: [
      // 'Host: https://nesvel.com',
      // 'Sitemap: https://nesvel.com/sitemap-custom.xml',
    ],
  },
} as const;

/**
 * Route Priority Presets
 *
 * Predefined priority values for different route types.
 * Use these constants for consistency across the application.
 */
export const routePriorities = {
  /**
   * Critical pages (homepage, main landing pages)
   */
  CRITICAL: 1.0,

  /**
   * High priority pages (category pages, important features)
   */
  HIGH: 0.8,

  /**
   * Medium-high priority pages (sub-categories, product pages)
   */
  MEDIUM_HIGH: 0.6,

  /**
   * Medium priority pages (standard content pages)
   */
  MEDIUM: 0.5,

  /**
   * Medium-low priority pages (supplementary content)
   */
  MEDIUM_LOW: 0.4,

  /**
   * Low priority pages (archives, old content)
   */
  LOW: 0.2,
} as const;

/**
 * Change Frequency Presets
 *
 * Predefined change frequency values for different content types.
 */
export const changeFrequencies = {
  /**
   * For pages that change on every access (e.g., real-time data)
   */
  ALWAYS: 'always' as ChangeFrequency,

  /**
   * For pages that change hourly (e.g., news feeds)
   */
  HOURLY: 'hourly' as ChangeFrequency,

  /**
   * For pages that change daily (e.g., blog homepage)
   */
  DAILY: 'daily' as ChangeFrequency,

  /**
   * For pages that change weekly (e.g., blog posts)
   */
  WEEKLY: 'weekly' as ChangeFrequency,

  /**
   * For pages that change monthly (e.g., documentation)
   */
  MONTHLY: 'monthly' as ChangeFrequency,

  /**
   * For pages that change yearly (e.g., about page)
   */
  YEARLY: 'yearly' as ChangeFrequency,

  /**
   * For archived pages that never change
   */
  NEVER: 'never' as ChangeFrequency,
} as const;

/**
 * Type exports for TypeScript consumers
 */
export type SitemapConfig = typeof sitemapConfig;
export type RoutePriorities = typeof routePriorities;
export type ChangeFrequencies = typeof changeFrequencies;
