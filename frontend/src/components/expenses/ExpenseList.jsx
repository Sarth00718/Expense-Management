import React, { useState, useEffect } from 'react';
import ExpenseCard from './ExpenseCard';
import ExpenseFilters from './ExpenseFilters';
import { getExpenses, deleteExpense } from '../../services/expenseService';

const ExpenseList = ({ onEdit, onView, refreshTrigger = 0 }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    order: 'desc'
  });

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params from filters
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;

      const response = await getExpenses(params);
      setExpenses(response.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.error?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses on mount and when filters change
  useEffect(() => {
    fetchExpenses();
  }, [filters, refreshTrigger]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      category: '',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      order: 'desc'
    });
  };

  // Handle delete expense
  const handleDelete = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete this expense: "${expense.description}"?`)) {
      return;
    }

    try {
      await deleteExpense(expense._id);
      // Refresh the list
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert(err.response?.data?.error?.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-text-secondary">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 border-2 border-error rounded-lg">
        <p className="text-error font-medium mb-2">Error Loading Expenses</p>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button
          onClick={fetchExpenses}
          className="px-4 py-2 bg-error text-white rounded-lg hover:shadow-[0_0_20px_rgba(255,51,102,0.5)] transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-text-secondary text-sm">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} found
        </p>
      </div>

      {/* Expense Cards */}
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-text-primary font-medium mb-2">No expenses found</p>
          <p className="text-text-secondary text-sm">
            {filters.category || filters.status || filters.startDate || filters.endDate
              ? 'Try adjusting your filters'
              : 'Create your first expense to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {expenses.map(expense => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              onEdit={onEdit}
              onDelete={handleDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
