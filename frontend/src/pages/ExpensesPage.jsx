import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import Modal from '../components/common/Modal';
import { getReceiptUrl, getReceiptPlaceholder } from '../utils/receiptUtils';
import { overrideApproval } from '../services/approvalService';

const ExpensesPage = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideComment, setOverrideComment] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Handle successful form submission
  const handleFormSuccess = (expense) => {
    setShowForm(false);
    setEditingExpense(null);
    setRefreshTrigger(prev => prev + 1); // Trigger list refresh
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    setViewingExpense(null);
  };

  // Handle view expense details
  const handleView = (expense) => {
    setViewingExpense(expense);
    setShowForm(false);
  };

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Handle create new expense
  const handleCreateNew = () => {
    setEditingExpense(null);
    setShowForm(true);
    setViewingExpense(null);
  };

  // Close detail view
  const handleCloseDetail = () => {
    setViewingExpense(null);
  };

  // Handle admin override
  const handleOverride = () => {
    setOverrideComment('');
    setOverrideModalOpen(true);
  };

  const handleConfirmOverride = async () => {
    try {
      setOverrideLoading(true);
      setError(null);

      await overrideApproval(viewingExpense._id, overrideComment);
      setSuccessMessage('Expense approved by admin override!');

      // Close modals
      setOverrideModalOpen(false);
      setViewingExpense(null);
      setOverrideComment('');

      // Refresh the list
      setRefreshTrigger(prev => prev + 1);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error processing override:', err);
      setError(err.response?.data?.error?.message || 'Failed to override approval');
    } finally {
      setOverrideLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          💰 Expenses
        </h1>
        <p className="text-text-secondary">
          Manage your expense submissions and track approval status
        </p>
      </div>

        {/* Success Message */}
      {successMessage && !showForm && !viewingExpense && (
        <div className="mb-6 bg-success/10 border-2 border-success text-success px-4 py-3 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !showForm && !viewingExpense && (
        <div className="mb-6 bg-error/10 border-2 border-error text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create New Button */}
        {!showForm && !viewingExpense && (
          <div className="mb-6">
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg
                font-semibold hover:shadow-glow transition-all duration-300"
            >
              + Create New Expense
            </button>
          </div>
        )}

        {/* Expense Form */}
        {showForm && (
          <div className="mb-8 bg-secondary border-2 border-accent/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              {editingExpense ? 'Edit Expense' : 'Create New Expense'}
            </h2>
            <ExpenseForm
              expense={editingExpense}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Expense Detail View */}
        {viewingExpense && (
          <div className="mb-8 bg-secondary border-2 border-accent rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                Expense Details
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-text-secondary hover:text-accent transition-all duration-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <p className="text-text-secondary text-sm mb-1">Description</p>
                <p className="text-text-primary text-lg font-medium">
                  {viewingExpense.description}
                </p>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Amount</p>
                  <p className="text-accent text-2xl font-bold">
                    {formatCurrency(viewingExpense.amount, viewingExpense.currency)}
                  </p>
                  {viewingExpense.convertedAmount && viewingExpense.currency !== 'USD' && (
                    <p className="text-text-secondary text-sm mt-1">
                      ≈ {formatCurrency(viewingExpense.convertedAmount, 'USD')}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-text-secondary text-sm mb-1">Category</p>
                  <p className="text-text-primary text-lg font-medium capitalize">
                    {viewingExpense.category.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Date and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Date</p>
                  <p className="text-text-primary font-medium">
                    {formatDate(viewingExpense.date)}
                  </p>
                </div>

                <div>
                  <p className="text-text-secondary text-sm mb-1">Status</p>
                  <p className="text-text-primary font-medium capitalize">
                    {viewingExpense.status}
                  </p>
                </div>
              </div>

              {/* Receipt */}
              {viewingExpense.receiptUrl && (
                <div>
                  <p className="text-text-secondary text-sm mb-2">Receipt</p>
                  <div className="relative">
                    <img
                      src={getReceiptUrl(viewingExpense.receiptUrl)}
                      alt="Receipt"
                      className="max-w-md rounded-lg border-2 border-secondary cursor-pointer hover:border-accent transition-all"
                      onClick={() => window.open(getReceiptUrl(viewingExpense.receiptUrl), '_blank')}
                      onError={(e) => {
                        console.error('Failed to load receipt image:', viewingExpense.receiptUrl);
                        console.error('Attempted URL:', getReceiptUrl(viewingExpense.receiptUrl));
                        e.target.src = getReceiptPlaceholder();
                        e.target.style.cursor = 'default';
                      }}
                    />
                    <p className="text-text-secondary text-xs mt-2">
                      Click to view full size
                    </p>
                  </div>
                </div>
              )}

              {/* OCR Data */}
              {viewingExpense.ocrData && viewingExpense.ocrData.vendor && (
                <div className="bg-primary border-2 border-secondary rounded-lg p-4">
                  <p className="text-text-secondary text-sm mb-2">OCR Extracted Data</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-text-primary">
                      <span className="text-text-secondary">Vendor:</span> {viewingExpense.ocrData.vendor}
                    </p>
                    {viewingExpense.ocrData.confidence && (
                      <p className="text-text-primary">
                        <span className="text-text-secondary">Confidence:</span>{' '}
                        {Math.round(viewingExpense.ocrData.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Approval History */}
              {viewingExpense.approvalHistory && viewingExpense.approvalHistory.length > 0 && (
                <div>
                  <p className="text-text-secondary text-sm mb-3">Approval History</p>
                  <div className="space-y-3">
                    {viewingExpense.approvalHistory.map((history, index) => (
                      <div
                        key={index}
                        className="bg-primary border-2 border-secondary rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${history.action === 'approved' ? 'text-success' : 'text-error'}`}>
                            {history.action === 'approved' ? '✓' : '✗'}
                          </span>
                          <div className="flex-1">
                            <p className="text-text-primary font-medium">
                              {history.approverId?.firstName} {history.approverId?.lastName}
                            </p>
                            <p className="text-text-secondary text-sm capitalize">
                              {history.action} on {formatDate(history.timestamp)}
                            </p>
                            {history.comment && (
                              <p className="text-text-primary text-sm mt-2 italic">
                                "{history.comment}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-secondary">
                {viewingExpense.status === 'draft' && (
                  <button
                    onClick={() => handleEdit(viewingExpense)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg
                      font-semibold hover:shadow-glow transition-all duration-300"
                  >
                    Edit Expense
                  </button>
                )}
                
                {/* Admin Override Button for Pending Expenses */}
                {user?.role === 'admin' && viewingExpense.status === 'pending' && (
                  <button
                    onClick={handleOverride}
                    className="flex-1 px-6 py-3 bg-warning/10 border-2 border-warning text-warning rounded-lg
                      hover:bg-warning hover:text-primary transition-all duration-300 font-semibold
                      hover:shadow-[0_0_20px_rgba(255,193,7,0.3)]"
                  >
                    ⚡ Override Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Override Modal */}
        <Modal
          isOpen={overrideModalOpen}
          onClose={() => {
            setOverrideModalOpen(false);
            setOverrideComment('');
          }}
          title="Admin Override Approval"
        >
          {viewingExpense && (
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
                    <span className="font-medium">Description:</span> {viewingExpense.description}
                  </p>
                  <p className="text-text-secondary">
                    <span className="font-medium">Amount:</span>{' '}
                    <span className="text-accent font-bold">
                      {formatCurrency(viewingExpense.amount, viewingExpense.currency)}
                    </span>
                  </p>
                  <p className="text-text-secondary">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="capitalize">{viewingExpense.status}</span>
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
                    setOverrideComment('');
                  }}
                  disabled={overrideLoading}
                  className="flex-1 px-6 py-3 bg-secondary border-2 border-text-secondary text-text-secondary rounded-lg
                    hover:bg-text-secondary hover:text-primary transition-all duration-300 font-semibold
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleConfirmOverride}
                  disabled={overrideLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-warning to-warning/80 text-primary rounded-lg
                    hover:shadow-[0_0_20px_rgba(255,193,7,0.5)] transition-all duration-300 font-semibold
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {overrideLoading ? 'Processing...' : '⚡ Confirm Override'}
                </button>
              </div>
            </div>
          )}
        </Modal>

      {/* Expense List */}
      {!showForm && !viewingExpense && (
        <ExpenseList
          onEdit={handleEdit}
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
