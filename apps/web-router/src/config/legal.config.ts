/**
 * Legal Configuration
 *
 * Links to legal pages and compliance information.
 */
export const legalConfig = {
  /**
   * Privacy policy page URL
   */
  privacyPolicyUrl: '/privacy',

  /**
   * Terms of service page URL
   */
  termsOfServiceUrl: '/terms',

  /**
   * Cookie policy page URL
   */
  cookiePolicyUrl: '/cookies',

  /**
   * Company legal name
   */
  companyName: 'Nesvel Inc.',

  /**
   * Copyright year (will show as "2024" or "2024-2025" if different from current)
   */
  copyrightYear: new Date().getFullYear(),
} as const;

/**
 * Type export for TypeScript consumers
 */
export type LegalConfig = typeof legalConfig;
