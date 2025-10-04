import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import ReceiptUpload from './ReceiptUpload';
import { useCurrency } from '../../hooks/useCurrency';
import { createExpense, updateExpense } from '../../services/expenseService';
import { convertCurrency } from '../../services/currencyService';

// Category options with icons
const CATEGORIES = [
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'office_supplies', label: 'Office Supplies', icon: '📎' },
  { value: 'other', label: 'Other', icon: '📋' }
];

const ExpenseForm = ({ expense = null, onSuccess, onCancel }) => {
  const { currencies, baseCurrency, loading: currenciesLoading } = useCurrency();
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: baseCurrency || 'USD',
    category: 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    ocrData: null
  });

  const [convertedAmount, setConvertedAmount] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  // Load expense data if editing
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        currency: expense.currency,
        category: expense.category,
        description: expense.description,
        date: new Date(expense.date).toISOString().split('T')[0],
        receiptUrl: expense.receiptUrl || '',
        ocrData: expense.ocrData || null
      });
      setConvertedAmount(expense.convertedAmount);
    }
  }, [expense]);

  // Convert currency when amount or currency changes
  useEffect(() => {
    const convertAmount = async () => {
      if (formData.amount && formData.currency && baseCurrency) {
        if (formData.currency === baseCurrency) {
          setConvertedAmount(parseFloat(formData.amount));
        } else {
          setConverting(true);
          try {
            const result = await convertCurrency(
              parseFloat(formData.amount),
              formData.currency,
              baseCurrency
            );
            setConvertedAmount(result.convertedAmount);
          } catch (error) {
            console.error('Currency conversion error:', error);
            setErrors(prev => ({
              ...prev,
              currency: 'Failed to convert currency. Please try again.'
            }));
          } finally {
            setConverting(false);
          }
        }
      }
    };

    const debounce = setTimeout(convertAmount, 500);
    return () => clearTimeout(debounce);
  }, [formData.amount, formData.currency, baseCurrency]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle OCR data extraction
  const handleDataExtracted = (ocrData) => {
    setFormData(prev => ({
      ...prev,
      amount: ocrData.amount ? ocrData.amount.toString() : prev.amount,
      category: ocrData.category || prev.category,
      description: ocrData.vendor || prev.description,
      date: ocrData.date || prev.date,
      ocrData: {
        vendor: ocrData.vendor,
        extractedAmount: ocrData.amount,
        extractedDate: ocrData.date,
        confidence: ocrData.confidence / 100
      }
    }));
  };

  // Handle receipt upload completion
  const handleUploadComplete = (fileUrl) => {
    setFormData(prev => ({
      ...prev,
      receiptUrl: fileUrl
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!convertedAmount) {
      newErrors.currency = 'Currency conversion failed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        convertedAmount: convertedAmount,
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        receiptUrl: formData.receiptUrl,
        ocrData: formData.ocrData,
        status: status
      };

      let result;
      if (expense) {
        // Update existing expense
        result = await updateExpense(expense._id, expenseData);
      } else {
        // Create new expense
        result = await createExpense(expenseData);
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrors({
        submit: error.response?.data?.error?.message || 'Failed to save expense. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = (e) => {
    handleSubmit(e, 'draft');
  };

  // Handle submit for approval
  const handleSubmitForApproval = (e) => {
    handleSubmit(e, 'pending');
  };

  return (
    <form className="space-y-6">
      {/* Receipt Upload */}
      <ReceiptUpload
        onDataExtracted={handleDataExtracted}
        onUploadComplete={handleUploadComplete}
      />

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
          required
          step="0.01"
          min="0"
        />

        <div className="mb-4">
          <label htmlFor="currency" className="block text-text-secondary text-sm font-medium mb-2">
            Currency <span className="text-error">*</span>
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={currenciesLoading}
            className={`w-full px-4 py-3 bg-secondary border-2 rounded-lg text-text-primary
              focus:outline-none focus:border-accent transition-all duration-300
              ${errors.currency ? 'border-error' : 'border-secondary'}`}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-error">{errors.currency}</p>
          )}
        </div>
      </div>

      {/* Converted Amount Display */}
      {convertedAmount && formData.currency !== baseCurrency && (
        <div className="p-4 bg-secondary/50 border-2 border-accent/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">
              Converted to {baseCurrency}:
            </span>
            <span className="text-accent font-semibold text-lg">
              {converting ? (
                <span className="text-sm">Converting...</span>
              ) : (
                `${baseCurrency} ${convertedAmount.toFixed(2)}`
              )}
            </span>
          </div>
        </div>
      )}

      {/* Category */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-text-secondary text-sm font-medium mb-2">
          Category <span className="text-error">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleChange({ target: { name: 'category', value: cat.value } })}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-center
                ${formData.category === cat.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-secondary text-text-secondary hover:border-accent/50'
                }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.label}</div>
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-error">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-text-secondary text-sm font-medium mb-2">
          Description <span className="text-error">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter expense description..."
          required
          rows="3"
          maxLength="500"
          className={`w-full px-4 py-3 bg-secondary border-2 rounded-lg text-text-primary placeholder-text-secondary/50 
            focus:outline-none focus:border-accent transition-all duration-300 resize-none
            ${errors.description ? 'border-error' : 'border-secondary'}`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-error">{errors.description}</p>
          ) : (
            <span></span>
          )}
          <span className="text-xs text-text-secondary">
            {formData.description.length}/500
          </span>
        </div>
      </div>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        required
        max={new Date().toISOString().split('T')[0]}
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={handleSaveDraft}
          variant="secondary"
          disabled={loading || converting}
          fullWidth
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmitForApproval}
          variant="primary"
          disabled={loading || converting}
          fullWidth
        >
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
