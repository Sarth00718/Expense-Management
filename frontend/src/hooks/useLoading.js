import { useState, useCallback } from 'react';

/**
 * Custom hook to manage loading states for async operations
 * @returns {Object} { isLoading, startLoading, stopLoading, withLoading }
 */
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * Wrapper function that automatically manages loading state
   * @param {Function} asyncFn - Async function to execute
   * @returns {Promise} Result of the async function
   */
  const withLoading = useCallback(async (asyncFn) => {
    try {
      startLoading();
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useLoading;
