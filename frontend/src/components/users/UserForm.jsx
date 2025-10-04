import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const UserForm = ({ user, managers, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    managerId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        role: user.role || 'employee',
        managerId: user.managerId?._id || user.managerId || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      if (!submitData.managerId) {
        submitData.managerId = null;
      }
      if (user && !submitData.password) {
        delete submitData.password;
      }
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="John"
          required
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Doe"
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john.doe@company.com"
        required
      />

      {!user && (
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
        />
      )}

      <div className="mb-4">
        <label htmlFor="role" className="block text-text-secondary text-sm font-medium mb-2">
          Role <span className="text-error">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-secondary border-2 border-secondary rounded-lg text-text-primary 
            focus:outline-none focus:border-accent transition-all duration-300"
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="managerId" className="block text-text-secondary text-sm font-medium mb-2">
          Manager (Optional)
        </label>
        <select
          id="managerId"
          name="managerId"
          value={formData.managerId}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-secondary border-2 border-secondary rounded-lg text-text-primary 
            focus:outline-none focus:border-accent transition-all duration-300"
        >
          <option value="">No Manager</option>
          {managers.map(manager => (
            <option key={manager._id} value={manager._id}>
              {manager.firstName} {manager.lastName} ({manager.role})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text-secondary">
          Select a manager or admin to establish reporting relationship
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
