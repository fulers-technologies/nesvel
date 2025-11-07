/**
 * Authentication Configuration
 *
 * Configuration for authentication and authorization including:
 * - JWT settings
 * - Session configuration
 * - OAuth providers
 * - Password policies
 * - Token management
 *
 * @module config/auth.config
 */

/**
 * Authentication strategy type
 */
export enum AuthStrategy {
  JWT = 'jwt',
  SESSION = 'session',
  OAUTH = 'oauth',
  API_KEY = 'api_key',
}

/**
 * OAuth provider type
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
}

/**
 * Authentication configuration interface
 */
export interface IAuthConfig {
  /**
   * Default authentication strategy
   */
  defaultStrategy: AuthStrategy;

  /**
   * JWT configuration
   */
  jwt: {
    /**
     * JWT secret key
     */
    secret: string;

    /**
     * JWT access token expiration
     */
    accessTokenExpiry: string;

    /**
     * JWT refresh token expiration
     */
    refreshTokenExpiry: string;

    /**
     * JWT issuer
     */
    issuer: string;

    /**
     * JWT audience
     */
    audience: string;

    /**
     * JWT algorithm
     */
    algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  };

  /**
   * Session configuration
   */
  session: {
    /**
     * Session secret
     */
    secret: string;

    /**
     * Session name (cookie name)
     */
    name: string;

    /**
     * Session expiration in seconds
     */
    maxAge: number;

    /**
     * Resave session
     */
    resave: boolean;

    /**
     * Save uninitialized sessions
     */
    saveUninitialized: boolean;

    /**
     * Cookie secure flag (HTTPS only)
     */
    secure: boolean;

    /**
     * Cookie httpOnly flag
     */
    httpOnly: boolean;

    /**
     * Cookie sameSite setting
     */
    sameSite: 'strict' | 'lax' | 'none';
  };

  /**
   * Password policy
   */
  password: {
    /**
     * Minimum password length
     */
    minLength: number;

    /**
     * Require uppercase letter
     */
    requireUppercase: boolean;

    /**
     * Require lowercase letter
     */
    requireLowercase: boolean;

    /**
     * Require number
     */
    requireNumber: boolean;

    /**
     * Require special character
     */
    requireSpecialChar: boolean;

    /**
     * Password salt rounds (bcrypt)
     */
    saltRounds: number;

    /**
     * Password expiration days (0 = never expires)
     */
    expirationDays: number;
  };

  /**
   * OAuth configuration
   */
  oauth: {
    /**
     * Google OAuth
     */
    google?: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };

    /**
     * GitHub OAuth
     */
    github?: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };

    /**
     * Facebook OAuth
     */
    facebook?: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
  };

  /**
   * API Key configuration
   */
  apiKey: {
    /**
     * Enable API key authentication
     */
    enabled: boolean;

    /**
     * API key header name
     */
    headerName: string;

    /**
     * API key expiration days (0 = never expires)
     */
    expirationDays: number;
  };

  /**
   * Two-factor authentication
   */
  twoFactor: {
    /**
     * Enable 2FA
     */
    enabled: boolean;

    /**
     * 2FA issuer name (for TOTP apps)
     */
    issuer: string;

    /**
     * Grace period in days
     */
    gracePeriod: number;
  };

  /**
   * Account security
   */
  security: {
    /**
     * Maximum login attempts before lockout
     */
    maxLoginAttempts: number;

    /**
     * Account lockout duration in minutes
     */
    lockoutDuration: number;

    /**
     * Enable email verification
     */
    emailVerification: boolean;

    /**
     * Email verification token expiry in hours
     */
    emailVerificationExpiry: number;

    /**
     * Password reset token expiry in hours
     */
    passwordResetExpiry: number;
  };
}

/**
 * Load authentication configuration from environment variables
 */
export const authConfig: IAuthConfig = {
  defaultStrategy: (process.env.AUTH_STRATEGY as AuthStrategy) || AuthStrategy.JWT,

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'nesvel-api',
    audience: process.env.JWT_AUDIENCE || 'nesvel-app',
    algorithm: (process.env.JWT_ALGORITHM as any) || 'HS256',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this-in-production',
    name: process.env.SESSION_NAME || 'nesvel.sid',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400', 10), // 24 hours
    resave: process.env.SESSION_RESAVE === 'true',
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === 'true',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: (process.env.SESSION_SAME_SITE as any) || 'lax',
  },

  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
    requireSpecialChar: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
    expirationDays: parseInt(process.env.PASSWORD_EXPIRATION_DAYS || '0', 10),
  },

  oauth: {
    google: process.env.GOOGLE_CLIENT_ID
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
        }
      : undefined,

    github: process.env.GITHUB_CLIENT_ID
      ? {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          callbackUrl: process.env.GITHUB_CALLBACK_URL || '',
        }
      : undefined,

    facebook: process.env.FACEBOOK_CLIENT_ID
      ? {
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
          callbackUrl: process.env.FACEBOOK_CALLBACK_URL || '',
        }
      : undefined,
  },

  apiKey: {
    enabled: process.env.API_KEY_ENABLED === 'true',
    headerName: process.env.API_KEY_HEADER || 'X-API-Key',
    expirationDays: parseInt(process.env.API_KEY_EXPIRATION_DAYS || '0', 10),
  },

  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED === 'true',
    issuer: process.env.TWO_FACTOR_ISSUER || 'Nesvel API',
    gracePeriod: parseInt(process.env.TWO_FACTOR_GRACE_PERIOD || '30', 10),
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '30', 10),
    emailVerification: process.env.EMAIL_VERIFICATION !== 'false',
    emailVerificationExpiry: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || '24', 10),
    passwordResetExpiry: parseInt(process.env.PASSWORD_RESET_EXPIRY || '1', 10),
  },
};

/**
 * Validate JWT secret in production
 */
if (process.env.NODE_ENV === 'production' && authConfig.jwt.secret.includes('change-this')) {
  console.warn(
    '⚠️  WARNING: Using default JWT secret in production! Please set JWT_SECRET environment variable.'
  );
}
