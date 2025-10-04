import api from './api';

// Get pending approvals for current user
export const getPendingApprovals = async () => {
  const response = await api.get('/approvals/pending');
  return response.data;
};

// Approve an expense
export const approveExpense = async (expenseId, comment = '') => {
  const response = await api.post(`/approvals/${expenseId}/approve`, { comment });
  return response.data;
};

// Reject an expense
export const rejectExpense = async (expenseId, comment) => {
  const response = await api.post(`/approvals/${expenseId}/reject`, { comment });
  return response.data;
};

// Admin override approval
export const overrideApproval = async (expenseId, comment = '') => {
  const response = await api.post(`/approvals/${expenseId}/override`, { comment });
  return response.data;
};

// Get approval rules (Admin only)
export const getApprovalRules = async () => {
  const response = await api.get('/approvals/rules');
  return response.data;
};

// Create approval rule (Admin only)
export const createApprovalRule = async (ruleData) => {
  const response = await api.post('/approvals/rules', ruleData);
  return response.data;
};

// Update approval rule (Admin only)
export const updateApprovalRule = async (ruleId, ruleData) => {
  const response = await api.put(`/approvals/rules/${ruleId}`, ruleData);
  return response.data;
};

// Delete approval rule (Admin only)
export const deleteApprovalRule = async (ruleId) => {
  const response = await api.delete(`/approvals/rules/${ruleId}`);
  return response.data;
};
