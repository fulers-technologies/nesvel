import type { Configuration } from 'lint-staged';

const config: Configuration = {
  // TypeScript/JavaScript files
  '**/*.{ts,tsx,js,jsx}': ['bun run .tools/module-sorter/dist/index.js --fix', 'prettier --write'],

  // JSON files
  '**/*.json': ['prettier --write'],

  // Markdown files
  '**/*.md': ['prettier --write'],

  // YAML files
  '**/*.{yml,yaml}': ['prettier --write'],

  // Package.json files
  '**/package.json': ['prettier --write'],
};

export default config;
