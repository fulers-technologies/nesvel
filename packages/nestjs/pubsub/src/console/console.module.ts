import { Module } from '@nestjs/common';

import { MakeConsumerCommand, MakePublisherCommand, MakeListenerCommand } from './commands';

/**
 * PubSub Console Module
 *
 * Registers all PubSub console commands for code generation.
 * Import this module in your application's console setup.
 *
 * @example
 * ```typescript
 * // In your console/console.module.ts
 * import { PubSubConsoleModule } from '@nesvel/nestjs-pubsub';
 *
 * @Module({
 *   imports: [PubSubConsoleModule]
 * })
 * export class ConsoleModule {}
 * ```
 */
@Module({
  providers: [MakeConsumerCommand, MakePublisherCommand, MakeListenerCommand],
  exports: [MakeConsumerCommand, MakePublisherCommand, MakeListenerCommand],
})
export class PubSubConsoleModule {}
