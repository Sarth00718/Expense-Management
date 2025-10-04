// Form validation utilities

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate number field
 */
export const validateNumber = (value, fieldName = 'This field', min = null, max = null) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== null && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== null && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return null;
};

/**
 * Validate amount (positive number with max 2 decimals)
 */
export const validateAmount = (amount) => {
  const error = validateNumber(amount, 'Amount', 0.01);
  if (error) return error;
  
  const num = Number(amount);
  if (num <= 0) {
    return 'Amount must be greater than 0';
  }
  
  // Check for max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return 'Amount can have at most 2 decimal places';
  }
  
  return null;
};

/**
 * Validate date (not in future)
 */
export const validateDate = (date, allowFuture = false) => {
  if (!date) {
    return 'Date is required';
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (isNaN(selectedDate.getTime())) {
    return 'Please enter a valid date';
  }
  
  if (!allowFuture && selectedDate > today) {
    return 'Date cannot be in the future';
  }
  
  return null;
};

/**
 * Validate text length
 */
export const validateLength = (value, fieldName, min = 0, max = null) => {
  if (!value) {
    return `${fieldName} is required`;
  }
  
  const length = value.trim().length;
  
  if (length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  
  if (max && length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  
  return null;
};

/**
 * Validate expense form
 */
export const validateExpenseForm = (formData) => {
  const errors = {};
  
  // Amount validation
  const amountError = validateAmount(formData.amount);
  if (amountError) errors.amount = amountError;
  
  // Category validation
  if (!formData.category) {
    errors.category = 'Category is required';
  }
  
  // Description validation
  const descError = validateLength(formData.description, 'Description', 3, 500);
  if (descError) errors.description = descError;
  
  // Date validation
  const dateError = validateDate(formData.date);
  if (dateError) errors.date = dateError;
  
  // Currency validation
  if (!formData.currency) {
    errors.currency = 'Currency is required';
  }
  
  return errors;
};

/**
 * Validate user form
 */
export const validateUserForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  // First name validation
  const firstNameError = validateLength(formData.firstName, 'First name', 2, 50);
  if (firstNameError) errors.firstName = firstNameError;
  
  // Last name validation
  const lastNameError = validateLength(formData.lastName, 'Last name', 2, 50);
  if (lastNameError) errors.lastName = lastNameError;
  
  // Password validation (only if provided)
  if (formData.password) {
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
  }
  
  // Role validation
  if (!formData.role) {
    errors.role = 'Role is required';
  }
  
  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

/**
 * Validate signup form
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const firstNameError = validateLength(formData.firstName, 'First name', 2, 50);
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateLength(formData.lastName, 'Last name', 2, 50);
  if (lastNameError) errors.lastName = lastNameError;
  
  const companyError = validateLength(formData.companyName, 'Company name', 2, 100);
  if (companyError) errors.companyName = companyError;
  
  return errors;
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};
