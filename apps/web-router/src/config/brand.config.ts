/**
 * Brand Configuration
 *
 * Visual identity settings including colors, themes, and design tokens.
 */
export const brandConfig = {
  /**
   * Primary brand colors
   * Used for theming, PWA, and UI components
   */
  colors: {
    /**
     * Primary brand color (hex format)
     * Used in PWA manifest, theme color meta tag
     */
    primary: '#0070f3',

    /**
     * Secondary brand color
     */
    secondary: '#7928ca',

    /**
     * Background color for light theme
     */
    background: '#ffffff',

    /**
     * Background color for dark theme
     */
    backgroundDark: '#000000',

    /**
     * Text color for light theme
     */
    text: '#000000',

    /**
     * Text color for dark theme
     */
    textDark: '#ffffff',
  },

  /**
   * Logo paths relative to public directory
   */
  logo: {
    /**
     * Main logo (SVG preferred for scalability)
     */
    main: '/logo.svg',

    /**
     * Square logo/icon for PWA and favicons
     */
    icon: '/icon.png',

    /**
     * Logo for dark theme (if different)
     */
    dark: '/logo-dark.svg',
  },

  /**
   * Favicon paths
   * Multiple sizes for different devices and contexts
   */
  favicons: {
    ico: '/favicon.ico',
    svg: '/favicon.svg',
    png: {
      '16x16': '/favicon-16x16.png',
      '32x32': '/favicon-32x32.png',
      '180x180': '/apple-touch-icon.png',
    },
  },
} as const;

/**
 * Type export for TypeScript consumers
 */
export type BrandConfig = typeof brandConfig;
