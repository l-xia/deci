import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import App from './App';
import AnalyticsPage from './pages/AnalyticsPage';
import ArchivePage from './pages/ArchivePage';
import { AppProvider, AuthProvider } from './context';

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

const archiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archive',
  component: ArchivePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  analyticsRoute,
  archiveRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
