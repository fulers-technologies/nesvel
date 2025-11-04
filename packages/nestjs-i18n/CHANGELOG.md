# Changelog

All notable changes to the NestJS i18n package are documented in this file.

---

## [1.0.0] - 2025-10-30

### Added

#### Core Module

- **Created i18n module** for NestJS applications
- **Modular architecture** with clean separation of concerns
- **Type-safe translations** with comprehensive interfaces
- **Multiple language support** - EN, AR, FR, ES out of the box
- **Environment variable support** with sensible defaults
- **Production-ready setup** with optimized performance

#### Language Resolvers

- **`QueryResolver`** - Language detection from query parameters
- **`CookieResolver`** - Language detection from cookies
- **`HeaderResolver`** - Language detection from custom headers
- **`AcceptLanguageResolver`** - Language detection from Accept-Language header

#### Constants

- **`SUPPORTED_LANGUAGES`** - List of supported language codes
- **`DEFAULT_LANGUAGE`** - Default fallback language
- **`FALLBACK_LANGUAGES`** - Per-language fallback configuration
- **`LANGUAGE_NAMES`** - Display names for each language
- **`RTL_LANGUAGES`** - Right-to-left language configuration

#### Utilities

- **`getCurrentLanguage()`** - Get current request language
- **`getCurrentTextDirection()`** - Get text direction (LTR/RTL)
- **`getLanguageDisplayName()`** - Get language display name
- **`setLanguageCookie()`** - Set language preference in cookie
- **`clearLanguageCookie()`** - Clear language preference cookie
- **`validateLanguage()`** - Validate and normalize language codes
- **`createI18nValidationPipe()`** - Create validation pipe with i18n support

#### Features

- **Multiple language support** - EN, AR, FR, ES with easy addition of more
- **Type-safe translations** - TypeScript types generated from translation files
- **RTL support** - Built-in support for right-to-left languages
- **Live reloading** - Auto-reload translations in development
- **Variable formatting** - Dynamic values in translations
- **Pluralization** - Built-in plural support
- **DTO validation** - Internationalized validation error messages
- **Fallback system** - Graceful degradation when translations are missing

### File Structure

```
i18n/
├── constants/          # Language and configuration constants
├── interfaces/         # TypeScript interfaces
├── resolvers/         # Language detection resolvers
├── utils/             # Helper utilities
├── i18n.module.ts     # Module definition
└── index.ts           # Module exports
```

### Translation Files Structure

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

### Benefits

#### Code Organization

- **Clean architecture** with separation of concerns
- **Modular design** for easy maintenance and extension
- **Type-safe** throughout with full TypeScript support
- **Extensible** - Easy to add new languages and translation namespaces

#### Documentation

- **Comprehensive README** with usage examples
- **CONTRIBUTING guide** for developers
- **JSDoc comments** on all public APIs
- **Translation file examples** for all supported languages

#### Developer Experience

- **Easy setup** with minimal configuration
- **Flexible resolvers** - Multiple language detection strategies
- **Type generation** - Automatic TypeScript types from translation files
- **Live reloading** - See translation changes instantly in development
- **Production-ready** with optimized performance and graceful fallbacks

---

## License

This project is licensed under the MIT License.
