import { Mailable } from '@nesvel/nestjs-mail';

/**
 * WelcomeMailable
 *
 * Simple welcome email example.
 * Demonstrates basic Mailable usage with minimal configuration.
 *
 * @example
 * ```typescript
 * // Send immediately
 * await mailService
 *   .to(user.email)
 *   .send(new WelcomeMailable(user));
 *
 * // Auto-detect user's preferred locale
 * await mailService
 *   .to(user) // If user implements HasLocalePreference
 *   .send(new WelcomeMailable(user));
 * ```
 */
export class WelcomeMailable extends Mailable {
  /**
   * Create a new WelcomeMailable instance
   *
   * @param user - User data
   */
  constructor(
    private readonly user: {
      name: string;
      email: string;
    }
  ) {
    super();
  }

  /**
   * Build the email
   */
  public build(): this {
    return this.subject('Welcome to Nesvel!')
      .template('welcome') // You would create this template
      .with('user', this.user)
      .tag('welcome')
      .priority(3); // Normal priority
  }
}
