import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, canManageUser } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users - Admin and Manager can access
router.get('/', authorize('admin', 'manager'), getUsers);

// Create new user - Admin only
router.post('/', authorize('admin'), createUser);

// Get user by ID - All authenticated users
router.get('/:id', getUserById);

// Update user details - Admin or Manager (for their reports)
router.put('/:id', authorize('admin', 'manager'), canManageUser, updateUser);

// Update user role - Admin only
router.put('/:id/role', authorize('admin'), updateUserRole);

// Delete user - Admin only
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
