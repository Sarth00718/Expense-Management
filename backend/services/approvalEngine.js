import ApprovalRule from '../models/ApprovalRule.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { createNotification } from '../controllers/notificationController.js';
import { emitToUser, NOTIFICATION_EVENTS } from './notificationService.js';

/**
 * Evaluate approval rules for an expense and determine if auto-approval applies
 * @param {Object} expense - The expense document
 * @param {string} approverId - The ID of the current approver
 * @returns {Promise<Object>} Result object with autoApprove flag and reason
 */
export const evaluateApprovalRules = async (expense, approverId) => {
  try {
    // Fetch active approval rules for the company, sorted by priority
    const rules = await ApprovalRule.find({
      companyId: expense.companyId,
      isActive: true
    }).sort({ priority: -1 });

    if (!rules || rules.length === 0) {
      return { autoApprove: false, reason: 'No active approval rules' };
    }

    // Evaluate each rule in priority order
    for (const rule of rules) {
      const result = await evaluateRule(rule, expense, approverId);
      if (result.autoApprove) {
        return result;
      }
    }

    return { autoApprove: false, reason: 'No matching approval rules' };
  } catch (error) {
    console.error('Error evaluating approval rules:', error);
    return { autoApprove: false, reason: 'Error evaluating rules', error: error.message };
  }
};

/**
 * Evaluate a single approval rule
 * @param {Object} rule - The approval rule
 * @param {Object} expense - The expense document
 * @param {string} approverId - The ID of the current approver
 * @returns {Promise<Object>} Result object with autoApprove flag and reason
 */
const evaluateRule = async (rule, expense, approverId) => {
  switch (rule.type) {
    case 'percentage':
      return await evaluatePercentageRule(rule, expense);
    
    case 'specific_approver':
      return await evaluateSpecificApproverRule(rule, expense, approverId);
    
    case 'hybrid':
      return await evaluateHybridRule(rule, expense, approverId);
    
    default:
      return { autoApprove: false, reason: `Unknown rule type: ${rule.type}` };
  }
};

/**
 * Evaluate percentage-based approval rule
 * @param {Object} rule - The approval rule
 * @param {Object} expense - The expense document
 * @returns {Promise<Object>} Result object
 */
const evaluatePercentageRule = async (rule, expense) => {
  try {
    const threshold = rule.conditions.percentageThreshold;
    
    if (!threshold || threshold <= 0) {
      return { autoApprove: false, reason: 'Invalid percentage threshold' };
    }

    // Count total approvals in history
    const approvalCount = expense.approvalHistory.filter(
      h => h.action === 'approved'
    ).length;

    // Get total required approvers (from sequence if defined, otherwise use manager chain)
    let totalApprovers = 1; // Default to at least 1 approver
    
    if (rule.conditions.approvalSequence && rule.conditions.approvalSequence.length > 0) {
      totalApprovers = rule.conditions.approvalSequence.length;
    }

    const approvalPercentage = (approvalCount / totalApprovers) * 100;

    if (approvalPercentage >= threshold) {
      return {
        autoApprove: true,
        reason: `Percentage threshold met: ${approvalPercentage.toFixed(1)}% >= ${threshold}%`,
        ruleId: rule._id,
        ruleName: rule.name
      };
    }

    return { autoApprove: false, reason: `Percentage threshold not met: ${approvalPercentage.toFixed(1)}% < ${threshold}%` };
  } catch (error) {
    console.error('Error evaluating percentage rule:', error);
    return { autoApprove: false, reason: 'Error evaluating percentage rule' };
  }
};

/**
 * Evaluate specific approver rule
 * @param {Object} rule - The approval rule
 * @param {Object} expense - The expense document
 * @param {string} approverId - The ID of the current approver
 * @returns {Promise<Object>} Result object
 */
const evaluateSpecificApproverRule = async (rule, expense, approverId) => {
  try {
    const specificApproverId = rule.conditions.specificApproverId;
    
    if (!specificApproverId) {
      return { autoApprove: false, reason: 'No specific approver defined' };
    }

    // Check if the current approver matches the specific approver
    if (approverId && approverId.toString() === specificApproverId.toString()) {
      return {
        autoApprove: true,
        reason: 'Approved by designated specific approver',
        ruleId: rule._id,
        ruleName: rule.name
      };
    }

    // Check if specific approver has already approved in history
    const specificApproverApproved = expense.approvalHistory.some(
      h => h.approverId.toString() === specificApproverId.toString() && h.action === 'approved'
    );

    if (specificApproverApproved) {
      return {
        autoApprove: true,
        reason: 'Previously approved by designated specific approver',
        ruleId: rule._id,
        ruleName: rule.name
      };
    }

    return { autoApprove: false, reason: 'Specific approver has not approved yet' };
  } catch (error) {
    console.error('Error evaluating specific approver rule:', error);
    return { autoApprove: false, reason: 'Error evaluating specific approver rule' };
  }
};

/**
 * Evaluate hybrid rule (combination of percentage and specific approver)
 * @param {Object} rule - The approval rule
 * @param {Object} expense - The expense document
 * @param {string} approverId - The ID of the current approver
 * @returns {Promise<Object>} Result object
 */
const evaluateHybridRule = async (rule, expense, approverId) => {
  try {
    // For hybrid rules, both conditions must be met
    const percentageResult = await evaluatePercentageRule(rule, expense);
    const specificApproverResult = await evaluateSpecificApproverRule(rule, expense, approverId);

    if (percentageResult.autoApprove && specificApproverResult.autoApprove) {
      return {
        autoApprove: true,
        reason: `Hybrid rule satisfied: ${percentageResult.reason} AND ${specificApproverResult.reason}`,
        ruleId: rule._id,
        ruleName: rule.name
      };
    }

    return {
      autoApprove: false,
      reason: `Hybrid rule not satisfied. Percentage: ${percentageResult.reason}, Specific Approver: ${specificApproverResult.reason}`
    };
  } catch (error) {
    console.error('Error evaluating hybrid rule:', error);
    return { autoApprove: false, reason: 'Error evaluating hybrid rule' };
  }
};

/**
 * Determine the next approver for an expense based on approval sequence or manager chain
 * @param {Object} expense - The expense document
 * @param {Object} company - The company document
 * @returns {Promise<string|null>} Next approver ID or null if no more approvers
 */
export const getNextApprover = async (expense, company) => {
  try {
    // Check if there are active approval rules with sequences
    const rules = await ApprovalRule.find({
      companyId: expense.companyId,
      isActive: true,
      'conditions.approvalSequence': { $exists: true, $ne: [] }
    }).sort({ priority: -1 });

    // If approval sequence exists, use it
    if (rules.length > 0) {
      const rule = rules[0]; // Use highest priority rule
      const sequence = rule.conditions.approvalSequence;
      
      // Find current position in sequence
      const approvedIds = expense.approvalHistory
        .filter(h => h.action === 'approved')
        .map(h => h.approverId.toString());
      
      // Find next approver in sequence who hasn't approved yet
      for (const approverId of sequence) {
        if (!approvedIds.includes(approverId.toString())) {
          return approverId;
        }
      }
      
      // All approvers in sequence have approved
      return null;
    }

    // Fallback to manager-based routing
    if (company.settings.requireManagerApproval) {
      const employee = await User.findById(expense.employeeId);
      
      if (employee && employee.managerId) {
        // Check if manager has already approved
        const managerApproved = expense.approvalHistory.some(
          h => h.approverId.toString() === employee.managerId.toString() && h.action === 'approved'
        );
        
        if (!managerApproved) {
          return employee.managerId;
        }
        
        // If manager approved, check if manager has a manager (escalation)
        const manager = await User.findById(employee.managerId);
        if (manager && manager.managerId) {
          const seniorManagerApproved = expense.approvalHistory.some(
            h => h.approverId.toString() === manager.managerId.toString() && h.action === 'approved'
          );
          
          if (!seniorManagerApproved) {
            return manager.managerId;
          }
        }
        
        // If manager approved but has no manager, escalate to admin (if enabled)
        if (managerApproved && (!manager || !manager.managerId) && company.settings.escalateToAdmin) {
          // Find an admin who hasn't approved yet
          const admins = await User.find({
            companyId: expense.companyId,
            role: 'admin',
            isActive: true
          });
          
          for (const admin of admins) {
            const adminApproved = expense.approvalHistory.some(
              h => h.approverId.toString() === admin._id.toString() && h.action === 'approved'
            );
            
            if (!adminApproved) {
              return admin._id;
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error determining next approver:', error);
    return null;
  }
};

/**
 * Process approval action and update expense status
 * @param {Object} expense - The expense document
 * @param {string} approverId - The ID of the approver
 * @param {string} action - The action ('approved' or 'rejected')
 * @param {string} comment - Optional comment
 * @param {Object} company - The company document
 * @returns {Promise<Object>} Updated expense and status information
 */
export const processApproval = async (expense, approverId, action, comment = '', company) => {
  try {
    // Add to approval history
    expense.approvalHistory.push({
      approverId,
      action,
      comment,
      timestamp: new Date()
    });

    if (action === 'rejected') {
      expense.status = 'rejected';
      expense.currentApproverId = null;
      await expense.save();
      
      // Create and emit notification to employee
      const approver = await User.findById(approverId);
      const message = `Your expense for ${expense.currency} ${expense.amount} has been rejected${comment ? ': ' + comment : ''}`;
      
      await createNotification(
        expense.employeeId,
        'expense_rejected',
        expense._id,
        message,
        { approverName: `${approver.firstName} ${approver.lastName}`, comment }
      );
      
      emitToUser(expense.employeeId.toString(), NOTIFICATION_EVENTS.EXPENSE_REJECTED, {
        expenseId: expense._id,
        message,
        approverName: `${approver.firstName} ${approver.lastName}`,
        comment
      });
      
      return {
        expense,
        finalStatus: 'rejected',
        message: 'Expense rejected'
      };
    }

    // For approval, check if auto-approval rules apply
    const ruleEvaluation = await evaluateApprovalRules(expense, approverId);
    
    if (ruleEvaluation.autoApprove) {
      expense.status = 'approved';
      expense.currentApproverId = null;
      await expense.save();
      
      // Create and emit notification to employee
      const message = `Your expense for ${expense.currency} ${expense.amount} has been approved`;
      
      await createNotification(
        expense.employeeId,
        'expense_approved',
        expense._id,
        message,
        { autoApproved: true, ruleApplied: ruleEvaluation.ruleName }
      );
      
      emitToUser(expense.employeeId.toString(), NOTIFICATION_EVENTS.EXPENSE_APPROVED, {
        expenseId: expense._id,
        message,
        autoApproved: true,
        ruleApplied: ruleEvaluation.ruleName
      });
      
      return {
        expense,
        finalStatus: 'approved',
        message: `Expense auto-approved: ${ruleEvaluation.reason}`,
        autoApproved: true,
        ruleApplied: ruleEvaluation.ruleName
      };
    }

    // Check for next approver
    const nextApproverId = await getNextApprover(expense, company);
    
    if (nextApproverId) {
      expense.currentApproverId = nextApproverId;
      expense.status = 'pending';
      await expense.save();
      
      // Create and emit notification to next approver
      const employee = await User.findById(expense.employeeId);
      const message = `Expense approval required from ${employee.firstName} ${employee.lastName} for ${expense.currency} ${expense.amount}`;
      
      await createNotification(
        nextApproverId,
        'approval_required',
        expense._id,
        message,
        { employeeName: `${employee.firstName} ${employee.lastName}` }
      );
      
      emitToUser(nextApproverId.toString(), NOTIFICATION_EVENTS.APPROVAL_REQUIRED, {
        expenseId: expense._id,
        message,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        amount: expense.amount,
        currency: expense.currency
      });
      
      return {
        expense,
        finalStatus: 'pending',
        message: 'Expense routed to next approver',
        nextApproverId
      };
    }

    // No more approvers, mark as approved
    expense.status = 'approved';
    expense.currentApproverId = null;
    await expense.save();
    
    // Create and emit notification to employee
    const message = `Your expense for ${expense.currency} ${expense.amount} has been approved`;
    
    await createNotification(
      expense.employeeId,
      'expense_approved',
      expense._id,
      message,
      { finalApproval: true }
    );
    
    emitToUser(expense.employeeId.toString(), NOTIFICATION_EVENTS.EXPENSE_APPROVED, {
      expenseId: expense._id,
      message,
      finalApproval: true
    });
    
    return {
      expense,
      finalStatus: 'approved',
      message: 'Expense approved - no more approvers in chain'
    };
  } catch (error) {
    console.error('Error processing approval:', error);
    throw error;
  }
};

/**
 * Handle admin override of approval process
 * @param {Object} expense - The expense document
 * @param {string} adminId - The ID of the admin
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} Updated expense
 */
export const adminOverride = async (expense, adminId, comment = '') => {
  try {
    expense.approvalHistory.push({
      approverId: adminId,
      action: 'overridden',
      comment: comment || 'Admin override',
      timestamp: new Date()
    });

    expense.status = 'approved';
    expense.currentApproverId = null;
    await expense.save();

    // Create and emit notification to employee
    const admin = await User.findById(adminId);
    const message = `Your expense for ${expense.currency} ${expense.amount} has been approved by admin override`;
    
    await createNotification(
      expense.employeeId,
      'expense_approved',
      expense._id,
      message,
      { adminOverride: true, adminName: `${admin.firstName} ${admin.lastName}` }
    );
    
    emitToUser(expense.employeeId.toString(), NOTIFICATION_EVENTS.EXPENSE_APPROVED, {
      expenseId: expense._id,
      message,
      adminOverride: true,
      adminName: `${admin.firstName} ${admin.lastName}`
    });

    return {
      expense,
      finalStatus: 'approved',
      message: 'Expense approved by admin override'
    };
  } catch (error) {
    console.error('Error processing admin override:', error);
    throw error;
  }
};
