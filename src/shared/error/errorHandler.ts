/**
 * Error handling utilities for frontend application
 */

export interface AppError {
  code: string;
  message: string;
  details?: string;
  stack?: string;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  userAgent?: string;
}

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_FIELD = 'MISSING_FIELD',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  
  // API errors
  API_ERROR = 'API_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business logic errors
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  INVALID_ACTION = 'INVALID_ACTION',
  INVALID_STATE = 'INVALID_STATE',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  AUTH = 'auth',
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  BUSINESS = 'business',
  SYSTEM = 'system',
}

/**
 * Creates a new application error
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: string
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date(),
  };
}

/**
 * Creates an error from a standard Error object
 */
export function errorFromStandardError(error: Error): AppError {
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
  };
}

/**
 * Creates an error from an API response
 */
export function errorFromAPIResponse(response: any): AppError {
  return {
    code: response.code || ErrorCode.API_ERROR,
    message: response.message || 'An error occurred',
    details: response.details,
    timestamp: new Date(),
  };
}

/**
 * Adds context to an error
 */
export function addErrorContext(error: AppError, context: ErrorContext): AppError {
  return {
    ...error,
    userId: context.userId || error.userId,
    requestId: context.requestId || error.requestId,
  };
}

/**
 * Gets the severity level for an error code
 */
export function getErrorSeverity(code: ErrorCode): ErrorSeverity {
  switch (code) {
    case ErrorCode.AUTH_REQUIRED:
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.SESSION_EXPIRED:
      return ErrorSeverity.HIGH;
    case ErrorCode.INVALID_TOKEN:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.INVALID_FORMAT:
      return ErrorSeverity.MEDIUM;
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.CONNECTION_FAILED:
      return ErrorSeverity.HIGH;
    case ErrorCode.TIMEOUT:
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return ErrorSeverity.MEDIUM;
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.SERVICE_UNAVAILABLE:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.LOW;
  }
}

/**
 * Gets the category for an error code
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  switch (code) {
    case ErrorCode.AUTH_REQUIRED:
    case ErrorCode.INVALID_TOKEN:
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.SESSION_EXPIRED:
      return ErrorCategory.AUTH;
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.INVALID_INPUT:
    case ErrorCode.INVALID_FORMAT:
    case ErrorCode.MISSING_FIELD:
    case ErrorCode.VALUE_OUT_OF_RANGE:
      return ErrorCategory.VALIDATION;
    case ErrorCode.NETWORK_ERROR:
    case ErrorCode.CONNECTION_FAILED:
    case ErrorCode.TIMEOUT:
      return ErrorCategory.NETWORK;
    case ErrorCode.API_ERROR:
    case ErrorCode.SERVER_ERROR:
    case ErrorCode.NOT_FOUND:
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return ErrorCategory.API;
    case ErrorCode.BUSINESS_LOGIC:
    case ErrorCode.INVALID_ACTION:
    case ErrorCode.INVALID_STATE:
    case ErrorCode.RESOURCE_NOT_FOUND:
    case ErrorCode.OPERATION_NOT_ALLOWED:
      return ErrorCategory.BUSINESS;
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.SERVICE_UNAVAILABLE:
      return ErrorCategory.SYSTEM;
    default:
      return ErrorCategory.SYSTEM;
  }
}

/**
 * Checks if an error is critical
 */
export function isCriticalError(error: AppError): boolean {
  return getErrorSeverity(error.code as ErrorCode) === ErrorSeverity.CRITICAL;
}

/**
 * Checks if an error is recoverable
 */
export function isRecoverableError(error: AppError): boolean {
  const nonRecoverableCodes = [
    ErrorCode.AUTH_REQUIRED,
    ErrorCode.UNAUTHORIZED,
    ErrorCode.SESSION_EXPIRED,
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
  ];
  return !nonRecoverableCodes.includes(error.code as ErrorCode);
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  const messages: Record<string, string> = {
    [ErrorCode.AUTH_REQUIRED]: 'Please log in to continue',
    [ErrorCode.INVALID_TOKEN]: 'Your session has expired. Please log in again',
    [ErrorCode.UNAUTHORIZED]: 'You do not have permission to perform this action',
    [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
    [ErrorCode.INVALID_INPUT]: 'Invalid input provided',
    [ErrorCode.INVALID_FORMAT]: 'Invalid format',
    [ErrorCode.MISSING_FIELD]: 'Required field is missing',
    [ErrorCode.VALUE_OUT_OF_RANGE]: 'Value is out of valid range',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection',
    [ErrorCode.CONNECTION_FAILED]: 'Failed to connect to server',
    [ErrorCode.TIMEOUT]: 'Request timed out. Please try again',
    [ErrorCode.API_ERROR]: 'An error occurred. Please try again',
    [ErrorCode.SERVER_ERROR]: 'Server error. Please try again later',
    [ErrorCode.NOT_FOUND]: 'Resource not found',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait and try again',
    [ErrorCode.BUSINESS_LOGIC]: 'Operation not allowed',
    [ErrorCode.INVALID_ACTION]: 'Invalid action',
    [ErrorCode.INVALID_STATE]: 'Invalid state for this operation',
    [ErrorCode.RESOURCE_NOT_FOUND]: 'Resource not found',
    [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
    [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
  };

  return messages[error.code] || error.message || 'An error occurred';
}

/**
 * Logs an error to the console and error reporting service
 */
export function logError(error: AppError | Error, context?: ErrorContext): void {
  const appError = error instanceof Error ? errorFromStandardError(error) : error;
  
  // Add context if provided
  if (context) {
    addErrorContext(appError, context);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      stack: appError.stack,
      timestamp: appError.timestamp,
      userId: appError.userId,
      requestId: appError.requestId,
    });
  }

  // TODO: Send to error reporting service (e.g., Sentry)
  // Example:
  // Sentry.captureException(error, {
  //   tags: {
  //     code: appError.code,
  //     category: getErrorCategory(appError.code as ErrorCode),
  //   },
  //   extra: {
  //     details: appError.details,
  //     userId: appError.userId,
  //     requestId: appError.requestId,
  //   },
  // });
}

/**
 * Logs an error with additional context
 */
export function logErrorWithContext(
  error: AppError | Error,
  context: ErrorContext
): void {
  logError(error, context);
}

/**
 * Handles an API error response
 */
export function handleAPIError(response: any): AppError {
  const error = errorFromAPIResponse(response);
  logError(error);
  return error;
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = error instanceof Error ? errorFromStandardError(error) : createError(
      ErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred'
    );
    
    if (context) {
      addErrorContext(appError, context);
    }
    
    logError(appError, context);
    return { data: null, error: appError };
  }
}

/**
 * Creates a retry function with exponential backoff
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          reject(error);
          return;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, retries - 1);
        setTimeout(attempt, delay);
      }
    };

    attempt();
  });
}