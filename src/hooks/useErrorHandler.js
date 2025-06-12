import { useState, useCallback } from 'react';
import { handleError, retryWithBackoff } from '@/lib/errorHandler';
import toast from 'react-hot-toast';

export function useErrorHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithErrorHandling = useCallback(async (
    asyncFunction,
    options = {}
  ) => {
    const {
      showToast = true,
      retries = 0,
      loadingMessage = 'Processing...',
      successMessage = null,
      context = {}
    } = options;

    setIsLoading(true);
    setError(null);

    let toastId;
    if (showToast && loadingMessage) {
      toastId = toast.loading(loadingMessage);
    }

    try {
      let result;
      
      if (retries > 0) {
        result = await retryWithBackoff(asyncFunction, retries);
      } else {
        result = await asyncFunction();
      }

      if (showToast && successMessage) {
        toast.success(successMessage, { id: toastId });
      } else if (toastId) {
        toast.dismiss(toastId);
      }

      return result;
    } catch (originalError) {
      const jobMateError = handleError(originalError, context);
      setError(jobMateError);

      if (showToast) {
        const errorDisplay = getErrorDisplay(jobMateError);
        toast.error(errorDisplay.message, { 
          id: toastId,
          duration: 6000,
          icon: errorDisplay.severity === 'warning' ? '⚠️' : '❌'
        });
      }

      throw jobMateError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    executeWithErrorHandling,
    isLoading,
    error,
    clearError
  };
}

// Import getErrorDisplay function
function getErrorDisplay(error) {
  const { getErrorDisplay } = require('@/lib/errorHandler');
  return getErrorDisplay(error);
}