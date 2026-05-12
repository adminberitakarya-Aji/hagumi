import React from 'react';
import { Button } from '../ui';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset?: () => void;
}

/**
 * ErrorFallback component that displays a user-friendly error message
 * when an error is caught by ErrorBoundary.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 text-center mb-6">
          We're sorry for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <div className="mb-6">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details
              </summary>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Message:
                  </p>
                  <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                    {error.message}
                  </p>
                </div>
                {error.stack && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Stack Trace:
                    </p>
                    <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Component Stack:
                    </p>
                    <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onReset}
            className="w-full"
            variant="primary"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
            variant="secondary"
          >
            Go to Home
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          If this problem persists, please{' '}
          <a
            href="mailto:support@hagumi.app"
            className="text-blue-600 hover:text-blue-700"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;