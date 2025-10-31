/**
 * Client Entry Point
 *
 * Initialize DI container on the client side.
 */

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { initializeContainer } from '@nesvel/reactjs-di';
import { AppModule } from '~/modules/app.module';

// Initialize DI container for client-side rendering
// This is safe because skipIfInitialized is true by default
initializeContainer(AppModule);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
