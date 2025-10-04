import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to prevent duplicate form submissions
 * @returns {Object} { isSubmitting, submitOnce }
 */
const useSubmitOnce = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);

  /**
   * Execute function only once, preventing duplicate submissions
   * @param {Function} submitFn - Async function to execute
   * @param {number} cooldown - Cooldown period in ms (default: 2000)
   */
  const submitOnce = useCallback(async (submitFn, cooldown = 2000) => {
    if (isSubmitting) {
      console.warn('Submission already in progress');
      return null;
    }

    try {
      setIsSubmitting(true);
      const result = await submitFn();
      
      // Set cooldown period to prevent rapid resubmission
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
      }, cooldown);
      
      return result;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  }, [isSubmitting]);

  /**
   * Reset submission state (useful for error recovery)
   */
  const reset = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submitOnce,
    reset
  };
};

export default useSubmitOnce;
