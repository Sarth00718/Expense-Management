import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ApprovalActionModal = ({ isOpen, onClose, expense, action, onConfirm, isLoading }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const isReject = action === 'reject';
  const title = isReject ? 'Reject Expense' : 'Approve Expense';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate comment for rejection
    if (isReject && !comment.trim()) {
      setError('Comment is required when rejecting an expense');
      return;
    }

    setError('');
    onConfirm(comment);
  };

  const handleClose = () => {
    setComment('');
    setError('');
    onClose();
  };

  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit}>
        {/* Expense Summary */}
        <div className="bg-primary/50 border border-accent/20 rounded-lg p-4 mb-6">
          <h3 className="text-text-primary font-semibold mb-3">Expense Details</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Description:</span>
              <span className="text-text-primary font-medium">{expense.description}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Amount:</span>
              <span className="text-accent font-bold">
                {expense.currency} {expense.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Category:</span>
              <span className="text-text-primary capitalize">
                {expense.category.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Employee:</span>
              <span className="text-text-primary">
                {expense.employeeId?.firstName} {expense.employeeId?.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Field */}
        <div className="mb-6">
          <label className="block text-text-primary font-medium mb-2">
            Comment {isReject && <span className="text-error">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isReject ? 'Please provide a reason for rejection...' : 'Add an optional comment...'}
            rows={4}
            className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
              text-text-primary placeholder-text-secondary
              focus:border-accent focus:outline-none transition-colors duration-300"
            disabled={isLoading}
          />
          {error && (
            <p className="text-error text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-secondary border-2 border-text-secondary text-text-secondary rounded-lg
              hover:bg-text-secondary hover:text-primary transition-all duration-300 font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isReject 
                ? 'bg-error text-white hover:shadow-[0_0_20px_rgba(255,51,102,0.5)]' 
                : 'bg-success text-white hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]'
              }`}
          >
            {isLoading ? 'Processing...' : (isReject ? 'Reject Expense' : 'Approve Expense')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApprovalActionModal;
