import { createContext, useContext, useEffect, useState } from 'react';
import socketService, { NOTIFICATION_EVENTS } from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connect to Socket.io when user is authenticated
  useEffect(() => {
    if (user && token) {
      socketService.connect(token);

      // Set up event listeners
      const handleExpenseSubmitted = (data) => {
        addNotification({
          type: 'expense_submitted',
          message: `New expense submitted by ${data.employeeName}`,
          data,
          timestamp: new Date()
        });
      };

      const handleExpenseApproved = (data) => {
        addNotification({
          type: 'expense_approved',
          message: `Your expense has been approved`,
          data,
          timestamp: new Date()
        });
      };

      const handleExpenseRejected = (data) => {
        addNotification({
          type: 'expense_rejected',
          message: `Your expense has been rejected`,
          data,
          timestamp: new Date()
        });
      };

      const handleApprovalRequired = (data) => {
        addNotification({
          type: 'approval_required',
          message: `Expense approval required from ${data.employeeName}`,
          data,
          timestamp: new Date()
        });
      };

      const handleExpenseUpdated = (data) => {
        addNotification({
          type: 'expense_updated',
          message: `Expense has been updated`,
          data,
          timestamp: new Date()
        });
      };

      // Subscribe to events
      socketService.on(NOTIFICATION_EVENTS.EXPENSE_SUBMITTED, handleExpenseSubmitted);
      socketService.on(NOTIFICATION_EVENTS.EXPENSE_APPROVED, handleExpenseApproved);
      socketService.on(NOTIFICATION_EVENTS.EXPENSE_REJECTED, handleExpenseRejected);
      socketService.on(NOTIFICATION_EVENTS.APPROVAL_REQUIRED, handleApprovalRequired);
      socketService.on(NOTIFICATION_EVENTS.EXPENSE_UPDATED, handleExpenseUpdated);

      // Cleanup on unmount
      return () => {
        socketService.off(NOTIFICATION_EVENTS.EXPENSE_SUBMITTED, handleExpenseSubmitted);
        socketService.off(NOTIFICATION_EVENTS.EXPENSE_APPROVED, handleExpenseApproved);
        socketService.off(NOTIFICATION_EVENTS.EXPENSE_REJECTED, handleExpenseRejected);
        socketService.off(NOTIFICATION_EVENTS.APPROVAL_REQUIRED, handleApprovalRequired);
        socketService.off(NOTIFICATION_EVENTS.EXPENSE_UPDATED, handleExpenseUpdated);
        socketService.disconnect();
      };
    }
  }, [user, token]);

  // Add notification to state
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      isRead: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    isConnected: socketService.isConnected()
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
