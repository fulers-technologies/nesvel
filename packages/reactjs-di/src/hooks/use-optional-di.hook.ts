import { useContext } from 'react';
import type { ServiceIdentifier } from '../types';
import { DIContext } from '../contexts';

/**
 * useOptionalDI Hook
 *
 * @template T - The service interface type
 * @param token - The service identifier symbol
 * @returns The service instance or null if not registered
 * @throws {Error} If used outside DIProvider
 *
 * @description
 * Similar to `useDI`, but returns `null` instead of throwing an error
 * if the service is not registered. This is useful for optional services
 * or feature flags where the service may not always be available.
 *
 * @example Optional analytics
 * ```tsx
 * import { useOptionalDI } from '@nesvel/reactjs-di';
 * import { ANALYTICS_SERVICE, type IAnalyticsService } from '~/modules/analytics';
 *
 * function MyComponent() {
 *   const analytics = useOptionalDI<IAnalyticsService>(ANALYTICS_SERVICE);
 *
 *   useEffect(() => {
 *     // Only track if analytics is configured
 *     if (analytics) {
 *       analytics.trackPageView('/my-page');
 *     }
 *   }, [analytics]);
 *
 *   return <div>My Component</div>;
 * }
 * ```
 *
 * @example Feature toggle
 * ```tsx
 * import { useOptionalDI } from '@nesvel/reactjs-di';
 * import { FEATURE_SERVICE, type IFeatureService } from '~/modules/features';
 *
 * function MyComponent() {
 *   const features = useOptionalDI<IFeatureService>(FEATURE_SERVICE);
 *   const showNewFeature = features?.isEnabled('new-feature') ?? false;
 *
 *   return (
 *     <div>
 *       {showNewFeature && <NewFeature />}
 *       <ExistingFeature />
 *     </div>
 *   );
 * }
 * ```
 */
export function useOptionalDI<T = unknown>(token: ServiceIdentifier<T>): T | null {
  // Get container from context
  const container = useContext(DIContext);

  // Validate context availability
  if (!container) {
    throw new Error(
      '[useOptionalDI] Hook must be used within <DIProvider>. ' +
        'Make sure your app is wrapped with the DIProvider component.',
    );
  }

  try {
    // Try to retrieve service from container
    return container.get(token) as T;
  } catch (error: Error | any) {
    // Return null if service not found (instead of throwing)
    return null;
  }
}
