import React from 'react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'other', label: 'Other' }
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' }
];

const ExpenseFilters = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="bg-secondary border-2 border-secondary rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-text-secondary text-xs font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary text-sm
              focus:outline-none focus:border-accent transition-all duration-300"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-text-secondary text-xs font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary text-sm
              focus:outline-none focus:border-accent transition-all duration-300"
          >
            {STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-text-secondary text-xs font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary text-sm
              focus:outline-none focus:border-accent transition-all duration-300"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-text-secondary text-xs font-medium mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary text-sm
              focus:outline-none focus:border-accent transition-all duration-300"
          />
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sortBy" className="block text-text-secondary text-xs font-medium mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy || 'date'}
              onChange={handleChange}
              className="flex-1 px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary text-sm
                focus:outline-none focus:border-accent transition-all duration-300"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => onFilterChange({ 
                ...filters, 
                order: filters.order === 'asc' ? 'desc' : 'asc' 
              })}
              className="px-3 py-2 bg-primary border-2 border-secondary rounded-lg text-accent
                hover:border-accent transition-all duration-300"
              title={filters.order === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.order === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-text-secondary hover:text-accent text-sm transition-all duration-300"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ExpenseFilters;
