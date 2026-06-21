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
  icon = null,
  rightIcon = null,
  onRightIconClick = null,
  className = ''
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
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-3 bg-secondary border-2 rounded-lg text-text-primary placeholder-text-secondary/50 
            focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300
            ${error ? 'border-error focus:border-error focus:shadow-glow-error' : 'border-secondary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}`}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-secondary/50"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default Input;
