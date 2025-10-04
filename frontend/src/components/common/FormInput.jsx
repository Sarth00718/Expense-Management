import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const hasError = !!error;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[#B0BEC5] mb-2"
        >
          {label}
          {required && <span className="text-[#FF3366] ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 
          bg-[#0A1929] 
          border ${hasError ? 'border-[#FF3366]' : 'border-[#1E3A5F]'}
          rounded-lg 
          text-white 
          placeholder-[#B0BEC5]/50
          focus:outline-none 
          focus:border-[#00D9FF] 
          focus:ring-2 
          focus:ring-[#00D9FF]/20
          disabled:opacity-50 
          disabled:cursor-not-allowed
          transition-all duration-300
          ${hasError ? 'shake' : ''}
        `}
        {...props}
      />
      {hasError && (
        <p className="mt-2 text-sm text-[#FF3366] flex items-center gap-1 animate-fadeIn">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
