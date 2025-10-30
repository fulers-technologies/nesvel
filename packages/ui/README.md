# @repo/ui

Shared UI component library built with shadcn/ui and Tailwind CSS.

## Installation

This package is part of the monorepo and should be referenced using workspace
protocol:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### Import Components

```tsx
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
```

Or use the index:

```tsx
import { Button, Card, Input, Label } from '@repo/ui/components';
```

### Import Utilities

```tsx
import { cn } from '@repo/ui/lib/utils';
```

### Import Styles

In your Next.js app, import the global styles:

```tsx
// app/layout.tsx
import '@repo/ui/styles/globals.css';
```

## Components

### Button

```tsx
<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="lg">Large</Button>
<Button variant="ghost" size="sm">Small</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`,
`link`  
**Sizes:** `default`, `sm`, `lg`, `icon`

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input

```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

### Label

```tsx
<Label htmlFor="username">Username</Label>
```

## Configuration

### Tailwind CSS

The package includes its own `tailwind.config.ts` with shadcn/ui theme
configuration.

To use these components in your app, extend the Tailwind config:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import uiConfig from '@repo/ui/tailwind.config';

const config: Config = {
  ...uiConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}', // Include ui package
  ],
};

export default config;
```

### Path Aliases

The package uses `@/` alias for internal imports. This is configured in
`tsconfig.json`.

## Adding New Components

1. Create component in `src/components/`
2. Export from `src/components/index.ts`
3. Follow shadcn/ui patterns and conventions

## Styling

Components use:

- **Tailwind CSS** for styling
- **CSS Variables** for theming
- **class-variance-authority** for variants
- **tailwind-merge** for class merging

## Dark Mode

Dark mode is supported via the `dark` class on the root element:

```tsx
<html className="dark">
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [CVA Documentation](https://cva.style)
