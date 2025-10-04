import React from 'react';

// Category icons
const CATEGORY_ICONS = {
  travel: '✈️',
  food: '🍽️',
  office_supplies: '📎',
  other: '📋'
};

// Status badge styles
const STATUS_STYLES = {
  draft: {
    bg: 'bg-secondary',
    text: 'text-text-secondary',
    border: 'border-secondary'
  },
  pending: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning'
  },
  approved: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success'
  },
  rejected: {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error'
  }
};

const ExpenseCard = ({ expense, onEdit, onDelete, onView }) => {
  const statusStyle = STATUS_STYLES[expense.status] || STATUS_STYLES.draft;
  const categoryIcon = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.other;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const canEdit = expense.status === 'draft';
  const canDelete = expense.status === 'draft';

  return (
    <div className="bg-secondary border-2 border-secondary hover:border-accent/50 rounded-lg p-5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{categoryIcon}</div>
          <div>
            <h3 className="text-text-primary font-semibold text-lg">
              {expense.description}
            </h3>
            <p className="text-text-secondary text-sm capitalize">
              {expense.category.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          {expense.status.toUpperCase()}
        </span>
      </div>

      {/* Amount and Date */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-text-secondary text-xs mb-1">Amount</p>
          <p className="text-accent font-bold text-xl">
            {formatCurrency(expense.amount, expense.currency)}
          </p>
          {expense.currency !== expense.companyId?.baseCurrency && (
            <p className="text-text-secondary text-xs mt-1">
              ≈ {formatCurrency(expense.convertedAmount, expense.companyId?.baseCurrency || 'USD')}
            </p>
          )}
        </div>
        <div>
          <p className="text-text-secondary text-xs mb-1">Date</p>
          <p className="text-text-primary font-medium">
            {formatDate(expense.date)}
          </p>
        </div>
      </div>

      {/* Employee Info */}
      {expense.employeeId && (
        <div className="mb-4 pb-4 border-b border-secondary">
          <p className="text-text-secondary text-xs mb-1">Submitted by</p>
          <p className="text-text-primary text-sm">
            {expense.employeeId.firstName} {expense.employeeId.lastName}
          </p>
        </div>
      )}

      {/* Approval Status */}
      {expense.status === 'pending' && expense.currentApproverId && (
        <div className="mb-4 pb-4 border-b border-secondary">
          <p className="text-text-secondary text-xs mb-1">Pending Approval From</p>
          <p className="text-warning text-sm font-medium">
            {expense.currentApproverId.firstName} {expense.currentApproverId.lastName}
          </p>
        </div>
      )}

      {/* Approval History */}
      {expense.approvalHistory && expense.approvalHistory.length > 0 && (
        <div className="mb-4">
          <p className="text-text-secondary text-xs mb-2">Approval History</p>
          <div className="space-y-2">
            {expense.approvalHistory.map((history, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className={history.action === 'approved' ? 'text-success' : 'text-error'}>
                  {history.action === 'approved' ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  <p className="text-text-primary">
                    <span className="font-medium">
                      {history.approverId?.firstName} {history.approverId?.lastName}
                    </span>
                    {' '}{history.action} on {formatDate(history.timestamp)}
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

      {/* Receipt Indicator */}
      {expense.receiptUrl && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 text-accent text-sm">
            📎 Receipt attached
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(expense)}
          className="flex-1 px-4 py-2 bg-secondary border-2 border-accent text-accent rounded-lg
            hover:bg-accent hover:text-primary transition-all duration-300 text-sm font-medium"
        >
          View Details
        </button>

        {canEdit && onEdit && (
          <button
            onClick={() => onEdit(expense)}
            className="px-4 py-2 bg-secondary border-2 border-accent-secondary text-accent-secondary rounded-lg
              hover:bg-accent-secondary hover:text-primary transition-all duration-300 text-sm font-medium"
          >
            Edit
          </button>
        )}

        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(expense)}
            className="px-4 py-2 bg-error/10 border-2 border-error text-error rounded-lg
              hover:bg-error hover:text-white transition-all duration-300 text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;
