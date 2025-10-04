import { useState, useCallback } from 'react';
import { hasErrors } from '../utils/validators';

/**
 * Custom hook for form validation
 * @param {Function} validateFn - Validation function that returns errors object
 * @returns {Object} Validation state and methods
 */
const useFormValidation = (validateFn) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData) => {
    const validationErrors = validateFn(formData);
    setErrors(validationErrors);
    return !hasErrors(validationErrors);
  }, [validateFn]);

  /**
   * Validate single field
   */
  const validateField = useCallback((fieldName, value, formData) => {
    const allErrors = validateFn({ ...formData, [fieldName]: value });
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: allErrors[fieldName] || null
    }));
    
    return !allErrors[fieldName];
  }, [validateFn]);

  /**
   * Mark field as touched
   */
  const touchField = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((fieldName, value, formData) => {
    touchField(fieldName);
    validateField(fieldName, value, formData);
  }, [touchField, validateField]);

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  /**
   * Get error for field (only if touched)
   */
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [errors, touched]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && !!errors[fieldName];
  }, [errors, touched]);

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((value) => {
    setIsSubmitting(value);
  }, []);

  return {
    errors,
    touched,
    isSubmitting,
    validateForm,
    validateField,
    touchField,
    handleBlur,
    resetValidation,
    getFieldError,
    hasFieldError,
    setSubmitting,
    hasErrors: hasErrors(errors)
  };
};

export default useFormValidation;
