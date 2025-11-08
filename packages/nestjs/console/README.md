# Console Prompts Library

> A comprehensive TypeScript library for building beautiful, interactive CLI
> applications with Laravel-style prompts.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Beautiful CLI Prompts** - Laravel-style prompts with rich interactions
- 📝 **Form Builder** - Multi-field forms with validation
- 🔍 **Search Prompts** - Searchable dropdowns with async data support
- 🎯 **Message Utilities** - Colored success, error, warning, and info messages
- ⏳ **Loading Spinners** - Elegant loading indicators with Ora
- 📊 **Data Tables** - Beautiful console tables for structured data
- 🌈 **Custom Themes** - Multiple color themes (default, red, orange, purple)
- 🧩 **TypeScript First** - Full type safety and IntelliSense support
- 🚀 **Zero Configuration** - Works out of the box

## 📦 Installation

```bash
npm install console-prompts
# or
yarn add console-prompts
# or
bun add console-prompts
```

## 🚀 Quick Start

```typescript
import { text, select, confirm, success, error } from 'console-prompts';

async function main() {
  // Get user input
  const name = await text('What is your name?');

  // Select from options
  const role = await select('Select your role', ['admin', 'editor', 'viewer']);

  // Confirm action
  const confirmed = await confirm('Are you sure?');

  if (confirmed) {
    success('Operation completed!');
  } else {
    error('Operation cancelled');
  }
}

main();
```

## 📚 Documentation

### Prompts

#### Text Input

```typescript
import { text } from 'console-prompts';

const name = await text('What is your name?', {
  default: 'Guest',
  required: true,
  validate: (value) => {
    if (value.length < 3) {
      return 'Name must be at least 3 characters';
    }
    return true;
  },
});
```

#### Password Input

```typescript
import { password } from 'console-prompts';

const pwd = await password('Enter password', {
  required: true,
  minLength: 8,
  validate: (value) => {
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain uppercase letter';
    }
    return true;
  },
});
```

#### Select (Single Choice)

```typescript
import { select } from 'console-prompts';

const role = await select('Select role', [
  { value: 'admin', label: 'Administrator', description: 'Full access' },
  { value: 'editor', label: 'Editor', description: 'Can edit content' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only' },
]);
```

#### Multiselect (Multiple Choices)

```typescript
import { multiselect } from 'console-prompts';

const permissions = await multiselect(
  'Select permissions',
  [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
  ],
  {
    required: true,
    default: ['read'],
  }
);
```

#### Number Input

```typescript
import { number } from 'console-prompts';

const age = await number('Enter your age', {
  min: 18,
  max: 120,
  default: 25,
  required: true,
});
```

#### Confirm (Yes/No)

```typescript
import { confirm } from 'console-prompts';

const confirmed = await confirm('Delete all files?', {
  default: false,
});
```

#### Search/Autocomplete

```typescript
import { simpleSearch } from 'console-prompts';

const country = await simpleSearch('Select country', [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
]);
```

#### Form (Multiple Fields)

```typescript
import { form } from 'console-prompts';

const user = await form(
  [
    {
      name: 'username',
      type: 'text',
      message: 'Username',
      required: true,
      min: 3,
    },
    {
      name: 'email',
      type: 'text',
      message: 'Email',
      required: true,
      validate: (v) => v.includes('@') || 'Invalid email',
    },
    {
      name: 'age',
      type: 'number',
      message: 'Age',
      min: 18,
    },
    {
      name: 'role',
      type: 'select',
      message: 'Role',
      choices: ['admin', 'user'],
    },
  ],
  {
    title: 'User Registration',
  }
);
```

#### Pause (Wait for Enter)

```typescript
import { pause } from 'console-prompts';

console.log('About to perform critical operation...');
await pause('Press Enter when ready');
console.log('Continuing...');
```

### Messages

```typescript
import { success, error, warning, info } from 'console-prompts';

success('Operation completed successfully!');
error('Something went wrong!');
warning('This action cannot be undone');
info('Processing your request...');
```

### Spinners

```typescript
import { spinner, runWithSpinner } from 'console-prompts';

// Manual spinner control
const spin = spinner('Loading data...');
await fetchData();
spin.succeed('Data loaded!');

// Automatic spinner with promise
await runWithSpinner(
  'Processing...',
  async () => {
    await someAsyncOperation();
  },
  {
    successText: 'Processing complete!',
    errorText: 'Processing failed',
  }
);
```

### Tables

```typescript
import { displayTable } from 'console-prompts';

displayTable(
  [
    ['John Doe', 'john@example.com', 'Admin'],
    ['Jane Smith', 'jane@example.com', 'Editor'],
  ],
  {
    header: ['Name', 'Email', 'Role'],
  }
);
```

### Screen Management

```typescript
import { clear, clearLine, clearLines } from 'console-prompts';

// Clear entire screen
clear();

// Clear current line
clearLine();

// Clear multiple lines
clearLines(3);
```

### Themes

```typescript
import {
  defaultTheme,
  redTheme,
  orangeTheme,
  purpleTheme,
} from 'console-prompts';

console.log(defaultTheme.primary('Primary message'));
console.log(redTheme.error('Error message'));
console.log(orangeTheme.warning('Warning message'));
console.log(purpleTheme.info('Info message'));
```

## 🎨 Examples

Check out the `__examples__` directory for complete examples:

- `basic.ts` - Simple examples for getting started
- `full.ts` - Comprehensive feature showcase
- `advanced.ts` - Complex workflows and patterns

Run examples:

```bash
npm run build
node dist/__examples__/basic.js
```

## 🧪 Testing

Test files are available in the `__tests__` directory:

```bash
# Build the project first
npm run build

# Run message tests
node dist/__tests__/messages/info.js

# Run prompt tests (interactive)
node dist/__tests__/prompts/text.js
```

## 📖 API Reference

### Prompt Functions

- `text(message, options)` - Text input prompt
- `password(message, options)` - Password input (hidden)
- `number(message, options)` - Numeric input
- `select(message, choices, options)` - Single selection
- `multiselect(message, choices, options)` - Multiple selection
- `confirm(message, options)` - Yes/No confirmation
- `form(fields, options)` - Multi-field form
- `simpleSearch(message, choices, options)` - Search with static data
- `multisearch(message, source, options)` - Search with async data
- `pause(message)` - Wait for Enter key

### Message Functions

- `success(message)` - Success message (green ✓)
- `error(message)` - Error message (red ✗)
- `warning(message)` - Warning message (yellow ⚠)
- `info(message)` - Info message (blue ℹ)

### Spinner Functions

- `spinner(text)` - Create a spinner instance
- `runWithSpinner(text, task, options)` - Run async task with spinner

### Table Functions

- `table(rows, options)` - Create table string
- `displayTable(rows, options)` - Display table to console

### Utility Functions

- `clear(showCursor)` - Clear screen
- `clearLine()` - Clear current line
- `clearLines(count)` - Clear multiple lines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © 2024

## 🙏 Acknowledgments

Built with:

- [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js) - Interactive
  prompts
- [chalk](https://github.com/chalk/chalk) - Terminal styling
- [ora](https://github.com/sindresorhus/ora) - Elegant spinners
- [cli-table3](https://github.com/cli-table/cli-table3) - Beautiful tables

Inspired by [Laravel Prompts](https://laravel.com/docs/prompts)
