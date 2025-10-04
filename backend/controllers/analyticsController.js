import Expense from '../models/Expense.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { 
  generatePDFReport, 
  generateExcelReport, 
  fetchExpensesForExport 
} from '../services/exportService.js';

// Get dashboard statistics with role-based filtering
export const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build base query
    let matchQuery = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      matchQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId,
        isActive: true
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(member => member._id);
      matchQuery.employeeId = { $in: [...teamMemberIds, req.user._id] };
    }

    // Apply date filter if provided
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        matchQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.date.$lte = new Date(endDate);
      }
    }

    // Aggregate statistics
    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          draftCount: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$convertedAmount', 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$convertedAmount', 0] }
          }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get top spenders (only for managers and admins)
    let topSpenders = [];
    if (req.user.role === 'manager' || req.user.role === 'admin') {
      topSpenders = await Expense.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$employeeId',
            totalAmount: { $sum: '$convertedAmount' },
            expenseCount: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $project: {
            employeeId: '$_id',
            employeeName: {
              $concat: ['$employee.firstName', ' ', '$employee.lastName']
            },
            totalAmount: 1,
            expenseCount: 1
          }
        }
      ]);
    }

    const result = {
      summary: stats.length > 0 ? stats[0] : {
        totalExpenses: 0,
        totalAmount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        draftCount: 0,
        pendingAmount: 0,
        approvedAmount: 0
      },
      categoryBreakdown,
      topSpenders
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get expenses by category
export const getExpensesByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      matchQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId,
        isActive: true
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(member => member._id);
      matchQuery.employeeId = { $in: [...teamMemberIds, req.user._id] };
    }

    // Apply date filter
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        matchQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.date.$lte = new Date(endDate);
      }
    }

    const categoryData = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$convertedAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$convertedAmount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      {
        $project: {
          category: '$_id',
          totalAmount: 1,
          count: 1,
          avgAmount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    next(error);
  }
};

// Get expenses by month
export const getExpensesByMonth = async (req, res, next) => {
  try {
    const { year, months = 12 } = req.query;
    
    let matchQuery = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      matchQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId,
        isActive: true
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(member => member._id);
      matchQuery.employeeId = { $in: [...teamMemberIds, req.user._id] };
    }

    // Calculate date range
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const monthsToShow = parseInt(months);
    
    const startDate = new Date(targetYear, currentDate.getMonth() - monthsToShow + 1, 1);
    matchQuery.date = { $gte: startDate };

    const monthlyData = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$convertedAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$convertedAmount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: 1,
          count: 1,
          avgAmount: 1,
          pendingCount: 1,
          approvedCount: 1,
          rejectedCount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    next(error);
  }
};

// Get approval statistics
export const getApprovalStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { companyId: req.user.companyId };

    // Role-based filtering
    if (req.user.role === 'employee') {
      matchQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId,
        isActive: true
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(member => member._id);
      matchQuery.employeeId = { $in: [...teamMemberIds, req.user._id] };
    }

    // Apply date filter
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        matchQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.date.$lte = new Date(endDate);
      }
    }

    // Get approval statistics
    const approvalStats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$convertedAmount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    // Calculate average approval time (for approved/rejected expenses)
    const approvalTimeStats = await Expense.aggregate([
      { 
        $match: { 
          ...matchQuery,
          status: { $in: ['approved', 'rejected'] },
          'approvalHistory.0': { $exists: true }
        }
      },
      {
        $project: {
          approvalTime: {
            $subtract: [
              { $arrayElemAt: ['$approvalHistory.timestamp', 0] },
              '$createdAt'
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgApprovalTime: { $avg: '$approvalTime' },
          minApprovalTime: { $min: '$approvalTime' },
          maxApprovalTime: { $max: '$approvalTime' }
        }
      }
    ]);

    // Get pending approvals for current user (if manager or admin)
    let pendingApprovals = 0;
    if (req.user.role === 'manager' || req.user.role === 'admin') {
      pendingApprovals = await Expense.countDocuments({
        companyId: req.user.companyId,
        currentApproverId: req.user._id,
        status: 'pending'
      });
    }

    res.json({
      success: true,
      data: {
        statusBreakdown: approvalStats,
        approvalTime: approvalTimeStats.length > 0 ? {
          avgApprovalTimeMs: approvalTimeStats[0].avgApprovalTime,
          avgApprovalTimeHours: approvalTimeStats[0].avgApprovalTime / (1000 * 60 * 60),
          minApprovalTimeMs: approvalTimeStats[0].minApprovalTime,
          maxApprovalTimeMs: approvalTimeStats[0].maxApprovalTime
        } : null,
        pendingApprovals
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export analytics report
export const exportReport = async (req, res, next) => {
  try {
    const { format, startDate, endDate, category, status } = req.query;
    
    // Validate format
    if (!format || !['pdf', 'excel'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Format must be either "pdf" or "excel"'
        }
      });
    }
    
    // Prepare filters
    const filters = {
      startDate: startDate || null,
      endDate: endDate || null,
      category: category || null,
      status: status || null
    };
    
    // Fetch expenses
    const expenses = await fetchExpensesForExport(req.user, filters);
    
    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No expenses found matching the specified filters'
        }
      });
    }
    
    // Get company information
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COMPANY_NOT_FOUND',
          message: 'Company not found'
        }
      });
    }
    
    // Generate report based on format
    let reportBuffer;
    let contentType;
    let filename;
    
    if (format.toLowerCase() === 'pdf') {
      reportBuffer = await generatePDFReport(expenses, filters, req.user, company);
      contentType = 'application/pdf';
      filename = `expense-report-${Date.now()}.pdf`;
    } else {
      reportBuffer = await generateExcelReport(expenses, filters, req.user, company);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `expense-report-${Date.now()}.xlsx`;
    }
    
    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', reportBuffer.byteLength || reportBuffer.length);
    
    // Send the file
    res.send(Buffer.from(reportBuffer));
  } catch (error) {
    console.error('Export error:', error);
    next(error);
  }
};
