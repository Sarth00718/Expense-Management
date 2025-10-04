import { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose }) => {
  const { notifications: liveNotifications, markAsRead: markLocalAsRead, markAllAsRead: markAllLocalAsRead } = useNotifications();
  const [persistedNotifications, setPersistedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch persisted notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications({ limit: 20 });
        setPersistedNotifications(response.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Combine live and persisted notifications
  const allNotifications = [
    ...liveNotifications,
    ...persistedNotifications.filter(
      pn => !liveNotifications.some(ln => ln.expenseId === pn.expenseId?._id)
    )
  ].slice(0, 20);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      if (notification.id) {
        // Live notification
        markLocalAsRead(notification.id);
      } else if (notification._id) {
        // Persisted notification
        try {
          await markAsRead(notification._id);
          setPersistedNotifications(prev =>
            prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
          );
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    }

    // Navigate to expense details
    const expenseId = notification.expenseId?._id || notification.data?.expenseId;
    if (expenseId) {
      navigate(`/expenses/${expenseId}`);
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      markAllLocalAsRead();
      setPersistedNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense_approved':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'expense_rejected':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'approval_required':
      case 'expense_submitted':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/30 overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {allNotifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-500/10">
            {allNotifications.map((notification, index) => {
              const isRead = notification.isRead;
              const timestamp = notification.timestamp || notification.createdAt;
              
              return (
                <div
                  key={notification.id || notification._id || index}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-cyan-500/10 cursor-pointer transition-colors duration-200 ${
                    !isRead ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(timestamp)}
                      </p>
                    </div>
                    {!isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {allNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-cyan-500/30 text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
