# @nesvel/tsup-config

Shared [tsup](https://tsup.egoist.dev/) configuration presets for the Nesvel monorepo.

## Installation

```bash
npm install --save-dev @nesvel/tsup-config tsup
```

## Usage

Create a `tsup.config.ts` file in your package root:

### Base Library

For standard TypeScript libraries:

```typescript
import { defineConfig } from 'tsup';
import { preset as basePreset } from '@nesvel/tsup-config';

export default defineConfig(basePreset);
```

### NestJS Library

For NestJS modules and libraries (uses `tsc` for decorators):

```typescript
import { defineConfig } from 'tsup';
import { nestLibPreset } from '@nesvel/tsup-config';

export default defineConfig(nestLibPreset);
```

### NestJS Application

For NestJS applications (single-file bundle with shebang):

```typescript
import { defineConfig } from 'tsup';
import { nestAppPreset } from '@nesvel/tsup-config';

export default defineConfig(nestAppPreset);
```

### CLI Library

For CLI tools and binaries:

```typescript
import { defineConfig } from 'tsup';
import { cliLibPreset } from '@nesvel/tsup-config';

export default defineConfig(cliLibPreset);
```

### React Library

For React component libraries:

```typescript
import { defineConfig } from 'tsup';
import { reactLibPreset } from '@nesvel/tsup-config';

export default defineConfig(reactLibPreset);
```

## Custom Configuration

You can override any preset option:

```typescript
import { defineConfig } from 'tsup';
import { preset as basePreset } from '@nesvel/tsup-config';

export default defineConfig({
  ...basePreset,
  minify: true,
  sourcemap: true,
});
```

## Utilities

The package also exports utility functions:

```typescript
import {
  loadPackageJson,
  computeExternals,
  buildBanner,
} from '@nesvel/tsup-config';

const pkg = loadPackageJson();
const externals = computeExternals(pkg);
const banner = buildBanner(pkg);
```

## Features

- 🎯 Multiple presets for different project types
- 📦 Auto-detects dependencies as externals
- 🔖 Adds license banner to output
- 🚀 Optimized for both ESM and CJS
- 🛠️ TypeScript declaration files
- 🎨 Source maps in development

## License

MIT
