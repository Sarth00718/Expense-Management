// Server-side validation utilities
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }
};

/**
 * Validate expense data
 */
export const validateExpenseData = (data) => {
  const errors = [];
  
  // Amount validation
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  // Category validation
  const validCategories = ['travel', 'food', 'office_supplies', 'entertainment', 'utilities', 'other'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('Invalid category');
  }
  
  // Description validation
  if (!data.description || data.description.trim().length < 3) {
    errors.push('Description must be at least 3 characters');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('Description must be at most 500 characters');
  }
  
  // Date validation
  if (!data.date) {
    errors.push('Date is required');
  } else {
    const expenseDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (isNaN(expenseDate.getTime())) {
      errors.push('Invalid date format');
    } else if (expenseDate > today) {
      errors.push('Date cannot be in the future');
    }
  }
  
  // Currency validation
  if (!data.currency || data.currency.length !== 3) {
    errors.push('Invalid currency code');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR');
  }
};

/**
 * Validate user data
 */
export const validateUserData = (data, isUpdate = false) => {
  const errors = [];
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Password validation (only for creation or if provided in update)
  if (!isUpdate && (!data.password || data.password.length < 6)) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (isUpdate && data.password && data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  // Name validation
  if (data.firstName && (data.firstName.trim().length < 2 || data.firstName.length > 50)) {
    errors.push('First name must be between 2 and 50 characters');
  }
  
  if (data.lastName && (data.lastName.trim().length < 2 || data.lastName.length > 50)) {
    errors.push('Last name must be between 2 and 50 characters');
  }
  
  // Role validation
  const validRoles = ['employee', 'manager', 'admin'];
  if (data.role && !validRoles.includes(data.role)) {
    errors.push('Invalid role');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR');
  }
};

/**
 * Validate approval rule data
 */
export const validateApprovalRuleData = (data) => {
  const errors = [];
  
  // Name validation
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Rule name must be at least 3 characters');
  }
  
  // Type validation
  const validTypes = ['percentage', 'specific_approver', 'hybrid'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.push('Invalid rule type');
  }
  
  // Conditions validation based on type
  if (data.type === 'percentage' && (!data.conditions?.percentageThreshold || 
      data.conditions.percentageThreshold < 1 || data.conditions.percentageThreshold > 100)) {
    errors.push('Percentage threshold must be between 1 and 100');
  }
  
  if (data.type === 'specific_approver' && !data.conditions?.specificApproverId) {
    errors.push('Specific approver ID is required for this rule type');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400, 'VALIDATION_ERROR');
  }
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate ObjectId format
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
