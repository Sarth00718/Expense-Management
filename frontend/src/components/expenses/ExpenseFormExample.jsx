import React, { useState } from 'react';
import CurrencySelect from '../common/CurrencySelect';
import CurrencyConverter from '../common/CurrencyConverter';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Example expense form showing currency integration
 * This is a reference implementation for task 6.2
 */
const ExpenseFormExample = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    category: 'other'
  });

  // This would come from company settings in a real implementation
  const baseCurrency = 'USD';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Expense submitted:', formData);
    // Submit logic will be implemented in task 6.2
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Submit Expense</h2>

      <Input
        label="Amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        placeholder="0.00"
        required
        step="0.01"
        min="0"
      />

      <CurrencySelect
        label="Currency"
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        required
        showCountries={true}
      />

      {/* Show conversion if currency is different from base */}
      {formData.amount && formData.currency && (
        <div className="mb-4">
          <CurrencyConverter
            amount={parseFloat(formData.amount)}
            fromCurrency={formData.currency}
            toCurrency={baseCurrency}
            showDetails={true}
          />
        </div>
      )}

      <Input
        label="Description"
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter expense description"
        required
      />

      <div className="mb-4">
        <label className="block text-text-secondary text-sm font-medium mb-2">
          Category <span className="text-error">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-secondary border-2 border-secondary rounded-lg text-text-primary
            focus:outline-none focus:border-accent transition-all duration-300"
        >
          <option value="travel">Travel</option>
          <option value="food">Food</option>
          <option value="office_supplies">Office Supplies</option>
          <option value="other">Other</option>
        </select>
      </div>

      <Button type="submit" variant="primary" className="w-full">
        Submit Expense
      </Button>
    </form>
  );
};

export default ExpenseFormExample;
