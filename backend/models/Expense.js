import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'USD'
  },
  convertedAmount: {
    type: Number,
    required: [true, 'Converted amount is required'],
    min: [0, 'Converted amount must be positive']
  },
  category: {
    type: String,
    enum: ['travel', 'food', 'office_supplies', 'entertainment', 'utilities', 'other'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Expense date is required']
  },
  receiptUrl: {
    type: String,
    default: null
  },
  ocrData: {
    vendor: {
      type: String,
      default: null
    },
    extractedAmount: {
      type: Number,
      default: null
    },
    extractedDate: {
      type: Date,
      default: null
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  approvalHistory: [{
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['approved', 'rejected', 'overridden'],
      required: true
    },
    comment: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
expenseSchema.index({ employeeId: 1, status: 1 });
expenseSchema.index({ companyId: 1, status: 1 });
expenseSchema.index({ currentApproverId: 1, status: 1 });
expenseSchema.index({ date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
