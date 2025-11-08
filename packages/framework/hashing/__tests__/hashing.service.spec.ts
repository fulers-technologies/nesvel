import { Test, TestingModule } from '@nestjs/testing';
import { HashingModule } from '../src/hashing.module';
import { HashingService } from '../src/services/hashing.service';
import { HashAlgorithm } from '../src/enums';

describe('HashingService', () => {
  let service: HashingService;

  describe('with Bcrypt driver', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          HashingModule.forRoot({
            driver: HashAlgorithm.BCRYPT,
            bcrypt: {
              rounds: 4, // Lower for faster tests
            },
          }),
        ],
      }).compile();

      service = module.get<HashingService>(HashingService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should hash a value', async () => {
      const value = 'password123';
      const hash = await service.make(value);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(value);
      expect(hash).toMatch(/^\$2[aby]?\$/); // Bcrypt format
    });

    it('should verify a correct value', async () => {
      const value = 'password123';
      const hash = await service.make(value);
      const isValid = await service.check(value, hash);

      expect(isValid).toBe(true);
    });

    it('should reject an incorrect value', async () => {
      const value = 'password123';
      const wrongValue = 'wrongpassword';
      const hash = await service.make(value);
      const isValid = await service.check(wrongValue, hash);

      expect(isValid).toBe(false);
    });

    it('should detect if rehash is needed', async () => {
      const value = 'password123';
      const hash = await service.make(value);
      const needsRehash = await service.needsRehash(hash, { rounds: 10 });

      expect(needsRehash).toBe(true); // Because we used rounds: 4
    });

    it('should return hash info', async () => {
      const value = 'password123';
      const hash = await service.make(value);
      const info = await service.info(hash);

      expect(info.valid).toBe(true);
      expect(info.algorithm).toBe(HashAlgorithm.BCRYPT);
      expect(info.options).toHaveProperty('cost');
      expect(info.options?.cost).toBe(4);
    });

    it('should detect if value is hashed', async () => {
      const plainValue = 'password123';
      const hash = await service.make(plainValue);

      expect(await service.isHashed(plainValue)).toBe(false);
      expect(await service.isHashed(hash)).toBe(true);
    });
  });

  describe('with Argon2id driver', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          HashingModule.forRoot({
            driver: HashAlgorithm.ARGON2ID,
            argon2: {
              memory: 4096, // Lower for faster tests
              time: 2,
              parallelism: 1,
            },
          }),
        ],
      }).compile();

      service = module.get<HashingService>(HashingService);
    });

    it('should hash a value', async () => {
      const value = 'password123';
      const hash = await service.make(value);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(value);
      expect(hash).toMatch(/^\$argon2id\$/); // Argon2id format
    });

    it('should verify a correct value', async () => {
      const value = 'password123';
      const hash = await service.make(value);
      const isValid = await service.check(value, hash);

      expect(isValid).toBe(true);
    });

    it('should return hash info', async () => {
      const value = 'password123';
      const hash = await service.make(value);
      const info = await service.info(hash);

      expect(info.valid).toBe(true);
      expect(info.algorithm).toBe(HashAlgorithm.ARGON2ID);
      expect(info.options).toHaveProperty('memory');
      expect(info.options?.memory).toBe(4096);
    });
  });
});
