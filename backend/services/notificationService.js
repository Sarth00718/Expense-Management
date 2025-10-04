import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

let io;

// Initialize Socket.io instance
export const initializeSocketIO = (socketIO) => {
  io = socketIO;

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.userRole = user.role;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

// Emit notification to specific user
export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
};

// Emit notification to multiple users
export const emitToUsers = (userIds, event, data) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }

  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });
};

// Emit notification to all users in a company
export const emitToCompany = (companyId, event, data) => {
  if (!io) {
    console.error('Socket.io not initialized');
    return;
  }

  io.to(`company:${companyId}`).emit(event, data);
};

// Notification event types
export const NOTIFICATION_EVENTS = {
  EXPENSE_SUBMITTED: 'expense:submitted',
  EXPENSE_APPROVED: 'expense:approved',
  EXPENSE_REJECTED: 'expense:rejected',
  APPROVAL_REQUIRED: 'approval:required',
  EXPENSE_UPDATED: 'expense:updated'
};

export default {
  initializeSocketIO,
  emitToUser,
  emitToUsers,
  emitToCompany,
  NOTIFICATION_EVENTS
};
