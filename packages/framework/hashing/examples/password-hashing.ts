/**
 * Password Hashing Example
 *
 * Demonstrates password hashing in a real-world user authentication scenario.
 */

import { Module, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingModule, HashingService, InjectHashing } from '@nesvel/nestjs-hashing';

/**
 * User entity (example)
 */
interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
}

/**
 * User service with password hashing
 */
@Injectable()
export class UserService {
  // Using InjectHashing decorator
  constructor(
    @InjectHashing()
    private readonly hashing: HashingService
  ) {}

  /**
   * Create a new user with hashed password
   */
  async createUser(email: string, password: string): Promise<User> {
    // Hash the password before saving
    const hashedPassword = await this.hashing.make(password);

    const user: User = {
      id: Date.now(),
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // Save user to database (example)
    console.log('User created:', { ...user, password: '[REDACTED]' });

    return user;
  }

  /**
   * Validate user credentials
   */
  async validateCredentials(email: string, password: string): Promise<User> {
    // Find user by email (example)
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw UnauthorizedException.make('Invalid credentials');
    }

    // Verify password
    const isValid = await this.hashing.check(password, user.password);

    if (!isValid) {
      throw UnauthorizedException.make('Invalid credentials');
    }

    // Check if password needs rehashing
    if (await this.hashing.needsRehash(user.password)) {
      console.log('Password needs rehashing, updating...');
      user.password = await this.hashing.make(password);
      // Save updated user (example)
      await this.updateUser(user);
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await this.hashing.check(currentPassword, user.password);

    if (!isValid) {
      throw UnauthorizedException.make('Current password is incorrect');
    }

    // Hash and save new password
    user.password = await this.hashing.make(newPassword);
    await this.updateUser(user);

    console.log('Password changed successfully');
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    // Hash and save new password
    user.password = await this.hashing.make(newPassword);
    await this.updateUser(user);

    console.log('Password reset successfully');
  }

  // Helper methods (example implementations)
  private async findUserByEmail(email: string): Promise<User | null> {
    // Database query example
    return null;
  }

  private async findUserById(id: number): Promise<User | null> {
    // Database query example
    return null;
  }

  private async updateUser(user: User): Promise<void> {
    // Database update example
    console.log('User updated:', { ...user, password: '[REDACTED]' });
  }
}

/**
 * Auth service using UserService
 */
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validate password strength (example)
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }

    const user = await this.userService.createUser(email, password);

    // Generate session token (example)
    const token = 'mock-jwt-token';

    return { user, token };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userService.validateCredentials(email, password);

    // Generate session token (example)
    const token = 'mock-jwt-token';

    return { user, token };
  }
}

/**
 * Module configuration
 */
@Module({
  imports: [
    HashingModule.forRoot({
      driver: 'argon2id',
      argon2: {
        memory: 65536,
        time: 3,
        parallelism: 4,
      },
      global: true, // Make available globally
    }),
  ],
  providers: [UserService, AuthService],
  exports: [UserService, AuthService],
})
export class AuthModule {}

/**
 * Usage example
 */
async function main() {
  console.log('=== Password Hashing Example ===\n');

  // This would normally be injected by NestJS
  const hashingService = null as any;
  const userService = UserService.make(hashingService);
  const authService = AuthService.make(userService);

  // Register user
  console.log('1. Registering user...');
  // await authService.register('user@example.com', 'SecurePassword123!');

  // Login user
  console.log('\n2. Logging in...');
  // await authService.login('user@example.com', 'SecurePassword123!');

  // Change password
  console.log('\n3. Changing password...');
  // await userService.changePassword(1, 'SecurePassword123!', 'NewPassword456!');

  console.log('\n=== Done ===');
}

// Uncomment to run
// main().catch(console.error);
