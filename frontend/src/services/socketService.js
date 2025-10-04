import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to Socket.io server with authentication
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });
  }

  // Disconnect from Socket.io server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event, callback);

    // Remove from listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Notification event types (matching backend)
export const NOTIFICATION_EVENTS = {
  EXPENSE_SUBMITTED: 'expense:submitted',
  EXPENSE_APPROVED: 'expense:approved',
  EXPENSE_REJECTED: 'expense:rejected',
  APPROVAL_REQUIRED: 'approval:required',
  EXPENSE_UPDATED: 'expense:updated'
};

export default socketService;
