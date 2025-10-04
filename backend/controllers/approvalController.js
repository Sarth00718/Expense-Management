import Expense from '../models/Expense.js';
import ApprovalRule from '../models/ApprovalRule.js';
import Company from '../models/Company.js';
import { processApproval, adminOverride } from '../services/approvalEngine.js';

// Get pending approvals for current user
export const getPendingApprovals = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      companyId: req.user.companyId,
      currentApproverId: req.user._id,
      status: 'pending'
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('approvalHistory.approverId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    next(error);
  }
};

// Approve expense
export const approveExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { comment = '' } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check if expense is pending
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Expense is not pending approval'
        }
      });
    }

    // Check if user is the current approver
    if (!expense.currentApproverId || expense.currentApproverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to approve this expense'
        }
      });
    }

    // Get company for approval routing
    const company = await Company.findById(expense.companyId);

    // Process approval
    const result = await processApproval(expense, req.user._id, 'approved', comment, company);

    // Populate for response
    await result.expense.populate('employeeId', 'firstName lastName email');
    await result.expense.populate('currentApproverId', 'firstName lastName email');
    await result.expense.populate('approvalHistory.approverId', 'firstName lastName email');

    res.json({
      success: true,
      data: result.expense,
      message: result.message,
      finalStatus: result.finalStatus,
      autoApproved: result.autoApproved || false,
      ruleApplied: result.ruleApplied || null,
      nextApproverId: result.nextApproverId || null
    });
  } catch (error) {
    next(error);
  }
};

// Reject expense
export const rejectExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { comment = '' } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Comment is required when rejecting an expense'
        }
      });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check if expense is pending
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Expense is not pending approval'
        }
      });
    }

    // Check if user is the current approver
    if (!expense.currentApproverId || expense.currentApproverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to reject this expense'
        }
      });
    }

    // Get company for approval routing
    const company = await Company.findById(expense.companyId);

    // Process rejection
    const result = await processApproval(expense, req.user._id, 'rejected', comment, company);

    // Populate for response
    await result.expense.populate('employeeId', 'firstName lastName email');
    await result.expense.populate('approvalHistory.approverId', 'firstName lastName email');

    res.json({
      success: true,
      data: result.expense,
      message: result.message,
      finalStatus: result.finalStatus
    });
  } catch (error) {
    next(error);
  }
};

// Admin override approval
export const overrideApproval = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { comment = '' } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can override approvals'
        }
      });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Expense not found'
        }
      });
    }

    // Check if expense is in a state that can be overridden
    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Expense is already approved'
        }
      });
    }

    // Process admin override
    const result = await adminOverride(expense, req.user._id, comment);

    // Populate for response
    await result.expense.populate('employeeId', 'firstName lastName email');
    await result.expense.populate('approvalHistory.approverId', 'firstName lastName email');

    res.json({
      success: true,
      data: result.expense,
      message: result.message,
      finalStatus: result.finalStatus
    });
  } catch (error) {
    next(error);
  }
};

// Get approval rules (Admin only)
export const getApprovalRules = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can view approval rules'
        }
      });
    }

    const rules = await ApprovalRule.find({ companyId: req.user.companyId })
      .populate('conditions.specificApproverId', 'firstName lastName email')
      .populate('conditions.approvalSequence', 'firstName lastName email')
      .sort({ priority: -1 });

    res.json({
      success: true,
      data: rules,
      count: rules.length
    });
  } catch (error) {
    next(error);
  }
};

// Create approval rule (Admin only)
export const createApprovalRule = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can create approval rules'
        }
      });
    }

    const { name, type, conditions, isActive, priority } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and type are required'
        }
      });
    }

    // Validate type
    if (!['percentage', 'specific_approver', 'hybrid'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid rule type'
        }
      });
    }

    // Validate conditions based on type
    if (type === 'percentage' || type === 'hybrid') {
      if (!conditions?.percentageThreshold || conditions.percentageThreshold <= 0 || conditions.percentageThreshold > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid percentage threshold (1-100) is required for percentage-based rules'
          }
        });
      }
    }

    if (type === 'specific_approver' || type === 'hybrid') {
      if (!conditions?.specificApproverId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Specific approver ID is required for specific approver rules'
          }
        });
      }
    }

    const rule = new ApprovalRule({
      companyId: req.user.companyId,
      name,
      type,
      conditions: conditions || {},
      isActive: isActive !== undefined ? isActive : true,
      priority: priority !== undefined ? priority : 0
    });

    await rule.save();

    await rule.populate('conditions.specificApproverId', 'firstName lastName email');
    await rule.populate('conditions.approvalSequence', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// Update approval rule (Admin only)
export const updateApprovalRule = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can update approval rules'
        }
      });
    }

    const { id } = req.params;
    const { name, type, conditions, isActive, priority } = req.body;

    const rule = await ApprovalRule.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Approval rule not found'
        }
      });
    }

    // Check if rule belongs to user's company
    if (rule.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    // Update fields
    if (name !== undefined) rule.name = name;
    if (type !== undefined) {
      if (!['percentage', 'specific_approver', 'hybrid'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid rule type'
          }
        });
      }
      rule.type = type;
    }
    if (conditions !== undefined) rule.conditions = conditions;
    if (isActive !== undefined) rule.isActive = isActive;
    if (priority !== undefined) rule.priority = priority;

    await rule.save();

    await rule.populate('conditions.specificApproverId', 'firstName lastName email');
    await rule.populate('conditions.approvalSequence', 'firstName lastName email');

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// Delete approval rule (Admin only)
export const deleteApprovalRule = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can delete approval rules'
        }
      });
    }

    const { id } = req.params;

    const rule = await ApprovalRule.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Approval rule not found'
        }
      });
    }

    // Check if rule belongs to user's company
    if (rule.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    await ApprovalRule.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Approval rule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
