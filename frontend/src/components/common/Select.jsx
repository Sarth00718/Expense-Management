import React from 'react';

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  error, 
  required = false,
  disabled = false,
  placeholder = 'Select an option'
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-text-secondary text-sm font-medium mb-2">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-secondary border-2 rounded-lg text-text-primary 
          focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300
          ${error ? 'border-error focus:border-error focus:shadow-glow-error' : 'border-secondary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          appearance-none bg-no-repeat bg-right pr-10`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300D9FF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: '1.5rem',
          backgroundPosition: 'right 0.5rem center'
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Select;
