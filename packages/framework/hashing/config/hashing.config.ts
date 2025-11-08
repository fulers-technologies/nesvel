import { IHashingConfig } from '../src/interfaces';
import { HashAlgorithm } from '../src/enums';

/**
 * Default Hashing Configuration
 *
 * Uses Argon2id with OWASP recommended parameters.
 */
export const defaultHashingConfig: IHashingConfig = {
  driver: HashAlgorithm.ARGON2ID,

  bcrypt: {
    rounds: 10,
  },

  argon2: {
    memory: 65536, // 64 MB
    time: 3,
    parallelism: 4,
  },
};
