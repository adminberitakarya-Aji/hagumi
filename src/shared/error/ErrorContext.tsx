import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppError, ErrorCode, createError, logError, getUserFriendlyMessage } from './errorHandler';

interface ErrorContextType {
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

/**
 * Hook to use the error context
 */
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * Hook to get user-friendly error message
 */
export const useErrorMessage = (): string => {
  const { error } = useError();
  return error ? getUserFriendlyMessage(error) : '';
};

/**
 * Hook to check if there's an error
 */
export const useHasError = (): boolean => {
  const { error } = useError();
  return error !== null;
};

export default ErrorContext;