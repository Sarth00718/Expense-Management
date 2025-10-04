import mongoose from 'mongoose';

const approvalRuleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company ID is required']
  },
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'specific_approver', 'hybrid'],
    required: [true, 'Rule type is required']
  },
  conditions: {
    percentageThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    specificApproverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvalSequence: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
approvalRuleSchema.index({ companyId: 1, isActive: 1, priority: -1 });

const ApprovalRule = mongoose.model('ApprovalRule', approvalRuleSchema);

export default ApprovalRule;
