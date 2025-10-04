import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ApprovalCard from './ApprovalCard';
import ApprovalActionModal from './ApprovalActionModal';
import ApprovalWorkflowVisualizer from './ApprovalWorkflowVisualizer';
import Modal from '../common/Modal';
import { getPendingApprovals, approveExpense, rejectExpense, overrideApproval } from '../../services/approvalService';

const ApprovalQueue = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [overrideComment, setOverrideComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingApprovals();
      setApprovals(response.data || []);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError(err.response?.data?.error?.message || 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (expense) => {
    setSelectedExpense(expense);
    setCurrentAction('approve');
    setActionModalOpen(true);
  };

  const handleReject = (expense) => {
    setSelectedExpense(expense);
    setCurrentAction('reject');
    setActionModalOpen(true);
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setDetailsModalOpen(true);
  };

  const handleOverride = (expense) => {
    setSelectedExpense(expense);
    setOverrideComment('');
    setOverrideModalOpen(true);
  };

  const handleConfirmOverride = async () => {
    try {
      setActionLoading(true);
      setError(null);

      await overrideApproval(selectedExpense._id, overrideComment);
      setSuccessMessage('Expense approved by admin override!');

      // Close modal
      setOverrideModalOpen(false);
      setSelectedExpense(null);
      setOverrideComment('');

      // Refresh the list
      await fetchPendingApprovals();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error processing override:', err);
      setError(err.response?.data?.error?.message || 'Failed to override approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async (comment) => {
    try {
      setActionLoading(true);
      setError(null);

      let response;
      if (currentAction === 'approve') {
        response = await approveExpense(selectedExpense._id, comment);
        setSuccessMessage('Expense approved successfully!');
      } else {
        response = await rejectExpense(selectedExpense._id, comment);
        setSuccessMessage('Expense rejected successfully!');
      }

      // Close modal
      setActionModalOpen(false);
      setSelectedExpense(null);
      setCurrentAction(null);

      // Refresh the list
      await fetchPendingApprovals();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error processing approval action:', err);
      setError(err.response?.data?.error?.message || 'Failed to process approval action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Approval Queue</h2>
          <p className="text-text-secondary">
            {approvals.length} {approvals.length === 1 ? 'expense' : 'expenses'} pending your approval
          </p>
        </div>
        
        <button
          onClick={fetchPendingApprovals}
          className="px-4 py-2 bg-secondary border-2 border-accent text-accent rounded-lg
            hover:bg-accent hover:text-primary transition-all duration-300 text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-success/10 border-2 border-success text-success px-4 py-3 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border-2 border-error text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {approvals.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">All caught up!</h3>
          <p className="text-text-secondary">No expenses pending your approval at the moment.</p>
        </div>
      )}

      {/* Approval Cards Grid */}
      {approvals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {approvals.map((expense) => (
            <ApprovalCard
              key={expense._id}
              expense={expense}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Action Modal */}
      <ApprovalActionModal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedExpense(null);
          setCurrentAction(null);
        }}
        expense={selectedExpense}
        action={currentAction}
        onConfirm={handleConfirmAction}
        isLoading={actionLoading}
      />

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Expense Details"
      >
        {selectedExpense && (
          <div className="space-y-6">
            {/* Expense Information */}
            <div className="bg-primary/50 border border-accent/20 rounded-lg p-4">
              <h3 className="text-text-primary font-semibold mb-4">Expense Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-text-secondary text-xs mb-1">Description</p>
                  <p className="text-text-primary font-medium">{selectedExpense.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Amount</p>
                    <p className="text-accent font-bold text-lg">
                      {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Category</p>
                    <p className="text-text-primary capitalize">
                      {selectedExpense.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-text-secondary text-xs mb-1">Date</p>
                  <p className="text-text-primary">
                    {new Date(selectedExpense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {selectedExpense.receiptUrl && (
                  <div>
                    <p className="text-text-secondary text-xs mb-2">Receipt</p>
                    <a
                      href={selectedExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent hover:text-accent-secondary transition-colors"
                    >
                      📎 View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Workflow */}
            <ApprovalWorkflowVisualizer expense={selectedExpense} />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleApprove(selectedExpense);
                }}
                className="flex-1 px-6 py-3 bg-success/10 border-2 border-success text-success rounded-lg
                  hover:bg-success hover:text-white transition-all duration-300 font-semibold
                  hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
              >
                ✓ Approve
              </button>
              
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleReject(selectedExpense);
                }}
                className="flex-1 px-6 py-3 bg-error/10 border-2 border-error text-error rounded-lg
                  hover:bg-error hover:text-white transition-all duration-300 font-semibold
                  hover:shadow-[0_0_20px_rgba(255,51,102,0.3)]"
              >
                ✗ Reject
              </button>
              
              {/* Admin Override Button */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleOverride(selectedExpense);
                  }}
                  className="flex-1 px-6 py-3 bg-warning/10 border-2 border-warning text-warning rounded-lg
                    hover:bg-warning hover:text-primary transition-all duration-300 font-semibold
                    hover:shadow-[0_0_20px_rgba(255,193,7,0.3)]"
                >
                  ⚡ Override
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setSelectedExpense(null);
          setOverrideComment('');
        }}
        title="Admin Override Approval"
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="bg-warning/10 border-2 border-warning rounded-lg p-4">
              <p className="text-warning text-sm">
                ⚠️ You are about to override the normal approval process and immediately approve this expense.
              </p>
            </div>

            <div className="bg-primary/50 border border-accent/20 rounded-lg p-4">
              <h3 className="text-text-primary font-semibold mb-3">Expense Details</h3>
              <div className="space-y-2 text-sm">
                <p className="text-text-secondary">
                  <span className="font-medium">Description:</span> {selectedExpense.description}
                </p>
                <p className="text-text-secondary">
                  <span className="font-medium">Amount:</span>{' '}
                  <span className="text-accent font-bold">
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                  </span>
                </p>
                <p className="text-text-secondary">
                  <span className="font-medium">Employee:</span>{' '}
                  {selectedExpense.employeeId?.firstName} {selectedExpense.employeeId?.lastName}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="override-comment" className="block text-text-secondary text-sm font-medium mb-2">
                Comment (Optional)
              </label>
              <textarea
                id="override-comment"
                value={overrideComment}
                onChange={(e) => setOverrideComment(e.target.value)}
                placeholder="Add a reason for this override..."
                rows="3"
                className="w-full px-4 py-3 bg-secondary border-2 border-secondary rounded-lg text-text-primary
                  placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-all duration-300 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOverrideModalOpen(false);
                  setSelectedExpense(null);
                  setOverrideComment('');
                }}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-secondary border-2 border-text-secondary text-text-secondary rounded-lg
                  hover:bg-text-secondary hover:text-primary transition-all duration-300 font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmOverride}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-warning to-warning/80 text-primary rounded-lg
                  hover:shadow-[0_0_20px_rgba(255,193,7,0.5)] transition-all duration-300 font-semibold
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Processing...' : '⚡ Confirm Override'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalQueue;
