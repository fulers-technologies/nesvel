import {
  JsonMessageSerializer,
  getDefaultSerializer,
  safeSerialize,
  safeDeserialize,
} from '@utils/message-serializer.util';
import type { IMessageSerializer } from '@interfaces/message-serializer.interface';

describe('JsonMessageSerializer', () => {
  let serializer: JsonMessageSerializer;

  /**
   * Setup: Create a fresh serializer instance before each test
   *
   * This ensures that each test starts with a clean state and
   * tests don't interfere with each other.
   */
  beforeEach(() => {
    serializer = JsonMessageSerializer.make();
  });

  /**
   * Test group: Interface implementation
   *
   * Verifies that JsonMessageSerializer properly implements the
   * IMessageSerializer interface.
   */
  describe('interface implementation', () => {
    /**
     * Test: Implements IMessageSerializer
     *
     * Ensures that the serializer implements the required interface
     * and has all necessary methods.
     */
    it('should implement IMessageSerializer interface', () => {
      // Assert
      expect(serializer).toHaveProperty('serialize');
      expect(serializer).toHaveProperty('deserialize');
      expect(typeof serializer.serialize).toBe('function');
      expect(typeof serializer.deserialize).toBe('function');
    });
  });

  /**
   * Test group: serialize() method
   *
   * Verifies that the serialize method correctly converts various
   * data types to JSON strings.
   */
  describe('serialize', () => {
    /**
     * Test: Serialize simple object
     *
     * Ensures that a basic object can be serialized to JSON.
     */
    it('should serialize simple object to JSON string', () => {
      // Arrange
      const data = { name: 'John', age: 30 };

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toBe('{"name":"John","age":30}');
    });

    /**
     * Test: Serialize array
     *
     * Verifies that arrays can be serialized correctly.
     */
    it('should serialize array to JSON string', () => {
      // Arrange
      const data = [1, 2, 3, 'four', true];

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toBe('[1,2,3,"four",true]');
    });

    /**
     * Test: Serialize nested objects
     *
     * Ensures that deeply nested objects are serialized correctly.
     */
    it('should serialize nested objects', () => {
      // Arrange
      const data = {
        user: {
          profile: {
            name: 'Alice',
            settings: {
              theme: 'dark',
            },
          },
        },
      };

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toContain('"name":"Alice"');
      expect(result).toContain('"theme":"dark"');
      const resultString = typeof result === 'string' ? result : result.toString();
      const parsed = JSON.parse(resultString);
      expect(parsed.user.profile.settings.theme).toBe('dark');
    });

    /**
     * Test: Serialize primitive values
     *
     * Verifies that primitive values are serialized correctly.
     */
    it('should serialize primitive values', () => {
      // Arrange & Act & Assert
      expect(serializer.serialize('string')).toBe('"string"');
      expect(serializer.serialize(123)).toBe('123');
      expect(serializer.serialize(true)).toBe('true');
      expect(serializer.serialize(false)).toBe('false');
      expect(serializer.serialize(null)).toBe('null');
    });

    /**
     * Test: Serialize empty object
     *
     * Ensures that empty objects are handled correctly.
     */
    it('should serialize empty object', () => {
      // Arrange
      const data = {};

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toBe('{}');
    });

    /**
     * Test: Serialize empty array
     *
     * Verifies that empty arrays are handled correctly.
     */
    it('should serialize empty array', () => {
      // Arrange
      const data: any[] = [];

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toBe('[]');
    });

    /**
     * Test: Handle circular references
     *
     * Ensures that circular references throw an appropriate error
     * rather than causing an infinite loop.
     */
    it('should throw error for circular references', () => {
      // Arrange
      const data: any = { name: 'Test' };
      data.self = data; // Create circular reference

      // Act & Assert
      expect(() => serializer.serialize(data)).toThrow();
      expect(() => serializer.serialize(data)).toThrow(/circular/i);
    });

    /**
     * Test: Handle undefined values
     *
     * Verifies that undefined values are handled according to
     * JSON.stringify behavior.
     */
    it('should handle undefined values', () => {
      // Arrange
      const data = { key: undefined };

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toBe('{}'); // JSON.stringify omits undefined
    });

    /**
     * Test: Handle Date objects
     *
     * Ensures that Date objects are converted to ISO strings.
     */
    it('should serialize Date objects to ISO strings', () => {
      // Arrange
      const date = new Date('2025-01-01T00:00:00.000Z');
      const data = { timestamp: date };

      // Act
      const result = serializer.serialize(data);

      // Assert
      expect(result).toContain('2025-01-01T00:00:00.000Z');
    });
  });

  /**
   * Test group: deserialize() method
   *
   * Verifies that the deserialize method correctly converts JSON
   * strings and Buffers back to JavaScript values.
   */
  describe('deserialize', () => {
    /**
     * Test: Deserialize JSON string to object
     *
     * Ensures that a JSON string can be parsed back to an object.
     */
    it('should deserialize JSON string to object', () => {
      // Arrange
      const jsonString = '{"name":"John","age":30}';

      // Act
      const result = serializer.deserialize(jsonString);

      // Assert
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    /**
     * Test: Deserialize Buffer to object
     *
     * Verifies that a Buffer containing JSON can be deserialized.
     */
    it('should deserialize Buffer to object', () => {
      // Arrange
      const buffer = Buffer.from('{"name":"Alice","active":true}', 'utf-8');

      // Act
      const result = serializer.deserialize(buffer);

      // Assert
      expect(result).toEqual({ name: 'Alice', active: true });
    });

    /**
     * Test: Deserialize array
     *
     * Ensures that JSON arrays are deserialized correctly.
     */
    it('should deserialize array', () => {
      // Arrange
      const jsonString = '[1,2,3,"four",true]';

      // Act
      const result = serializer.deserialize(jsonString);

      // Assert
      expect(result).toEqual([1, 2, 3, 'four', true]);
    });

    /**
     * Test: Deserialize nested objects
     *
     * Verifies that nested objects are deserialized correctly.
     */
    it('should deserialize nested objects', () => {
      // Arrange
      const jsonString = '{"user":{"profile":{"name":"Bob","age":25}}}';

      // Act
      const result = serializer.deserialize(jsonString);

      // Assert
      expect(result.user.profile.name).toBe('Bob');
      expect(result.user.profile.age).toBe(25);
    });

    /**
     * Test: Deserialize primitive values
     *
     * Ensures that primitive values are deserialized correctly.
     */
    it('should deserialize primitive values', () => {
      // Arrange & Act & Assert
      expect(serializer.deserialize('"string"')).toBe('string');
      expect(serializer.deserialize('123')).toBe(123);
      expect(serializer.deserialize('true')).toBe(true);
      expect(serializer.deserialize('false')).toBe(false);
      expect(serializer.deserialize('null')).toBe(null);
    });

    /**
     * Test: Handle invalid JSON
     *
     * Verifies that invalid JSON throws an appropriate error.
     */
    it('should throw error for invalid JSON', () => {
      // Arrange
      const invalidJson = '{invalid json}';

      // Act & Assert
      expect(() => serializer.deserialize(invalidJson)).toThrow();
      expect(() => serializer.deserialize(invalidJson)).toThrow(/Failed to deserialize/);
    });

    /**
     * Test: Handle empty string
     *
     * Ensures that an empty string throws an error.
     */
    it('should throw error for empty string', () => {
      // Arrange
      const emptyString = '';

      // Act & Assert
      expect(() => serializer.deserialize(emptyString)).toThrow();
    });

    /**
     * Test: Handle malformed JSON
     *
     * Verifies that various types of malformed JSON are handled.
     */
    it('should throw error for malformed JSON', () => {
      // Arrange
      const malformedCases = ['{"key": undefined}', '{key: "value"}', "{'key': 'value'}", '{,}'];

      // Act & Assert
      malformedCases.forEach((malformed) => {
        expect(() => serializer.deserialize(malformed)).toThrow();
      });
    });
  });

  /**
   * Test group: Round-trip serialization
   *
   * Verifies that data can be serialized and then deserialized
   * back to its original form.
   */
  describe('round-trip serialization', () => {
    /**
     * Test: Object round-trip
     *
     * Ensures that an object survives serialization and deserialization.
     */
    it('should maintain data integrity through round-trip', () => {
      // Arrange
      const original = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nested: { key: 'value' },
      };

      // Act
      const serialized = serializer.serialize(original);
      const deserialized = serializer.deserialize(serialized);

      // Assert
      expect(deserialized).toEqual(original);
    });

    /**
     * Test: Array round-trip
     *
     * Verifies that arrays maintain integrity through round-trip.
     */
    it('should handle array round-trip', () => {
      // Arrange
      const original = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      // Act
      const serialized = serializer.serialize(original);
      const deserialized = serializer.deserialize(serialized);

      // Assert
      expect(deserialized).toEqual(original);
    });
  });
});

/**
 * Test group: getDefaultSerializer() function
 *
 * Verifies that the helper function returns a properly configured
 * serializer instance.
 */
describe('getDefaultSerializer', () => {
  /**
   * Test: Returns JsonMessageSerializer instance
   *
   * Ensures that the function returns an instance of the correct class.
   */
  it('should return JsonMessageSerializer instance', () => {
    // Act
    const serializer = getDefaultSerializer();

    // Assert
    expect(serializer).toBeInstanceOf(JsonMessageSerializer);
  });

  /**
   * Test: Returns functional serializer
   *
   * Verifies that the returned serializer works correctly.
   */
  it('should return functional serializer', () => {
    // Arrange
    const serializer = getDefaultSerializer();
    const data = { test: 'value' };

    // Act
    const serialized = serializer.serialize(data);
    const deserialized = serializer.deserialize(serialized);

    // Assert
    expect(deserialized).toEqual(data);
  });

  /**
   * Test: Returns new instance each time
   *
   * Ensures that each call returns a new instance.
   */
  it('should return new instance each time', () => {
    // Act
    const serializer1 = getDefaultSerializer();
    const serializer2 = getDefaultSerializer();

    // Assert
    expect(serializer1).not.toBe(serializer2);
  });
});

/**
 * Test group: safeSerialize() function
 *
 * Verifies that the safe serialization wrapper handles errors
 * gracefully and supports fallback values.
 */
describe('safeSerialize', () => {
  /**
   * Test: Successful serialization
   *
   * Ensures that valid data is serialized correctly.
   */
  it('should serialize valid data', () => {
    // Arrange
    const data = { key: 'value' };

    // Act
    const result = safeSerialize(data);

    // Assert
    expect(result).toBe('{"key":"value"}');
  });

  /**
   * Test: Use custom serializer
   *
   * Verifies that a custom serializer can be provided.
   */
  it('should use custom serializer when provided', () => {
    // Arrange
    const data = { key: 'value' };
    const customSerializer: IMessageSerializer = {
      serialize: jest.fn().mockReturnValue('custom'),
      deserialize: jest.fn(),
    };

    // Act
    const result = safeSerialize(data, customSerializer);

    // Assert
    expect(result).toBe('custom');
    expect(customSerializer.serialize).toHaveBeenCalledWith(data);
  });

  /**
   * Test: Return fallback on error
   *
   * Ensures that the fallback value is returned when serialization fails.
   */
  it('should return fallback on serialization error', () => {
    // Arrange
    const data: any = {};
    data.circular = data; // Create circular reference
    const fallback = '{"error":"serialization_failed"}';

    // Act
    const result = safeSerialize(data, undefined, fallback);

    // Assert
    expect(result).toBe(fallback);
  });

  /**
   * Test: Throw error without fallback
   *
   * Verifies that an error is thrown when no fallback is provided.
   */
  it('should throw error when no fallback provided', () => {
    // Arrange
    const data: any = {};
    data.circular = data;

    // Act & Assert
    expect(() => safeSerialize(data)).toThrow();
  });
});

/**
 * Test group: safeDeserialize() function
 *
 * Verifies that the safe deserialization wrapper handles errors
 * gracefully and supports fallback values.
 */
describe('safeDeserialize', () => {
  /**
   * Test: Successful deserialization
   *
   * Ensures that valid JSON is deserialized correctly.
   */
  it('should deserialize valid JSON', () => {
    // Arrange
    const json = '{"key":"value"}';

    // Act
    const result = safeDeserialize(json);

    // Assert
    expect(result).toEqual({ key: 'value' });
  });

  /**
   * Test: Use custom serializer
   *
   * Verifies that a custom serializer can be provided.
   */
  it('should use custom serializer when provided', () => {
    // Arrange
    const json = '{"key":"value"}';
    const customSerializer: IMessageSerializer = {
      serialize: jest.fn(),
      deserialize: jest.fn().mockReturnValue({ custom: true }),
    };

    // Act
    const result = safeDeserialize(json, customSerializer);

    // Assert
    expect(result).toEqual({ custom: true });
    expect(customSerializer.deserialize).toHaveBeenCalledWith(json);
  });

  /**
   * Test: Return fallback on error
   *
   * Ensures that the fallback value is returned when deserialization fails.
   */
  it('should return fallback on deserialization error', () => {
    // Arrange
    const invalidJson = '{invalid}';
    const fallback = { error: 'deserialization_failed' };

    // Act
    const result = safeDeserialize(invalidJson, undefined, fallback);

    // Assert
    expect(result).toEqual(fallback);
  });

  /**
   * Test: Throw error without fallback
   *
   * Verifies that an error is thrown when no fallback is provided.
   */
  it('should throw error when no fallback provided', () => {
    // Arrange
    const invalidJson = '{invalid}';

    // Act & Assert
    expect(() => safeDeserialize(invalidJson)).toThrow();
  });

  /**
   * Test: Handle Buffer input
   *
   * Ensures that Buffer input is handled correctly.
   */
  it('should handle Buffer input', () => {
    // Arrange
    const buffer = Buffer.from('{"key":"value"}', 'utf-8');

    // Act
    const result = safeDeserialize(buffer);

    // Assert
    expect(result).toEqual({ key: 'value' });
  });
});
