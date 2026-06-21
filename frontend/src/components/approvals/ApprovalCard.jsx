import React, { useState } from 'react';
import Button from '../common/Button';

// Category icons
const CATEGORY_ICONS = {
  travel: '✈️',
  food: '🍽️',
  office_supplies: '📎',
  other: '📋'
};

const ApprovalCard = ({ expense, onApprove, onReject, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  const categoryIcon = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.other;

  return (
    <div className="bg-secondary border-2 border-warning/30 hover:border-warning rounded-lg p-4 sm:p-5 transition-all duration-300 shadow-lg hover:shadow-warning/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="text-2xl sm:text-3xl flex-shrink-0">{categoryIcon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-text-primary font-semibold text-base sm:text-lg truncate">
              {expense.description}
            </h3>
            <p className="text-text-secondary text-xs sm:text-sm capitalize truncate">
              {expense.category.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Pending Badge */}
        <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border-2 bg-warning/10 text-warning border-warning animate-pulse flex-shrink-0">
          PENDING
        </span>
      </div>

      {/* Employee Info */}
      <div className="mb-4 pb-4 border-b border-secondary">
        <p className="text-text-secondary text-xs mb-1">Submitted by</p>
        <p className="text-text-primary font-medium text-sm">
          {expense.employeeId?.firstName} {expense.employeeId?.lastName}
        </p>
        <p className="text-text-secondary text-xs truncate">
          {expense.employeeId?.email}
        </p>
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div>
          <p className="text-text-secondary text-xs mb-1">Amount</p>
          <p className="text-accent font-bold text-lg sm:text-xl">
            {formatCurrency(expense.amount, expense.currency)}
          </p>
          {expense.currency !== expense.companyId?.baseCurrency && expense.convertedAmount && (
            <p className="text-text-secondary text-xs mt-1">
              ≈ {formatCurrency(expense.convertedAmount, expense.companyId?.baseCurrency || 'INR')}
            </p>
          )}
        </div>
        <div>
          <p className="text-text-secondary text-xs mb-1">Date</p>
          <p className="text-text-primary font-medium text-sm sm:text-base">
            {formatDate(expense.date)}
          </p>
        </div>
      </div>

      {/* Receipt Thumbnail */}
      {expense.receiptUrl && (
        <div className="mb-4">
          <p className="text-text-secondary text-xs mb-2">Receipt</p>
          <div 
            className="w-full max-h-32 bg-primary/50 rounded-lg border border-accent/20 overflow-hidden cursor-pointer hover:border-accent transition-colors"
            onClick={() => onViewDetails(expense)}
          >
            <img
              src={expense.receiptUrl}
              alt="Receipt"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center justify-center h-32 bg-primary/50">
              <span className="text-accent text-sm">📎 Receipt</span>
            </div>
          </div>
        </div>
      )}

      {/* Approval History */}
      {expense.approvalHistory && expense.approvalHistory.length > 0 && (
        <div className="mb-4 pb-4 border-b border-secondary">
          <p className="text-text-secondary text-xs mb-2">Previous Approvals</p>
          <div className="space-y-2">
            {expense.approvalHistory.map((history, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-success">✓</span>
                <div className="flex-1">
                  <p className="text-text-primary">
                    <span className="font-medium">
                      {history.approverId?.firstName} {history.approverId?.lastName}
                    </span>
                    {' '}approved on {formatDate(history.timestamp)}
                  </p>
                  {history.comment && (
                    <p className="text-text-secondary text-xs mt-1">
                      "{history.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onViewDetails(expense)}
          className="flex-1 px-3 sm:px-4 py-2 bg-secondary border-2 border-accent text-accent rounded-lg
            hover:bg-accent hover:text-primary transition-all duration-300 text-sm font-medium"
        >
          View Details
        </button>

        <div className="flex gap-2 sm:flex-1">
          <button
            onClick={() => onApprove(expense)}
            className="flex-1 px-3 sm:px-4 py-2 bg-success/10 border-2 border-success text-success rounded-lg
              hover:bg-success hover:text-white transition-all duration-300 text-sm font-medium
              hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            ✓ Approve
          </button>

          <button
            onClick={() => onReject(expense)}
            className="flex-1 px-3 sm:px-4 py-2 bg-error/10 border-2 border-error text-error rounded-lg
              hover:bg-error hover:text-white transition-all duration-300 text-sm font-medium
              hover:shadow-[0_0_20px_rgba(255,51,102,0.3)]"
          >
            ✗ Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalCard;
