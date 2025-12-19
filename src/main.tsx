import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import ErrorBoundary from './components/ErrorBoundary';
import { handleError } from './utils/errorHandler';

// Global error handler for unhandled promise rejections
window.onunhandledrejection = (event) => {
  handleError(event.reason, { context: 'unhandledRejection' });
  event.preventDefault(); // Prevent default browser error handling
};

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  handleError(error || new Error(String(message)), {
    context: 'globalError',
    ...(source && { source }),
    ...(lineno && { lineno }),
    ...(colno && { colno }),
  });
  return true; // Prevent default browser error handling
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);
