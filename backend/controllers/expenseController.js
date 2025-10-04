import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { emitToUser, NOTIFICATION_EVENTS } from '../services/notificationService.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import { validateExpenseData, validateRequiredFields } from '../utils/validators.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Create new expense
export const createExpense = asyncHandler(async (req, res) => {
  const {
    amount,
    currency,
    convertedAmount,
    category,
    description,
    date,
    receiptUrl,
    ocrData,
    status
  } = req.body;

  // Validate required fields
  validateRequiredFields(req.body, ['amount', 'currency', 'convertedAmount', 'category', 'description', 'date']);

  // Validate expense data
  validateExpenseData(req.body);

  // Create expense
  const expense = new Expense({
    employeeId: req.user._id,
    companyId: req.user.companyId,
    amount,
    currency,
    convertedAmount,
    category,
    description,
    date,
    receiptUrl: receiptUrl || null,
    ocrData: ocrData || {},
    status: status || 'draft'
  });

  // If status is 'pending', set currentApproverId to employee's manager
  if (expense.status === 'pending') {
    if (req.user.managerId) {
      expense.currentApproverId = req.user.managerId;
    } else {
      // If no manager, find an admin
      const admin = await User.findOne({
        companyId: req.user.companyId,
        role: 'admin',
        isActive: true
      });
      if (admin) {
        expense.currentApproverId = admin._id;
      }
    }
  }

  await expense.save();

  // Populate employee details
  await expense.populate('employeeId', 'firstName lastName email');

  // If expense is submitted (pending), notify the approver
  if (expense.status === 'pending' && expense.currentApproverId) {
    const message = `Expense approval required from ${req.user.firstName} ${req.user.lastName} for ${expense.currency} ${expense.amount}`;

    await createNotification(
      expense.currentApproverId,
      'expense_submitted',
      expense._id,
      message,
      { employeeName: `${req.user.firstName} ${req.user.lastName}` }
    );

    emitToUser(expense.currentApproverId.toString(), NOTIFICATION_EVENTS.EXPENSE_SUBMITTED, {
      expenseId: expense._id,
      message,
      employeeName: `${req.user.firstName} ${req.user.lastName}`,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category
    });
  }

  res.status(201).json({
    success: true,
    data: expense
  });
});

// Get expenses with role-based filtering
export const getExpenses = async (req, res, next) => {
  try {
    const { status, category, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

    let query = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees see only their own expenses
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers see their team's expenses and their own
      const teamMembers = await User.find({
        managerId: req.user._id,
        companyId: req.user.companyId,
        isActive: true
      }).select('_id');

      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: [...teamMemberIds, req.user._id] };
    }
    // Admins see all expenses (no additional filter needed)

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const expenses = await Expense.find(query)
      .populate('employeeId', 'firstName lastName email')
      .populate('currentApproverId', 'firstName lastName email')
      .sort(sortOptions);

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single expense by ID
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .populate('employeeId', 'firstName lastName email')
      .populate('currentApproverId', 'firstName lastName email')
      .populate('approvalHistory.approverId', 'firstName lastName email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check access permissions
    const isOwner = expense.employeeId._id.toString() === req.user._id.toString();
    const isApprover = expense.currentApproverId &&
      expense.currentApproverId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';

    if (!isOwner && !isApprover && !isAdmin && !isManager) {
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
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Update expense (draft only)
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      amount,
      currency,
      convertedAmount,
      category,
      description,
      date,
      receiptUrl,
      ocrData,
      status
    } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check if user is the owner
    if (expense.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only edit your own expenses'
        }
      });
    }

    // Only allow editing drafts
    if (expense.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only draft expenses can be edited'
        }
      });
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount;
    if (currency !== undefined) expense.currency = currency;
    if (convertedAmount !== undefined) expense.convertedAmount = convertedAmount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (ocrData !== undefined) expense.ocrData = ocrData;

    // Handle status change from draft to pending (submit for approval)
    if (status === 'pending' && expense.status === 'draft') {
      expense.status = 'pending';
      
      // Set currentApproverId to employee's manager
      if (req.user.managerId) {
        expense.currentApproverId = req.user.managerId;
      } else {
        // If no manager, find an admin
        const admin = await User.findOne({
          companyId: req.user.companyId,
          role: 'admin',
          isActive: true
        });
        if (admin) {
          expense.currentApproverId = admin._id;
        }
      }
      
      // Send notification to approver
      if (expense.currentApproverId) {
        const message = `Expense approval required from ${req.user.firstName} ${req.user.lastName} for ${expense.currency} ${expense.amount}`;

        await createNotification(
          expense.currentApproverId,
          'expense_submitted',
          expense._id,
          message,
          { employeeName: `${req.user.firstName} ${req.user.lastName}` }
        );

        emitToUser(expense.currentApproverId.toString(), NOTIFICATION_EVENTS.EXPENSE_SUBMITTED, {
          expenseId: expense._id,
          message,
          employeeName: `${req.user.firstName} ${req.user.lastName}`,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category
        });
      }
    }

    await expense.save();

    await expense.populate('employeeId', 'firstName lastName email');
    await expense.populate('currentApproverId', 'firstName lastName email');

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Submit expense for approval (convert draft to pending)
export const submitExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findById(id);

  if (!expense) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  // Check if user is the owner
  if (expense.employeeId.toString() !== req.user._id.toString()) {
    throw new AppError('You can only submit your own expenses', 403, 'FORBIDDEN');
  }

  // Only allow submitting drafts
  if (expense.status !== 'draft') {
    throw new AppError('Only draft expenses can be submitted', 400, 'INVALID_STATUS');
  }

  // Change status to pending
  expense.status = 'pending';

  // Set currentApproverId to employee's manager
  if (req.user.managerId) {
    expense.currentApproverId = req.user.managerId;
  } else {
    // If no manager, find an admin
    const admin = await User.findOne({
      companyId: req.user.companyId,
      role: 'admin',
      isActive: true
    });
    if (admin) {
      expense.currentApproverId = admin._id;
    }
  }

  await expense.save();

  // Populate for response
  await expense.populate('employeeId', 'firstName lastName email');
  await expense.populate('currentApproverId', 'firstName lastName email');

  // Send notification to approver
  if (expense.currentApproverId) {
    const message = `Expense approval required from ${req.user.firstName} ${req.user.lastName} for ${expense.currency} ${expense.amount}`;

    await createNotification(
      expense.currentApproverId,
      'expense_submitted',
      expense._id,
      message,
      { employeeName: `${req.user.firstName} ${req.user.lastName}` }
    );

    emitToUser(expense.currentApproverId.toString(), NOTIFICATION_EVENTS.EXPENSE_SUBMITTED, {
      expenseId: expense._id,
      message,
      employeeName: `${req.user.firstName} ${req.user.lastName}`,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category
    });
  }

  res.json({
    success: true,
    data: expense,
    message: 'Expense submitted for approval'
  });
});

// Delete expense (draft only)
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check if user is the owner
    if (expense.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own expenses'
        }
      });
    }

    // Only allow deleting drafts
    if (expense.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only draft expenses can be deleted'
        }
      });
    }

    await Expense.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get expense history with filtering and sorting
export const getExpenseHistory = async (req, res, next) => {
  try {
    const {
      status,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    let query = {
      employeeId: req.user._id,
      companyId: req.user.companyId
    };

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('employeeId', 'firstName lastName email')
        .populate('currentApproverId', 'firstName lastName email')
        .populate('approvalHistory.approverId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload receipt
export const uploadReceipt = async (req, res, next) => {
  try {
    console.log('Receipt upload request received');
    console.log('User:', req.user?.email);
    console.log('File:', req.file ? req.file.originalname : 'No file');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded. Please select a file to upload.'
        }
      });
    }

    // Return the file information
    const fileUrl = `/api/expenses/receipts/${req.file.filename}`;
    
    console.log('File uploaded successfully:', fileUrl);

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// Serve uploaded receipt
export const getReceipt = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    console.log('Receipt request for:', filename);

    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('Invalid filename detected:', filename);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILENAME',
          message: 'Invalid filename'
        }
      });
    }

    const filePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      process.env.UPLOAD_DIR || 'uploads/receipts',
      filename
    );
    
    console.log('Looking for file at:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Receipt not found'
        }
      });
    }

    console.log('Serving file:', filePath);
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving receipt:', error);
    next(error);
  }
};
