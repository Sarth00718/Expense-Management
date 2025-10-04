import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  disabled = false,
  icon = null
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-text-secondary text-sm font-medium mb-2">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-secondary border-2 rounded-lg text-text-primary placeholder-text-secondary/50 
            focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300
            ${error ? 'border-error focus:border-error focus:shadow-glow-error' : 'border-secondary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Input;
