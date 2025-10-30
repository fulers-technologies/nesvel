# @nesvel/nestjs-orm

[![NestJS](https://img.shields.io/badge/NestJS-9%2F10-red)](#) [![MikroORM](https://img.shields.io/badge/MikroORM-5.x-5D2C8A)](#) [![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A Laravel Eloquent–inspired ORM package for NestJS using MikroORM with fluent migrations and PubSub integration.

Features

- Entities, repositories, migrations (MikroORM)
- Mixins for timestamps, soft deletes, user stamps, UUIDs
- CLI utilities and scaffolding (nest-commander)
- Pagination helpers via nestjs-paginate
- PubSub hooks via @nesvel/nestjs-pubsub

Install

- Peer deps: @nestjs/common/core, reflect-metadata, rxjs, MikroORM adapters as needed

Quick Start

```ts
// Example import paths with aliases
import { SomeEntity } from '@/entities/some.entity';
```

Scripts

- bunx tsc, bunx jest, bunx eslint

Testing

- Jest + ts-jest; see jest.config.ts

Path Aliases

- @/_, plus fine‑grained: @repositories/_, @services/_, @entities/_, etc.

License
MIT
