import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import App from './App';
import AnalyticsPage from './pages/AnalyticsPage';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </AuthProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([indexRoute, analyticsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
