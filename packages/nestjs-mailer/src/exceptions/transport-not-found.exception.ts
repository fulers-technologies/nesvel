import { BaseException } from '@nesvel/shared';

/**
 * Transport Not Found Exception
 *
 * Thrown when a requested mail transport provider is not available
 *
 * @class TransportNotFoundException
 * @extends {BaseException}
 */
export class TransportNotFoundException extends BaseException {
  /**
   * Creates an instance of TransportNotFoundException
   *
   * @param transportType - The requested transport type
   * @param availableTransports - List of available transport types
   */
  constructor(transportType: string, availableTransports: string[]) {
    super(
      `Transport "${transportType}" not found. Available transports: ${availableTransports.join(', ')}`,
    );
  }
}
