import { Injectable } from '@nestjs/common';
import { BaseMakeCommand, Command, Group } from '@nesvel/nestjs-console';

/**
 * Make Consumer Command
 *
 * Generates a new PubSub consumer class extending BaseConsumer.
 * Consumers provide lifecycle hooks and structured message handling.
 *
 * @example
 * ```bash
 * # Generate an OrderConsumer
 * bun run console make:consumer Order
 *
 * # Generate in custom path
 * bun run console make:consumer Payment --path=src/modules/payment/consumers
 * ```
 */
@Command({
  name: 'make:consumer',
  arguments: '<name>',
  description: 'Create a new PubSub consumer class',
})
@Group('PubSub')
@Injectable()
export class MakeConsumerCommand extends BaseMakeCommand {
  /**
   * Execute the make:consumer command
   */
  async run(inputs: string[]): Promise<void> {
    const [name] = inputs;

    if (!name) {
      throw new Error('Consumer name argument is required.');
    }

    const fileName = this.toFileName(name);
    const className = this.toClassName(name);
    const topicName = this.toKebabCase(name);
    const variableName = this.toVariableName(name);

    await this.generateFromStub(
      name,
      {
        suffix: 'consumer',
        stubName: 'consumer',
        outputDir: 'src/consumers',
      },
      {
        className,
        fileName,
        topicName,
        variableName,
      },
    );
  }
}
