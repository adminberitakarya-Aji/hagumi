import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App'
import { initSentry } from '@/lib/sentry'

// Initialize Sentry error tracking
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const err = error as Error | null
        return (
          <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-8 text-white">
            <div className="text-6xl mb-6">🌸</div>
            <h1 className="text-2xl font-black mb-4">Something went wrong</h1>
            <p className="text-white/50 text-sm mb-6 max-w-md text-center">
              {err?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={resetError}
              className="bg-hagumi-pink hover:bg-pink-500 text-white font-bold px-8 py-3 rounded-full transition-all"
            >
              Try Again
            </button>
            <p className="text-white/20 text-xs mt-4">
              Error has been reported automatically.
            </p>
          </div>
        )
      }}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)