import User from '../models/User.js';
import Expense from '../models/Expense.js';

// @desc    Get all users with role-based filtering
// @route   GET /api/users
// @access  Private (Admin, Manager)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, managerId } = req.query;
    const currentUser = req.user;

    let query = { companyId: currentUser.companyId };

    // Role-based filtering
    if (currentUser.role === 'manager') {
      // Managers can only see their direct reports and themselves
      query.$or = [
        { managerId: currentUser._id },
        { _id: currentUser._id }
      ];
    }

    // Additional filters
    if (role) {
      query.role = role;
    }

    if (managerId) {
      query.managerId = managerId;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('managerId', 'firstName lastName email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('managerId', 'firstName lastName email role')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check if user has permission to view this user
    if (req.user.role === 'employee' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, managerId } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide all required fields: email, password, firstName, lastName'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'User with this email already exists'
        }
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Manager not found'
          }
        });
      }

      if (manager.role === 'employee') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Manager must have manager or admin role'
          }
        });
      }

      if (manager.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Manager must be from the same company'
          }
        });
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      companyId: req.user.companyId,
      managerId: managerId || null
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin, Manager for their reports)
export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, managerId, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check company match
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot update user from different company'
        }
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Manager not found'
          }
        });
      }

      if (manager.role === 'employee') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Manager must have manager or admin role'
          }
        });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (managerId !== undefined) user.managerId = managerId;
    if (isActive !== undefined && req.user.role === 'admin') {
      user.isActive = isActive;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('managerId', 'firstName lastName email')
      .select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['employee', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid role is required (employee, manager, or admin)'
        }
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check company match
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot update user from different company'
        }
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot change your own role'
        }
      });
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('managerId', 'firstName lastName email')
      .select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Check company match
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot delete user from different company'
        }
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot delete your own account'
        }
      });
    }

    // Handle approval reassignment for pending expenses
    const pendingExpenses = await Expense.find({
      currentApproverId: user._id,
      status: 'pending'
    });

    if (pendingExpenses.length > 0) {
      // Find a suitable replacement approver (another admin or manager)
      const replacementApprover = await User.findOne({
        companyId: user.companyId,
        role: { $in: ['admin', 'manager'] },
        _id: { $ne: user._id },
        isActive: true
      });

      if (replacementApprover) {
        // Reassign pending approvals
        await Expense.updateMany(
          { currentApproverId: user._id, status: 'pending' },
          { currentApproverId: replacementApprover._id }
        );
      } else {
        // If no replacement found, set to null (will need manual reassignment)
        await Expense.updateMany(
          { currentApproverId: user._id, status: 'pending' },
          { currentApproverId: null }
        );
      }
    }

    // Update users who have this user as manager
    await User.updateMany(
      { managerId: user._id },
      { managerId: null }
    );

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        reassignedExpenses: pendingExpenses.length
      }
    });
  } catch (error) {
    next(error);
  }
};
