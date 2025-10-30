/**
 * Client Entry Point
 *
 * Initialize DI container on the client side only.
 */

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Initialize DI container
import { initializeContainer } from '@nesvel/reactjs-di';
import { AppModule } from '~/modules/app.module';

initializeContainer(AppModule);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
