import { useContext } from 'react';
import ErrorContext, { ErrorContextType } from './ErrorContext';
import { getUserFriendlyMessage } from './errorHandler';

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
