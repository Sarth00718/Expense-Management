import express from 'express';
import {
  getDashboardStats,
  getExpensesByCategory,
  getExpensesByMonth,
  getApprovalStats,
  exportReport
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/analytics/expenses-by-category - Get expenses grouped by category
router.get('/expenses-by-category', getExpensesByCategory);

// GET /api/analytics/expenses-by-month - Get expenses grouped by month
router.get('/expenses-by-month', getExpensesByMonth);

// GET /api/analytics/approval-stats - Get approval statistics
router.get('/approval-stats', getApprovalStats);

// GET /api/analytics/export - Export report in PDF or Excel format
router.get('/export', exportReport);

export default router;
