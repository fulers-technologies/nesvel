import { Injectable } from '@nestjs/common';
import { BaseMakeCommand, Command, Group } from '@nesvel/nestjs-console';

/**
 * Make Listener Command
 *
 * Generates a new PubSub listener class with @Subscribe decorators.
 * Listeners use decorators for simple subscription patterns (80% use case).
 *
 * @example
 * ```bash
 * # Generate an OrderListener
 * bun run console make:listener Order
 *
 * # Generate in custom path
 * bun run console make:listener Payment --path=src/modules/payment/listeners
 * ```
 */
@Command({
  name: 'make:listener',
  arguments: '<name>',
  description: 'Create a new PubSub listener class with @Subscribe decorators',
})
@Group('PubSub')
@Injectable()
export class MakeListenerCommand extends BaseMakeCommand {
  /**
   * Execute the make:listener command
   */
  async run(inputs: string[]): Promise<void> {
    const [name] = inputs;

    if (!name) {
      throw new Error('Listener name argument is required.');
    }

    const fileName = this.toFileName(name);
    const className = this.toClassName(name);
    const topicName = this.toKebabCase(name);
    const variableName = this.toVariableName(name);

    await this.generateFromStub(
      name,
      {
        suffix: 'listener',
        stubName: 'listener',
        outputDir: 'src/listeners',
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
