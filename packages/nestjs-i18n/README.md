# I18n Module

Production-ready internationalization (i18n) module for NestJS applications using [nestjs-i18n](https://nestjs-i18n.com).

## Features

✅ **Multiple Language Support** - EN, AR, FR, ES out of the box  
✅ **Type-Safe Translations** - TypeScript types generated from translation files  
✅ **Multiple Resolvers** - Query, Cookie, Header-based language detection  
✅ **Fallback Support** - Graceful degradation when translations are missing  
✅ **RTL Support** - Built-in support for right-to-left languages (Arabic)  
✅ **Live Reloading** - Auto-reload translations in development  
✅ **Variable Formatting** - Dynamic values in translations  
✅ **Pluralization** - Built-in plural support  
✅ **DTO Validation** - Internationalized validation error messages  
✅ **Production Ready** - Optimized for enterprise applications

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Translation Files](#translation-files)
- [Language Resolvers](#language-resolvers)
- [Utilities](#utilities)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

---

## Installation

Already installed with the module. Dependencies:
- `nestjs-i18n` - Core i18n functionality

---

## Quick Start

### 1. Import Module

```typescript
import { Module } from '@nestjs/common';
import { I18nModule } from '@/modules/i18n';

@Module({
  imports: [I18nModule],
})
export class AppModule {}
```

### 2. Use in Controllers

```typescript
import { Controller, Get } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller()
export class AppController {
  @Get()
  async getWelcome(@I18n() i18n: I18nContext) {
    return i18n.t('common.welcome');
  }

  @Get('hello')
  async getHello(@I18n() i18n: I18nContext) {
    return i18n.t('common.hello', { args: { name: 'John' } });
  }
}
```

### 3. Use in Services

```typescript
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nService) {}

  async getErrorMessage(): Promise<string> {
    return this.i18n.t('common.errors.notFound');
  }
}
```

---

## Configuration

Configuration is defined in `src/config/i18n.config.ts`.

### Key Configuration Options

```typescript
{
  fallbackLanguage: 'en',           // Default language
  fallbacks: {                      // Per-language fallbacks
    ar: ['en'],
    fr: ['en'],
    es: ['en']
  },
  loader: I18nJsonLoader,           // JSON file loader
  loaderOptions: {
    path: './src/i18n/',            // Translation files path
    watch: true                     // Live reload (development)
  },
  resolvers: [
    QueryResolver,                  // ?lang=en
    CookieResolver,                 // Cookie: lang=en
    AcceptLanguageResolver,         // Accept-Language header
    HeaderResolver                  // X-Custom-Lang header
  ]
}
```

---

## Usage Examples

### Basic Translation

```typescript
@Get()
async get(@I18n() i18n: I18nContext) {
  return {
    welcome: i18n.t('common.welcome'),
    goodbye: i18n.t('common.goodbye')
  };
}
```

### Translation with Variables

```typescript
@Get('hello/:name')
async getHello(@Param('name') name: string, @I18n() i18n: I18nContext) {
  return i18n.t('common.hello', { args: { name } });
}
// GET /hello/John → "Hello, John!" (EN) or "مرحباً، John!" (AR)
```

### Get Current Language

```typescript
import { getCurrentLanguage, getCurrentTextDirection } from '@/modules/i18n';

@Get('info')
async getInfo() {
  return {
    language: getCurrentLanguage(),      // 'en', 'ar', 'fr', 'es'
    direction: getCurrentTextDirection() // 'ltr' or 'rtl'
  };
}
```

### Set Language Cookie

```typescript
import { setLanguageCookie } from '@/modules/i18n';

@Post('language')
async setLanguage(
  @Body('lang') lang: string,
  @Res({ passthrough: true }) res: Response
) {
  setLanguageCookie(res, lang);
  return { message: 'Language updated successfully' };
}
```

### DTO Validation with I18n

```typescript
// In main.ts
import { createI18nValidationPipe } from '@/modules/i18n';

app.useGlobalPipes(
  createI18nValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
);

// DTO
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'validation.required' })
  @IsEmail({}, { message: 'validation.email' })
  email: string;
}
```

---

## Translation Files

### Directory Structure

```
src/i18n/
├── en/
│   └── common.json
├── ar/
│   └── common.json
├── fr/
│   └── common.json
└── es/
    └── common.json
```

### Sample Translation File

**en/common.json:**
```json
{
  "welcome": "Welcome",
  "hello": "Hello, {name}!",
  "errors": {
    "notFound": "Resource not found",
    "unauthorized": "Unauthorized access"
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address"
  }
}
```

### Adding New Translations

1. Create a new namespace file (e.g., `auth.json`)
2. Add translations for all supported languages
3. Use dot notation to access: `i18n.t('auth.login.success')`

---

## Language Resolvers

Resolvers determine the user's language in priority order:

### 1. Query Parameter (Highest Priority)

```
GET /api/users?lang=ar
GET /api/users?language=fr
```

### 2. Cookie

```
Cookie: lang=en
```

Set via:
```typescript
setLanguageCookie(res, 'ar');
```

### 3. Accept-Language Header

```
Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
```

### 4. Custom Header

```
X-Custom-Lang: es
```

### 5. Default Language (Fallback)

If no resolver finds a language, falls back to `en`.

---

## Utilities

### Language Helpers

```typescript
import {
  getCurrentLanguage,
  getCurrentTextDirection,
  getLanguageDisplayName,
  setLanguageCookie,
  clearLanguageCookie,
  validateLanguage,
} from '@/modules/i18n';

// Get current language
const lang = getCurrentLanguage(); // 'en' | 'ar' | 'fr' | 'es'

// Get text direction
const dir = getCurrentTextDirection(); // 'ltr' | 'rtl'

// Get display name
const displayName = getLanguageDisplayName('ar'); // 'العربية'

// Set language cookie
setLanguageCookie(res, 'ar');

// Clear language cookie
clearLanguageCookie(res);

// Validate language input
const validLang = validateLanguage('ARABIC'); // Normalizes to 'ar'
```

### Constants

```typescript
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGES,
  LANGUAGE_NAMES,
  RTL_LANGUAGES,
  isRTL,
  isSupportedLanguage,
} from '@/modules/i18n';

// Check if language is supported
if (isSupportedLanguage('ar')) {
  // ...
}

// Check if language is RTL
if (isRTL('ar')) {
  // Apply RTL styles
}
```

---

## Best Practices

### 1. Organize Translations by Domain

```
src/i18n/en/
├── common.json       # Common messages
├── auth.json         # Authentication messages
├── users.json        # User-related messages
└── validation.json   # Validation messages
```

### 2. Use Descriptive Keys

```json
{
  "users": {
    "list": {
      "title": "User List",
      "empty": "No users found"
    },
    "create": {
      "success": "User created successfully",
      "error": "Failed to create user"
    }
  }
}
```

### 3. Leverage Type Safety

Generate types in development:

```bash
# Types generated automatically to src/generated/i18n.generated.ts
bun run dev
```

Use generated types:

```typescript
import type { I18nTranslations } from '@/generated/i18n.generated';

// Type-safe translation keys
i18n.t<I18nTranslations>('common.welcome');
```

### 4. Handle Pluralization

```json
{
  "items": {
    "count": "{count} item",
    "count_plural": "{count} items"
  }
}
```

```typescript
i18n.t('items.count', { args: { count: 1 } });  // "1 item"
i18n.t('items.count', { args: { count: 5 } });  // "5 items"
```

### 5. Environment-Specific Behavior

- **Development**: Live reload, missing key warnings, type generation
- **Production**: Optimized, no warnings, graceful fallbacks

---

## API Reference

### Module

```typescript
import { I18nModule } from '@/modules/i18n';
```

### Decorators

```typescript
import { I18n, I18nContext, I18nLang } from 'nestjs-i18n';

@Get()
async get(
  @I18n() i18n: I18nContext,      // Full i18n context
  @I18nLang() lang: string        // Current language code
) {}
```

### Service

```typescript
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MyService {
  constructor(private readonly i18n: I18nService) {}

  async translate() {
    return this.i18n.t('common.welcome');
  }
}
```

### Context Methods

```typescript
const i18n = I18nContext.current();

i18n.t('key');                     // Translate
i18n.lang;                         // Current language
i18n.translate('key', { args });   // Translate with arguments
```

---

## Supported Languages

| Code | Language | Direction | Display Name |
|------|----------|-----------|--------------|
| `en` | English  | LTR       | English      |
| `ar` | Arabic   | RTL       | العربية      |
| `fr` | French   | LTR       | Français     |
| `es` | Spanish  | LTR       | Español      |

### Adding a New Language

1. Create directory: `src/i18n/de/`
2. Add translation files: `common.json`, etc.
3. Update `supported-languages.constants.ts`:
   ```typescript
   export const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr', 'es', 'de'] as const;
   export const LANGUAGE_NAMES = { ..., de: 'Deutsch' };
   export const FALLBACK_LANGUAGES = { ..., de: ['en'] };
   ```

---

## Troubleshooting

### Missing Translations

**Development**: Error thrown with key path  
**Production**: Returns key path as fallback

```typescript
// Missing key: "users.profile.bio"
// Returns: "users.profile.bio" (production)
// Throws error (development)
```

### Language Not Detected

Check resolver priority:
1. Query parameter (`?lang=en`)
2. Cookie (`lang=en`)
3. Header (`Accept-Language`)
4. Falls back to `en`

### Type Generation Not Working

Ensure `typesOutputPath` is set in config and you're in development mode.

---

## Resources

- [nestjs-i18n Documentation](https://nestjs-i18n.com)
- [i18next Documentation](https://www.i18next.com/)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**Version**: 1.0.0  
**Package**: nestjs-i18n@10.5.1  
**Status**: ✅ Production Ready
