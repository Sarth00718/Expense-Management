import api from './api';

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data
 * @returns {Promise<Object>} Created expense
 */
export const createExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

/**
 * Get all expenses with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} Array of expenses
 */
export const getExpenses = async (filters = {}) => {
  try {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Get expense by ID
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Expense details
 */
export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

/**
 * Update an expense (draft only)
 * @param {string} id - Expense ID
 * @param {Object} expenseData - Updated expense data
 * @returns {Promise<Object>} Updated expense
 */
export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense (draft only)
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Success message
 */
export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Get expense history with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Expenses with pagination
 */
export const getExpenseHistory = async (filters = {}) => {
  try {
    const response = await api.get('/expenses/history', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching expense history:', error);
    throw error;
  }
};

/**
 * Upload receipt image
 * @param {File} file - Receipt image file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result with file URL
 */
export const uploadReceipt = async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await api.post('/expenses/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

export default {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseHistory,
  uploadReceipt
};
