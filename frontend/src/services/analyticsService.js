import api from './api';

// Get dashboard statistics
export const getDashboardStats = async (params = {}) => {
  const response = await api.get('/analytics/dashboard', { params });
  return response.data;
};

// Get expenses by category
export const getExpensesByCategory = async (params = {}) => {
  const response = await api.get('/analytics/expenses-by-category', { params });
  return response.data;
};

// Get expenses by month
export const getExpensesByMonth = async (params = {}) => {
  const response = await api.get('/analytics/expenses-by-month', { params });
  return response.data;
};

// Get approval statistics
export const getApprovalStats = async (params = {}) => {
  const response = await api.get('/analytics/approval-stats', { params });
  return response.data;
};

// Export report in PDF or Excel format
export const exportReport = async (format, filters = {}) => {
  const params = {
    format,
    ...filters
  };
  
  const response = await api.get('/analytics/export', {
    params,
    responseType: 'blob'
  });
  
  return response.data;
};
