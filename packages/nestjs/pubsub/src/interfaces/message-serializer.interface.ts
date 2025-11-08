/**
 * Interface for message serialization and deserialization.
 *
 * This interface defines the contract for converting message payloads between
 * their native JavaScript representation and a format suitable for transmission
 * over the messaging backend (typically a Buffer or string).
 *
 * Different serialization strategies can be implemented to support various
 * formats such as JSON, MessagePack, Protocol Buffers, Avro, or custom formats.
 * The serializer is responsible for ensuring data integrity and type safety
 * during the encoding and decoding process.
 */
export interface IMessageSerializer {
  /**
   * Serializes a message payload into a transmittable format.
   *
   * This method converts a JavaScript value into a Buffer or string that can
   * be transmitted over the messaging backend. The implementation should handle
   * various data types appropriately and ensure the output can be reliably
   * deserialized back to the original structure.
   *
   * The method should handle edge cases such as:
   * - Circular references (if supported)
   * - Special types (Date, RegExp, etc.)
   * - Large objects
   * - Binary data
   *
   * @template TData - The type of data being serialized
   *
   * @param data - The message payload to serialize
   * @returns A Buffer or string representation of the data
   *
   * @throws {SerializationError} If the data cannot be serialized
   *
   * @example
   * ```typescript
   * const buffer = serializer.serialize({ userId: 123, action: 'login' });
   * ```
   */
  serialize<TData = any>(data: TData): Buffer | string;

  /**
   * Deserializes a message payload from its transmitted format.
   *
   * This method converts a Buffer or string received from the messaging backend
   * back into its original JavaScript representation. The implementation should
   * be the inverse of the serialize method, ensuring that:
   *
   * deserialize(serialize(data)) === data
   *
   * The method should handle:
   * - Type reconstruction
   * - Error handling for corrupted data
   * - Version compatibility (if applicable)
   * - Performance optimization for large payloads
   *
   * @template TData - The expected type of the deserialized data
   *
   * @param data - The serialized data as a Buffer or string
   * @returns The deserialized JavaScript value
   *
   * @throws {DeserializationError} If the data cannot be deserialized
   *
   * @example
   * ```typescript
   * const message = serializer.deserialize<UserEvent>(buffer);
   * console.log(message.userId); // 123
   * ```
   */
  deserialize<TData = any>(data: Buffer | string): TData;
}

/**
 * Namespace for IMessageSerializer interface containing the symbol for dependency injection.
 */
export namespace IMessageSerializer {
  /**
   * Unique symbol identifier for the IMessageSerializer interface.
   * Used for dependency injection and type identification in the NestJS container.
   */
  export const $ = Symbol('IMessageSerializer');
}
