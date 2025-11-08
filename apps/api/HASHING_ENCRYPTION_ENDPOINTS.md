# Hashing & Encryption Test Endpoints

This document describes the test endpoints for the hashing and encryption
controllers in the API app.

## Table of Contents

- [Hashing Endpoints](#hashing-endpoints)
- [Encryption Endpoints](#encryption-endpoints)
- [Quick Start Examples](#quick-start-examples)

---

## Hashing Endpoints

Base URL: `/hashing`

### 1. Hash a Value

**POST** `/hashing/make`

Creates a hash from plain text.

```bash
curl -X POST http://localhost:3000/hashing/make \
  -H "Content-Type: application/json" \
  -d '{
    "value": "mySecurePassword123",
    "options": { "rounds": 10 }
  }'
```

**Response:**

```json
{
  "hash": "$2b$10$...",
  "algorithm": "bcrypt"
}
```

---

### 2. Verify a Hash

**POST** `/hashing/check`

Verifies if a plain value matches a hash.

```bash
curl -X POST http://localhost:3000/hashing/check \
  -H "Content-Type: application/json" \
  -d '{
    "value": "mySecurePassword123",
    "hash": "$2b$10$..."
  }'
```

**Response:**

```json
{
  "isValid": true,
  "message": "Hash verification successful"
}
```

---

### 3. Check if Hash Needs Rehashing

**POST** `/hashing/needs-rehash`

Determines if a hash should be regenerated with updated parameters.

```bash
curl -X POST http://localhost:3000/hashing/needs-rehash \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "$2b$10$...",
    "options": { "rounds": 12 }
  }'
```

**Response:**

```json
{
  "needsRehash": true,
  "currentInfo": {
    "algorithm": "bcrypt",
    "cost": 10,
    "valid": true
  },
  "message": "Hash should be regenerated with updated parameters"
}
```

---

### 4. Get Hash Information

**GET** `/hashing/info/:hash`

Extracts metadata from a hash string.

```bash
curl -X GET http://localhost:3000/hashing/info/\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Response:**

```json
{
  "info": {
    "algorithm": "bcrypt",
    "cost": 10,
    "version": "2b",
    "valid": true
  },
  "message": "Valid hash format detected"
}
```

---

### 5. Check if Value is Hashed

**POST** `/hashing/is-hashed`

Determines if a string appears to be a hash.

```bash
curl -X POST http://localhost:3000/hashing/is-hashed \
  -H "Content-Type: application/json" \
  -d '{
    "value": "$2b$10$..."
  }'
```

**Response:**

```json
{
  "isHashed": true,
  "info": {
    "algorithm": "bcrypt",
    "cost": 10,
    "valid": true
  },
  "message": "Value is a valid hash"
}
```

---

### 6. Complete Workflow Test

**POST** `/hashing/workflow`

Demonstrates complete password hashing workflow.

```bash
curl -X POST http://localhost:3000/hashing/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "password": "testPassword123",
    "options": { "rounds": 10 }
  }'
```

**Response:**

```json
{
  "step1_hash": "$2b$10$...",
  "step2_verification": true,
  "step3_needsRehash": false,
  "step4_info": { "algorithm": "bcrypt", "cost": 10 },
  "step5_isHashed": true,
  "summary": "Complete password hashing workflow executed successfully"
}
```

---

### 7. Multiple Hash Operations Test

**POST** `/hashing/multi-test`

Tests multiple hash operations on the same value.

```bash
curl -X POST http://localhost:3000/hashing/multi-test \
  -H "Content-Type: application/json" \
  -d '{
    "value": "testPassword",
    "count": 3
  }'
```

**Response:**

```json
{
  "hashes": ["$2b$10$...", "$2b$10$...", "$2b$10$..."],
  "verifications": [true, true, true],
  "infos": [...],
  "allUnique": true,
  "allValid": true
}
```

---

## Encryption Endpoints

Base URL: `/encryption`

### 1. Encrypt Data

**POST** `/encryption/encrypt`

Encrypts plaintext data.

```bash
curl -X POST http://localhost:3000/encryption/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "Sensitive user data",
    "serialize": true
  }'
```

**Response:**

```json
{
  "encrypted": "{\"iv\":\"...\",\"value\":\"...\",\"mac\":\"...\"}",
  "cipher": "aes-256-gcm",
  "serialized": true
}
```

---

### 2. Encrypt Data as String

**POST** `/encryption/encrypt-string`

Encrypts data and ensures string output.

```bash
curl -X POST http://localhost:3000/encryption/encrypt-string \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "API key: sk_test_123456"
  }'
```

**Response:**

```json
{
  "encrypted": "{\"iv\":\"...\",\"value\":\"...\",\"mac\":\"...\"}",
  "cipher": "aes-256-gcm",
  "format": "JSON string"
}
```

---

### 3. Decrypt Data

**POST** `/encryption/decrypt`

Decrypts an encrypted payload.

```bash
curl -X POST http://localhost:3000/encryption/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "payload": "{\"iv\":\"...\",\"value\":\"...\",\"mac\":\"...\"}"
  }'
```

**Response:**

```json
{
  "decrypted": "Sensitive user data",
  "cipher": "aes-256-gcm",
  "message": "Data decrypted successfully"
}
```

---

### 4. Get Current Cipher

**GET** `/encryption/cipher`

Returns the configured cipher algorithm.

```bash
curl -X GET http://localhost:3000/encryption/cipher
```

**Response:**

```json
{
  "cipher": "aes-256-gcm",
  "description": "AES-256 in Galois/Counter Mode (authenticated encryption)"
}
```

---

### 5. Complete Encryption Workflow

**POST** `/encryption/workflow`

Demonstrates complete encryption/decryption workflow.

```bash
curl -X POST http://localhost:3000/encryption/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "Secret message for testing"
  }'
```

**Response:**

```json
{
  "step1_encrypted_object": {...},
  "step2_encrypted_string": "...",
  "step3_decrypted_from_object": "Secret message for testing",
  "step4_decrypted_from_string": "Secret message for testing",
  "step5_integrity_check": true,
  "step6_cipher": "aes-256-gcm",
  "summary": "Complete encryption workflow executed successfully"
}
```

---

### 6. Multiple Encryption Operations Test

**POST** `/encryption/multi-test`

Tests multiple encryption operations.

```bash
curl -X POST http://localhost:3000/encryption/multi-test \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "Test data",
    "count": 5
  }'
```

**Response:**

```json
{
  "encrypted_payloads": [...],
  "decrypted_results": [...],
  "all_unique": true,
  "all_valid": true,
  "cipher": "aes-256-gcm"
}
```

---

### 7. Round-Trip Encryption Test

**POST** `/encryption/round-trip`

Tests encryption/decryption with various data types.

```bash
curl -X POST http://localhost:3000/encryption/round-trip \
  -H "Content-Type: application/json" \
  -d '{
    "samples": [
      "Short text",
      "Unicode: 你好世界 🌍"
    ]
  }'
```

**Response:**

```json
{
  "results": [...],
  "all_passed": true,
  "total_tests": 2,
  "cipher": "aes-256-gcm"
}
```

---

### 8. Format Compatibility Test

**POST** `/encryption/format-test`

Tests different payload formats.

```bash
curl -X POST http://localhost:3000/encryption/format-test \
  -H "Content-Type: application/json" \
  -d '{
    "plaintext": "Format test data"
  }'
```

**Response:**

```json
{
  "test1_object_format": {...},
  "test2_string_format": {...},
  "test3_cross_format": {...},
  "all_tests_passed": true,
  "cipher": "aes-256-gcm"
}
```

---

## Quick Start Examples

### Complete Hashing Example

```bash
# 1. Hash a password
HASH=$(curl -s -X POST http://localhost:3000/hashing/make \
  -H "Content-Type: application/json" \
  -d '{"value": "myPassword123"}' | jq -r '.hash')

echo "Generated hash: $HASH"

# 2. Verify the password
curl -X POST http://localhost:3000/hashing/check \
  -H "Content-Type: application/json" \
  -d "{\"value\": \"myPassword123\", \"hash\": \"$HASH\"}"
```

### Complete Encryption Example

```bash
# 1. Encrypt data
ENCRYPTED=$(curl -s -X POST http://localhost:3000/encryption/encrypt-string \
  -H "Content-Type: application/json" \
  -d '{"plaintext": "Secret data"}' | jq -r '.encrypted')

echo "Encrypted: $ENCRYPTED"

# 2. Decrypt data
curl -X POST http://localhost:3000/encryption/decrypt \
  -H "Content-Type: application/json" \
  -d "{\"payload\": \"$ENCRYPTED\"}"
```

### Test All Methods

```bash
# Test hashing workflow
curl -X POST http://localhost:3000/hashing/workflow \
  -H "Content-Type: application/json" \
  -d '{"password": "test123"}' | jq

# Test encryption workflow
curl -X POST http://localhost:3000/encryption/workflow \
  -H "Content-Type: application/json" \
  -d '{"plaintext": "test data"}' | jq
```

---

## Configuration

### Hashing Configuration

Located in: `src/config/hashing.config.ts`

- **Algorithm**: Bcrypt (default)
- **Rounds**: 10
- Supports: Bcrypt, Argon2, Argon2id, Scrypt

### Encryption Configuration

Located in: `src/config/encryption.config.ts`

- **Algorithm**: AES-256-GCM (default)
- **Key**: Auto-generated or from `ENCRYPTION_KEY` env var
- Supports: AES-256-CBC, AES-256-GCM, Sodium

### Environment Variables

```bash
# Encryption key (base64 encoded)
ENCRYPTION_KEY=your-base64-key-here

# Previous encryption keys for rotation (comma-separated)
ENCRYPTION_PREVIOUS_KEYS=old-key-1,old-key-2
```

---

## Notes

- All endpoints return JSON responses
- The hashing service uses constant-time comparison for security
- Encryption uses random IVs/nonces for each operation
- All methods include comprehensive docblocks and error handling
- Test endpoints are suitable for development and testing only

## Security Warnings

⚠️ **Important Security Notes:**

1. **Never use hardcoded keys in production**
2. **Always load encryption keys from secure environment variables**
3. **Rotate keys periodically**
4. **Use HTTPS in production**
5. **Don't log or expose hashes or encryption keys**
6. **Test endpoints should be disabled in production**

---

For more information, see:

- Hashing package: `packages/framework/hashing/README.md`
- Encryption package: `packages/framework/encryption/README.md`
