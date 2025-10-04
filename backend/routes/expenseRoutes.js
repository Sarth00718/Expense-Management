import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  submitExpense,
  deleteExpense,
  getExpenseHistory,
  uploadReceipt,
  getReceipt
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload, { handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route - Serve uploaded receipts (no auth required for viewing)
router.get('/receipts/:filename', getReceipt);

// All other routes require authentication
router.use(protect);

// File upload route (requires auth)
router.post('/upload-receipt', upload.single('receipt'), handleUploadError, uploadReceipt);

// Expense routes (all require auth)
router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/history', getExpenseHistory);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.post('/:id/submit', submitExpense);
router.delete('/:id', deleteExpense);

export default router;
