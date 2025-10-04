import api from './api';

// Get all users with optional filters
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.role) params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  if (filters.managerId) params.append('managerId', filters.managerId);
  
  const queryString = params.toString();
  const url = queryString ? `/users?${queryString}` : '/users';
  
  return await api.get(url);
};

// Get single user by ID
export const getUserById = async (id) => {
  return await api.get(`/users/${id}`);
};

// Create new user
export const createUser = async (userData) => {
  return await api.post('/users', userData);
};

// Update user details
export const updateUser = async (id, userData) => {
  return await api.put(`/users/${id}`, userData);
};

// Update user role
export const updateUserRole = async (id, role) => {
  return await api.put(`/users/${id}/role`, { role });
};

// Delete user
export const deleteUser = async (id) => {
  return await api.delete(`/users/${id}`);
};

// Default export for backward compatibility
const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
};

export default userService;
