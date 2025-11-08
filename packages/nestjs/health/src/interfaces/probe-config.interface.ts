/**
 * Probe Configuration Interface
 *
 * Configuration for enabling/disabling Kubernetes-style health probes.
 *
 * **Probe Types**:
 * - **Liveness**: Determines if container should be restarted
 * - **Readiness**: Determines if container can receive traffic
 * - **Startup**: Determines if application has finished initialization
 *
 * @interface IProbeConfig
 *
 * @example
 * ```typescript
 * const probeConfig: IProbeConfig = {
 *   liveness: true,   // Enable liveness probe
 *   readiness: true,  // Enable readiness probe
 *   startup: false,   // Disable startup probe
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IProbeConfig {
  /**
   * Enable Liveness Probe
   *
   * Determines if the liveness probe endpoint should be created.
   * The liveness probe checks if the application is alive and responsive.
   * If it fails, Kubernetes will restart the container.
   *
   * **Best Practice**: Only check lightweight internal resources
   *
   * @default true
   *
   * @example
   * ```typescript
   * liveness: true  // Creates GET /health/liveness endpoint
   * ```
   */
  liveness?: boolean;

  /**
   * Enable Readiness Probe
   *
   * Determines if the readiness probe endpoint should be created.
   * The readiness probe checks if the application is ready to serve traffic.
   * If it fails, Kubernetes will remove the pod from the service load balancer.
   *
   * **Best Practice**: Check all critical dependencies
   *
   * @default true
   *
   * @example
   * ```typescript
   * readiness: true  // Creates GET /health/readiness endpoint
   * ```
   */
  readiness?: boolean;

  /**
   * Enable Startup Probe
   *
   * Determines if the startup probe endpoint should be created.
   * The startup probe checks if the application has completed initialization.
   * Useful for slow-starting applications.
   *
   * **Best Practice**: Use for applications with long startup times
   *
   * @default true
   *
   * @example
   * ```typescript
   * startup: true  // Creates GET /health/startup endpoint
   * ```
   */
  startup?: boolean;
}
