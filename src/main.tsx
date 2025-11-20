import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { PostHogProvider } from 'posthog-js/react'
import type { PostHogConfig } from 'posthog-js'
import { AuthProvider } from './context/AuthContext'

const posthogOptions: Partial<PostHogConfig> = {
  person_profiles: 'identified_only' as const,
  capture_pageview: true,
  capture_pageleave: true,
};

// proxy in development, direct connection in production
if (import.meta.env.DEV) {
  posthogOptions.api_host = '/ingest';
  posthogOptions.ui_host = 'https://us.i.posthog.com';
} else {
  posthogOptions.api_host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={posthogOptions}
    >
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)