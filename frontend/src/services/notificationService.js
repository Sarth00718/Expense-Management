import api from './api';

// Get all notifications
export const getNotifications = async (params = {}) => {
  const { limit = 50, skip = 0, unreadOnly = false } = params;
  const response = await api.get('/notifications', {
    params: { limit, skip, unreadOnly }
  });
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
