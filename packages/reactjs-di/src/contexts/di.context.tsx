/**
 * DI Context Constant
 *
 * @description
 * React context for DI container.
 */

import { createContext } from 'react';
import type { DIContainerType } from '../types';

/**
 * DI Context
 *
 * @description
 * React context that holds the DI container instance.
 * Components can access this context to retrieve services from the container.
 *
 * @default null - Container is null until DIProvider initializes it
 */
export const DIContext = createContext<DIContainerType | null>(null);

/**
 * Display name for React DevTools
 */
DIContext.displayName = 'DIContext';
