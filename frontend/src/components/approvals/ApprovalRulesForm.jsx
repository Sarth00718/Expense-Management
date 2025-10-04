import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const ApprovalRulesForm = ({ rule, users, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage',
    percentageThreshold: 60,
    specificApproverId: '',
    approvalSequence: [],
    isActive: true,
    priority: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        type: rule.type || 'percentage',
        percentageThreshold: rule.conditions?.percentageThreshold || 60,
        specificApproverId: rule.conditions?.specificApproverId?._id || rule.conditions?.specificApproverId || '',
        approvalSequence: rule.conditions?.approvalSequence?.map(u => u._id || u) || [],
        isActive: rule.isActive !== undefined ? rule.isActive : true,
        priority: rule.priority || 0
      });
    }
  }, [rule]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSequenceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      approvalSequence: selectedOptions
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (formData.type === 'percentage' || formData.type === 'hybrid') {
      if (!formData.percentageThreshold || formData.percentageThreshold < 1 || formData.percentageThreshold > 100) {
        newErrors.percentageThreshold = 'Percentage must be between 1 and 100';
      }
    }

    if (formData.type === 'specific_approver' || formData.type === 'hybrid') {
      if (!formData.specificApproverId) {
        newErrors.specificApproverId = 'Specific approver is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Build conditions object based on type
    const conditions = {};
    
    if (formData.type === 'percentage' || formData.type === 'hybrid') {
      conditions.percentageThreshold = parseInt(formData.percentageThreshold);
    }
    
    if (formData.type === 'specific_approver' || formData.type === 'hybrid') {
      conditions.specificApproverId = formData.specificApproverId;
    }
    
    if (formData.approvalSequence.length > 0) {
      conditions.approvalSequence = formData.approvalSequence;
    }

    const submitData = {
      name: formData.name,
      type: formData.type,
      conditions,
      isActive: formData.isActive,
      priority: parseInt(formData.priority)
    };

    onSubmit(submitData);
  };

  // Filter users for specific approver (managers and admins)
  const approverUsers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rule Name */}
      <div>
        <label className="block text-text-primary font-medium mb-2">
          Rule Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Auto-approve with 60% consensus"
          className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
            text-text-primary placeholder-text-secondary
            focus:border-accent focus:outline-none transition-colors duration-300"
          disabled={isLoading}
        />
        {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Rule Type */}
      <div>
        <label className="block text-text-primary font-medium mb-2">
          Rule Type <span className="text-error">*</span>
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
            text-text-primary focus:border-accent focus:outline-none transition-colors duration-300"
          disabled={isLoading}
        >
          <option value="percentage">Percentage-based</option>
          <option value="specific_approver">Specific Approver</option>
          <option value="hybrid">Hybrid (Both conditions)</option>
        </select>
        
        <div className="mt-2 text-text-secondary text-sm">
          {formData.type === 'percentage' && (
            <p>✓ Auto-approve when a percentage threshold of approvals is met</p>
          )}
          {formData.type === 'specific_approver' && (
            <p>✓ Auto-approve when a specific approver approves</p>
          )}
          {formData.type === 'hybrid' && (
            <p>✓ Auto-approve when both percentage threshold AND specific approver conditions are met</p>
          )}
        </div>
      </div>

      {/* Percentage Threshold */}
      {(formData.type === 'percentage' || formData.type === 'hybrid') && (
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Percentage Threshold <span className="text-error">*</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="percentageThreshold"
              min="1"
              max="100"
              value={formData.percentageThreshold}
              onChange={handleChange}
              className="flex-1"
              disabled={isLoading}
            />
            <span className="text-accent font-bold text-xl w-16 text-right">
              {formData.percentageThreshold}%
            </span>
          </div>
          {errors.percentageThreshold && (
            <p className="text-error text-sm mt-1">{errors.percentageThreshold}</p>
          )}
          <p className="text-text-secondary text-sm mt-2">
            Expense will auto-approve when {formData.percentageThreshold}% of approvers have approved
          </p>
        </div>
      )}

      {/* Specific Approver */}
      {(formData.type === 'specific_approver' || formData.type === 'hybrid') && (
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Specific Approver <span className="text-error">*</span>
          </label>
          <select
            name="specificApproverId"
            value={formData.specificApproverId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
              text-text-primary focus:border-accent focus:outline-none transition-colors duration-300"
            disabled={isLoading}
          >
            <option value="">Select an approver...</option>
            {approverUsers.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.role})
              </option>
            ))}
          </select>
          {errors.specificApproverId && (
            <p className="text-error text-sm mt-1">{errors.specificApproverId}</p>
          )}
          <p className="text-text-secondary text-sm mt-2">
            Expense will auto-approve when this specific person approves
          </p>
        </div>
      )}

      {/* Approval Sequence */}
      <div>
        <label className="block text-text-primary font-medium mb-2">
          Approval Sequence (Optional)
        </label>
        <select
          multiple
          value={formData.approvalSequence}
          onChange={handleSequenceChange}
          className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
            text-text-primary focus:border-accent focus:outline-none transition-colors duration-300
            min-h-[120px]"
          disabled={isLoading}
        >
          {approverUsers.map(user => (
            <option key={user._id} value={user._id}>
              {user.firstName} {user.lastName} ({user.role})
            </option>
          ))}
        </select>
        <p className="text-text-secondary text-sm mt-2">
          Hold Ctrl/Cmd to select multiple approvers. Defines the order of approval routing.
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-text-primary font-medium mb-2">
          Priority
        </label>
        <input
          type="number"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          min="0"
          className="w-full px-4 py-3 bg-primary border-2 border-secondary rounded-lg
            text-text-primary focus:border-accent focus:outline-none transition-colors duration-300"
          disabled={isLoading}
        />
        <p className="text-text-secondary text-sm mt-2">
          Higher priority rules are evaluated first (0 = lowest priority)
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-5 h-5 rounded border-2 border-secondary bg-primary
            checked:bg-accent checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          disabled={isLoading}
        />
        <label htmlFor="isActive" className="text-text-primary font-medium cursor-pointer">
          Rule is active
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-secondary border-2 border-text-secondary text-text-secondary rounded-lg
            hover:bg-text-secondary hover:text-primary transition-all duration-300 font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : (rule ? 'Update Rule' : 'Create Rule')}
        </Button>
      </div>
    </form>
  );
};

export default ApprovalRulesForm;
