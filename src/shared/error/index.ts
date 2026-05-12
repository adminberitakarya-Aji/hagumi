/**
 * Error handling exports
 * Centralized exports for all error handling components and utilities
 */

// Components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorFallback } from './ErrorFallback';
export { ErrorProvider, useError, useErrorMessage, useHasError } from './ErrorContext';

// Utilities
export {
  createError,
  errorFromStandardError,
  errorFromAPIResponse,
  addErrorContext,
  getErrorSeverity,
  getErrorCategory,
  isCriticalError,
  isRecoverableError,
  getUserFriendlyMessage,
  logError,
  logErrorWithContext,
  handleAPIError,
  withErrorHandling,
  createRetryFunction,
} from './errorHandler';

// Types
export type { AppError, ErrorContext } from './errorHandler';

// Enums
export { ErrorCode, ErrorSeverity, ErrorCategory } from './errorHandler';