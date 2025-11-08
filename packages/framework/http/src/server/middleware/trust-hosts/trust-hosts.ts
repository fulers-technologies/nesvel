import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';
import { TrustHostsOptions } from './trust-hosts.interface';

/**
 * Trust Hosts Middleware
 *
 * Laravel-style Host header validation for NestJS.
 * Prevents Host Header Injection attacks by validating the Host header
 * against a whitelist of trusted patterns.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage (trust subdomains of app URL)
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { TrustHostsMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new TrustHostsMiddleware({
 *         appUrl: 'https://example.com'
 *       }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With specific hosts
 * ```typescript
 * const middleware = new TrustHostsMiddleware({
 *   hosts: ['^(.+\\.)?example\\.com$', 'api\\.trusted\\.com'],
 *   trustSubdomains: false,
 * });
 * ```
 */
@Injectable()
export class TrustHostsMiddleware extends BaseHttpMiddleware {
  /**
   * Trust hosts configuration options.
   */
  private readonly options: Required<TrustHostsOptions>;

  /**
   * Compiled regex patterns for trusted hosts.
   */
  private trustedHostPatterns: RegExp[] = [];

  /**
   * Constructor
   *
   * @param options - Trust hosts configuration
   */
  constructor(options: TrustHostsOptions = {}) {
    super();

    this.options = {
      hosts: options.hosts,
      trustSubdomains: options.trustSubdomains ?? true,
      appUrl: options.appUrl ?? process.env.APP_URL ?? '',
      skipEnvironments: options.skipEnvironments ?? ['local', 'test', 'testing'],
      environment: options.environment ?? process.env.NODE_ENV ?? 'production',
    } as Required<TrustHostsOptions>;

    this.initializeTrustedHosts();
  }

  /**
   * Initialize trusted host patterns from configuration.
   */
  private initializeTrustedHosts(): void {
    const hostPatterns = this.getHostPatterns();
    this.trustedHostPatterns = hostPatterns.filter(Boolean).map((pattern) => new RegExp(pattern));
  }

  /**
   * Get host patterns that should be trusted.
   *
   * @returns Array of regex pattern strings
   */
  private getHostPatterns(): string[] {
    // If no explicit hosts configured, use app URL subdomains
    if (!this.options.hosts) {
      const appPattern = this.allSubdomainsOfApplicationUrl();
      return appPattern ? [appPattern] : [];
    }

    // Get hosts from array or function
    const hosts =
      typeof this.options.hosts === 'function' ? this.options.hosts() : this.options.hosts;

    // Add app URL subdomains if trustSubdomains is true
    if (this.options.trustSubdomains) {
      const appPattern = this.allSubdomainsOfApplicationUrl();
      if (appPattern) {
        return [...hosts, appPattern];
      }
    }

    return hosts;
  }

  /**
   * Get a regular expression matching the application URL and all of its subdomains.
   *
   * @returns Regex pattern string or null
   */
  private allSubdomainsOfApplicationUrl(): string | null {
    if (!this.options.appUrl) {
      return null;
    }

    try {
      const url = new URL(this.options.appUrl);
      const host = url.hostname;
      
      if (host) {
        // Escape special regex characters
        const escapedHost = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `^(.+\\.)?${escapedHost}$`;
      }
    } catch (error) {
      // Log warning but don't fail
      if (this.logger) {
        this.logger.warn('Invalid APP_URL format', { appUrl: this.options.appUrl, error });
      }
    }

    return null;
  }

  /**
   * Determine if the application should specify trusted hosts.
   * Skip validation in local/test environments.
   *
   * @returns True if hosts should be validated
   */
  private shouldValidateTrustedHosts(): boolean {
    return !this.options.skipEnvironments.includes(this.options.environment);
  }

  /**
   * Check if the given host is trusted.
   *
   * @param host - Host header value
   * @returns True if host is trusted
   */
  private isHostTrusted(host: string): boolean {
    if (this.trustedHostPatterns.length === 0) {
      // No patterns configured, allow all (not recommended for production)
      return true;
    }

    return this.trustedHostPatterns.some((pattern) => pattern.test(host));
  }

  /**
   * Before hook: Validate the Host header.
   *
   * @param req - Express request
   * @param _res - Express response (unused)
   */
  protected async before(req: Request, _res: Response): Promise<void> {
    if (!this.shouldValidateTrustedHosts()) {
      return;
    }

    const host = req.get('host');

    if (!host) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Missing Host header',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    // Remove port from host for validation
    const hostWithoutPort = host.split(':')[0];

    if (!this.isHostTrusted(hostWithoutPort)) {
      this.logger.warn('Untrusted host rejected', {
        host: hostWithoutPort,
        trustedPatterns: this.trustedHostPatterns.map((p) => p.source),
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Untrusted host',
          error: 'Forbidden',
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  /**
   * Handle hook: Pass through to next middleware.
   *
   * @param _req - Express request (unused)
   * @param _res - Express response (unused)
   * @param next - Next function
   */
  protected handle(_req: Request, _res: Response, next: NextFunction): void {
    next();
  }

  /**
   * Get the current trusted host patterns.
   *
   * @returns Array of regex patterns
   */
  public getTrustedHostPatterns(): RegExp[] {
    return this.trustedHostPatterns;
  }
}
