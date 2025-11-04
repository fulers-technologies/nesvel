import { type RouteConfig, route } from '@react-router/dev/routes';
import { initializeContainer, isInitialized } from '@nesvel/reactjs-di';
import { AppModule } from './modules/app.module';

// Initialize container to register routes (only if not already initialized)
if (!isInitialized()) {
  initializeContainer(AppModule);
}

export default [
  // Wildcard route to handle all DI-registered routes
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
