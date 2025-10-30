import { type RouteConfig, index, route } from '@react-router/dev/routes';
import { buildRoutesFromModules } from '@nesvel/reactjs-di';

export default [
  index('routes/home.tsx'),
  route('/di-demo', 'routes/di-demo.tsx'),
  ...buildRoutesFromModules(),
] satisfies RouteConfig;
