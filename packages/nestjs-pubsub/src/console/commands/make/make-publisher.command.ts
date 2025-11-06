import { Injectable } from '@nestjs/common';
import { BaseMakeCommand, Command, Group } from '@nesvel/nestjs-console';

/**
 * Make Publisher Command
 *
 * Generates a new PubSub publisher class extending BasePublisher.
 * Publishers provide hooks for validation, transformation, and logging.
 *
 * @example
 * ```bash
 * # Generate an OrderPublisher
 * bun run console make:publisher Order
 *
 * # Generate in custom path
 * bun run console make:publisher Payment --path=src/modules/payment/publishers
 * ```
 */
@Command({
  name: 'make:publisher',
  arguments: '<name>',
  description: 'Create a new PubSub publisher class',
})
@Group('PubSub')
@Injectable()
export class MakePublisherCommand extends BaseMakeCommand {
  /**
   * Execute the make:publisher command
   */
  async run(inputs: string[]): Promise<void> {
    const [name] = inputs;

    if (!name) {
      throw new Error('Publisher name argument is required.');
    }

    const fileName = this.toFileName(name);
    const className = this.toClassName(name);
    const topicName = this.toKebabCase(name);
    const variableName = this.toVariableName(name);

    await this.generateFromStub(
      name,
      {
        suffix: 'publisher',
        stubName: 'publisher',
        outputDir: 'src/publishers',
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
