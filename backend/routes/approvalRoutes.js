import express from 'express';
import {
  getPendingApprovals,
  approveExpense,
  rejectExpense,
  overrideApproval,
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule
} from '../controllers/approvalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Approval action routes
router.get('/pending', getPendingApprovals);
router.post('/:expenseId/approve', approveExpense);
router.post('/:expenseId/reject', rejectExpense);
router.post('/:expenseId/override', overrideApproval);

// Approval rules routes (Admin only)
router.get('/rules', getApprovalRules);
router.post('/rules', createApprovalRule);
router.put('/rules/:id', updateApprovalRule);
router.delete('/rules/:id', deleteApprovalRule);

export default router;
