import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  baseCurrency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  settings: {
    requireManagerApproval: {
      type: Boolean,
      default: true
    },
    escalateToAdmin: {
      type: Boolean,
      default: true
    },
    autoApprovalThreshold: {
      type: Number,
      default: null
    },
    enableOCR: {
      type: Boolean,
      default: true
    },
    enableRealTimeNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;
