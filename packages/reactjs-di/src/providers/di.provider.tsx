import { DIContext } from '../contexts';
import { getContainer } from '../utils/container.util';
import type { DIProviderProps } from '../interfaces';

/**
 * DI Provider Component
 *
 * @description
 * Provides the DI container to all child components via React Context.
 * The container must be initialized via `initializeContainer()` before
 * this component is rendered.
 *
 * @param props - Component props
 * @param props.children - Child components
 * @throws {Error} If container is not initialized when component renders
 *
 * @example
 * ```tsx
 * import { DIProvider } from '@nesvel/reactjs-di';
 * import { AppModule } from '~/modules/app.module';
 *
 * // Initialize container first
 * initializeContainer(AppModule);
 *
 * // Then use provider
 * function Root() {
 *   return (
 *     <DIProvider>
 *       <App />
 *     </DIProvider>
 *   );
 * }
 * ```
 */
export function DIProvider({ children }: DIProviderProps) {
  // Get the initialized container
  // This will throw if container is not initialized
  const container = getContainer();

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}
