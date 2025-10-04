import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/config.js';
import connectDB from './config/database.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize notification service with Socket.io
import { initializeSocketIO } from './services/notificationService.js';
initializeSocketIO(io);

// Make io accessible to routes
app.set('io', io);

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import currencyRoutes from './routes/currencyRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Exe$Man API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io connection handling is now managed by notificationService

// Import error handling middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

export { io };
