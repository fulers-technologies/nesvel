import type { IMessageSerializer } from '@interfaces/message-serializer.interface';

/**
 * Default JSON-based message serializer implementation.
 *
 * This serializer uses JSON.stringify and JSON.parse for message serialization
 * and deserialization. It's the default serializer used by all drivers unless
 * a custom serializer is provided.
 *
 * The JSON serializer is suitable for most use cases and provides:
 * - Wide compatibility across different platforms and languages
 * - Human-readable message format for debugging
 * - Built-in support for common JavaScript types
 * - Reasonable performance for most message sizes
 *
 * For specialized use cases requiring binary formats, compression, or schema
 * validation, consider implementing a custom serializer using formats like
 * MessagePack, Protocol Buffers, or Avro.
 */
export class JsonMessageSerializer implements IMessageSerializer {
  /**
   * Serializes a message payload to JSON string format.
   *
   * This method converts a JavaScript value to a JSON string using
   * JSON.stringify. The resulting string can be transmitted over any
   * text-based messaging system.
   *
   * Limitations:
   * - Cannot serialize functions, symbols, or undefined values
   * - Circular references will cause an error
   * - Date objects are converted to ISO strings
   * - RegExp and Error objects lose their type information
   *
   * @template TData - The type of data being serialized
   *
   * @param data - The message payload to serialize
   * @returns A JSON string representation of the data
   *
   * @throws {TypeError} If the data contains circular references
   * @throws {TypeError} If the data contains non-serializable values
   *
   * @example
   * ```typescript
   * const serializer = JsonMessageSerializer.make();
   * const json = serializer.serialize({ userId: 123, action: 'login' });
   * // Result: '{"userId":123,"action":"login"}'
   * ```
   */
  serialize<TData = any>(data: TData): Buffer | string {
    try {
      return JSON.stringify(data);
    } catch (error: Error | any) {
      throw new Error(`Failed to serialize message data: ${(error as Error).message}`);
    }
  }

  /**
   * Deserializes a JSON string back to its original JavaScript value.
   *
   * This method converts a JSON string received from the messaging backend
   * back into its original JavaScript representation using JSON.parse.
   *
   * The method accepts both string and Buffer inputs for flexibility with
   * different driver implementations.
   *
   * @template TData - The expected type of the deserialized data
   *
   * @param data - The serialized data as a string or Buffer
   * @returns The deserialized JavaScript value
   *
   * @throws {SyntaxError} If the data is not valid JSON
   *
   * @example
   * ```typescript
   * const serializer = JsonMessageSerializer.make();
   * const data = serializer.deserialize<UserEvent>('{"userId":123,"action":"login"}');
   * console.log(data.userId); // 123
   * ```
   */
  deserialize<TData = any>(data: Buffer | string): TData {
    try {
      const jsonString = Buffer.isBuffer(data) ? data.toString('utf-8') : data;
      return JSON.parse(jsonString);
    } catch (error: Error | any) {
      throw new Error(`Failed to deserialize message data: ${(error as Error).message}`);
    }
  }
}

/**
 * Creates and returns the default message serializer instance.
 *
 * This function provides a convenient way to obtain the default JSON serializer
 * without needing to instantiate it manually. The serializer can be used
 * directly or passed as a configuration option to the PubSub module.
 *
 * @returns A new JsonMessageSerializer instance
 *
 * @example
 * ```typescript
 * const serializer = getDefaultSerializer();
 * const json = serializer.serialize({ foo: 'bar' });
 * ```
 */
export function getDefaultSerializer(): IMessageSerializer {
  return JsonMessageSerializer.make();
}

/**
 * Utility function to safely serialize data with error handling.
 *
 * This function wraps the serialization process with additional error handling
 * and provides a fallback mechanism. If serialization fails, it returns a
 * fallback value or throws an error based on the options provided.
 *
 * @template TData - The type of data being serialized
 *
 * @param data - The data to serialize
 * @param serializer - The serializer to use (defaults to JSON serializer)
 * @param fallback - Optional fallback value to return on error
 * @returns The serialized data or fallback value
 *
 * @throws {Error} If serialization fails and no fallback is provided
 *
 * @example
 * ```typescript
 * const result = safeSerialize(
 *   complexData,
 *   customSerializer,
 *   '{"error":"serialization_failed"}'
 * );
 * ```
 */
export function safeSerialize<TData = any>(
  data: TData,
  serializer: IMessageSerializer = getDefaultSerializer(),
  fallback?: string,
): string {
  try {
    const result = serializer.serialize(data);
    return typeof result === 'string' ? result : result.toString();
  } catch (error: Error | any) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Utility function to safely deserialize data with error handling.
 *
 * This function wraps the deserialization process with additional error handling
 * and provides a fallback mechanism. If deserialization fails, it returns a
 * fallback value or throws an error based on the options provided.
 *
 * @template TData - The expected type of the deserialized data
 *
 * @param data - The serialized data to deserialize
 * @param serializer - The serializer to use (defaults to JSON serializer)
 * @param fallback - Optional fallback value to return on error
 * @returns The deserialized data or fallback value
 *
 * @throws {Error} If deserialization fails and no fallback is provided
 *
 * @example
 * ```typescript
 * const result = safeDeserialize<UserEvent>(
 *   messageData,
 *   customSerializer,
 *   { userId: 0, action: 'unknown' }
 * );
 * ```
 */
export function safeDeserialize<TData = any>(
  data: Buffer | string,
  serializer: IMessageSerializer = getDefaultSerializer(),
  fallback?: TData,
): TData {
  try {
    return serializer.deserialize(data);
  } catch (error: Error | any) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}
