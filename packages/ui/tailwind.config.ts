/**
 * Tailwind CSS Configuration for @nesvel/ui
 *
 * This configuration extends Tailwind CSS with shadcn/ui design tokens.
 * It uses CSS variables for theming to support light and dark modes.
 *
 * @see https://tailwindcss.com/docs/configuration
 * @see https://ui.shadcn.com/docs/theming
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // Enable dark mode via class strategy (add 'dark' class to html element)
  darkMode: ["class"],

  // Scan these files for Tailwind classes
  content: [
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
  	extend: {
  		/**
  		 * Color system using CSS variables from globals.css
  		 * Format: hsl(var(--variable-name))
  		 *
  		 * Benefits:
  		 * - Easy theme switching (light/dark)
  		 * - Centralized color management
  		 * - Runtime theme customization
  		 */
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},

  		/**
  		 * Border radius system using CSS variable
  		 * Allows consistent rounded corners across components
  		 */
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},

  		/**
  		 * Custom keyframe animations for Radix UI components
  		 * Used by Accordion and other collapsible components
  		 */
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},

  		/**
  		 * Animation utilities
  		 * Maps keyframes to reusable animation classes
  		 */
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  		}
  	}
  },

  /**
   * Plugins
   * - tw-animate-css: Additional animation utilities
   */
  plugins: [require("tw-animate-css")],
};

export default config;
