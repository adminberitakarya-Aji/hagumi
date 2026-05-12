import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { AppError, ErrorCode, createError, logError } from './errorHandler';

export interface ErrorContextType {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  showError: (code: ErrorCode, message: string, details?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * ErrorProvider component that provides error state and handlers
 * to all child components.
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<AppError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showError = useCallback((code: ErrorCode, message: string, details?: string) => {
    const newError = createError(code, message, details);
    setError(newError);
    logError(newError);
  }, []);

  const value: ErrorContextType = {
    error,
    setError,
    clearError,
    showError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;