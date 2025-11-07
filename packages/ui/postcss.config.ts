import type { Config } from 'postcss-load-config';

const config: Config = {
  plugins: {
    /**
     * Tailwind CSS Plugin
     * Processes @tailwind directives and generates utility classes
     */
    tailwindcss: {},

    /**
     * Autoprefixer Plugin
     * Automatically adds vendor prefixes to CSS rules
     * Uses data from Can I Use to determine which prefixes are needed
     */
    autoprefixer: {},
  },
};

export default config;
