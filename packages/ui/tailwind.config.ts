import type { Config } from 'tailwindcss';

const config: Config = {
  important: false,

  /**
   * Separator for variants
   * Default is ':' for variants like 'hover:', 'md:', 'dark:'
   */
  separator: ':',

  /**
   * Theme configuration
   * Defines design tokens and extends Tailwind's default theme
   */
  theme: {
    /**
     * Container configuration for responsive layouts
     * Provides consistent max-width containers with padding
     */
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },

    /**
     * Extend default Tailwind theme
     * Adds custom design tokens while keeping Tailwind defaults
     */
    extend: {
      /**
       * Color system using CSS variables from globals.css
       * Format: hsl(var(--variable-name))
       *
       * Benefits:
       * - Easy theme switching (light/dark)
       * - Centralized color management
       * - Runtime theme customization
       * - Type-safe with TypeScript
       */
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      /**
       * Border radius system using CSS variable
       * Provides consistent rounded corners across components
       */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      /**
       * Font family extensions
       * Add custom fonts while keeping Tailwind defaults
       */
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },

      /**
       * Custom keyframe animations
       * Used by Radix UI components and custom animations
       */
      keyframes: {
        // Accordion animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Collapsible animations
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
        // Dialog animations
        'dialog-overlay-show': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'dialog-content-show': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        // Drawer animations
        'drawer-slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'drawer-slide-down': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        // Fade animations
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        // Slide animations
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        // Zoom animations
        'zoom-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'zoom-out': {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        // Spin animation
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        // Pulse animation
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },

      /**
       * Animation utilities
       * Maps keyframes to reusable animation classes with timing
       */
      animation: {
        // Accordion
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Collapsible
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
        // Dialog
        'dialog-overlay-show': 'dialog-overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dialog-content-show': 'dialog-content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        // Drawer
        'drawer-slide-up': 'drawer-slide-up 0.3s ease-out',
        'drawer-slide-down': 'drawer-slide-down 0.2s ease-in',
        // Fade
        'fade-in': 'fade-in 0.2s ease-in',
        'fade-out': 'fade-out 0.15s ease-out',
        // Slide
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.2s ease-out',
        // Zoom
        'zoom-in': 'zoom-in 0.15s ease-out',
        'zoom-out': 'zoom-out 0.15s ease-in',
        // Spin
        'spin-slow': 'spin-slow 3s linear infinite',
        // Pulse
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      /**
       * Spacing scale extensions
       * Adds additional spacing values beyond Tailwind's defaults
       */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      /**
       * Z-index scale
       * Provides consistent layering for overlays and modals
       */
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      /**
       * Typography extensions
       * Custom font sizes and line heights
       */
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      /**
       * Box shadow extensions
       * Custom shadows for elevation and depth
       */
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },

      /**
       * Backdrop blur extensions
       * Additional blur values for glass morphism effects
       */
      backdropBlur: {
        xs: '2px',
      },

      /**
       * Transition duration extensions
       * Custom timing values for animations
       */
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },

      /**
       * Screen breakpoints extensions
       * Additional responsive breakpoints
       */
      screens: {
        '3xl': '1920px',
      },
    },
  },

  /**
   * Plugins
   * Extend Tailwind with additional functionality
   */
  plugins: [
    // Additional animation utilities from tailwindcss-animate
    require('tailwindcss-animate'),
  ],

  /**
   * Core plugins
   * Disable unused Tailwind features to reduce bundle size (optional)
   */
  corePlugins: {
    // Uncomment to disable specific core plugins
    // preflight: true, // Tailwind's base styles
    // container: true,
    // accessibility: true,
  },

  /**
   * Future flags
   * Opt-in to upcoming Tailwind CSS features
   */
  future: {
    // Enable future features here when available
    // hoverOnlyWhenSupported: true,
  },
};

export default config;
