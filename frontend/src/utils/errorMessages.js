// User-friendly error messages mapping

export const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'Please log in to continue',
  INVALID_TOKEN: 'Your session has expired. Please log in again',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  INVALID_CREDENTIALS: 'Invalid email or password',
  
  // Authorization errors
  FORBIDDEN: 'You do not have permission to perform this action',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again',
  DUPLICATE_FIELD: 'This value already exists',
  REQUIRED_FIELD: 'This field is required',
  
  // Resource errors
  NOT_FOUND: 'The requested resource was not found',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later',
  
  // Default
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again'
};

/**
 * Get user-friendly error message
 * @param {string} errorCode - Error code from API
 * @param {string} fallbackMessage - Optional fallback message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (errorCode, fallbackMessage = null) => {
  return ERROR_MESSAGES[errorCode] || fallbackMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Format API error for display
 * @param {Object} error - Error object from API
 * @returns {string} Formatted error message
 */
export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.code) {
    return getErrorMessage(error.code);
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};
