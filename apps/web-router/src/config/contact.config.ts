/**
 * Contact Information
 *
 * Contact details for support, sales, and general inquiries.
 */
export const contactConfig = {
  /**
   * Support email address
   */
  supportEmail: 'support@nesvel.com',

  /**
   * Sales email address
   */
  salesEmail: 'sales@nesvel.com',

  /**
   * General inquiries email
   */
  generalEmail: 'hello@nesvel.com',

  /**
   * Phone number (include country code)
   */
  phone: '',

  /**
   * Physical address
   */
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
} as const;

/**
 * Type export for TypeScript consumers
 */
export type ContactConfig = typeof contactConfig;
