import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured — skipping initialization')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    release: `hagumi@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,
    
    // Capture 100% of errors in production, 0% in dev
    sampleRate: import.meta.env.PROD ? 1.0 : 0.0,
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 0.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0.0,

    // Ignore common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'NetworkError when attempting to fetch resource',
      'ChunkLoadError',
    ],

    // Breadcrumbs (context for errors)
    beforeBreadcrumb(breadcrumb) {
      // Don't send console breadcrumbs in prod to reduce noise
      if (breadcrumb.category === 'console' && import.meta.env.PROD) {
        return null
      }
      return breadcrumb
    },

    // Filter sensitive data
    beforeSend(event) {
      // Remove email and IP from event data
      if (event.user) {
        delete event.user.email
        delete event.user.ip_address
      }
      return event
    },
  })

  console.log('[Sentry] Initialized successfully')
}

/**
 * Convenience wrapper for logging errors with context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error('[DEV Error]', error, context)
    return
  }
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context)
    }
    Sentry.captureException(error)
  })
}