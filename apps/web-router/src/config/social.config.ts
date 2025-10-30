/**
 * Social Media Configuration
 *
 * Links to social media profiles and sharing settings.
 */
export const socialConfig = {
  /**
   * Social media profile URLs
   * Set to empty string to disable
   */
  profiles: {
    twitter: '',
    github: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
  },

  /**
   * Twitter/X handle for twitter:site meta tag
   * Include the @ symbol
   * @example '@nesvel'
   */
  twitterHandle: '',

  /**
   * Facebook App ID for Open Graph
   * Required for Facebook Insights
   */
  facebookAppId: '',
} as const;

/**
 * Type export for TypeScript consumers
 */
export type SocialConfig = typeof socialConfig;
