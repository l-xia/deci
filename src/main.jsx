import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { PostHogProvider } from 'posthog-js/react'
import { AppProvider } from './context'

const posthogOptions = {
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
};

// Use proxy in development, direct connection in production
if (import.meta.env.DEV) {
  posthogOptions.api_host = '/ingest';
  posthogOptions.ui_host = 'https://us.i.posthog.com';
} else {
  posthogOptions.api_host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={posthogOptions}
    >
      <ErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)