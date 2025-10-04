import { useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationToast = () => {
  const { notifications } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState([]);

  useEffect(() => {
    // Show only the latest notification as a toast
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Check if this notification is already visible
      if (!visibleToasts.some(t => t.id === latestNotification.id)) {
        setVisibleToasts(prev => [...prev, latestNotification]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(t => t.id !== latestNotification.id));
        }, 5000);

        // Play notification sound (optional)
        playNotificationSound();
      }
    }
  }, [notifications]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const dismissToast = (id) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'expense_approved':
        return 'from-green-500 to-emerald-600';
      case 'expense_rejected':
        return 'from-red-500 to-pink-600';
      case 'approval_required':
      case 'expense_submitted':
        return 'from-cyan-500 to-blue-600';
      default:
        return 'from-purple-500 to-indigo-600';
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'expense_approved':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'expense_rejected':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'approval_required':
      case 'expense_submitted':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-gradient-to-r ${getToastColor(toast.type)} rounded-lg shadow-2xl p-4 max-w-sm animate-slide-in-right`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
