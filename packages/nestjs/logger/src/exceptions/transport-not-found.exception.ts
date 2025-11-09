/**
 * Exception thrown when a requested transport type is not found in the registry.
 *
 * This exception provides helpful information about the invalid transport type
 * and lists all available transports for the user.
 *
 * @class TransportNotFoundException
 * @extends {Error}
 *
 * @example
 * ```typescript
 * throw TransportNotFoundException.make('invalid-transport', ['console', 'file', 'daily']);
 * // Error: Transport 'invalid-transport' not found. Available transports: console, file, daily
 * ```
 */
export class TransportNotFoundException extends Error {
  /**
   * Creates a new TransportNotFoundException.
   *
   * @param message - The error message
   * @param transportType - The requested transport type
   * @param availableTransports - List of available transports
   */
  constructor(
    message: string,
    public readonly transportType: string,
    public readonly availableTransports: string[]
  ) {
    super(message);
    this.name = 'TransportNotFoundException';
    Object.setPrototypeOf(this, TransportNotFoundException.prototype);
  }
}
