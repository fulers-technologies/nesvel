import type { ReactNode } from 'react';

/**
 * DI Provider Props
 */
export interface DIProviderProps {
  /**
   * Child components that will have access to the DI container
   */
  children: ReactNode;
}
