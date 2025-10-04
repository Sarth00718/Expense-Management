import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  onClick, 
  className = '',
  fullWidth = false,
  size = 'md'
}) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-accent to-accent-secondary text-white hover:shadow-glow',
    secondary: 'border-2 border-accent text-accent hover:bg-accent/10 hover:shadow-glow',
    danger: 'bg-gradient-to-r from-error to-error/80 text-white hover:shadow-glow-error',
    success: 'bg-gradient-to-r from-success to-success/80 text-primary hover:shadow-glow-green',
    ghost: 'text-accent hover:bg-accent/10',
    outline: 'border-2 border-text-secondary text-text-secondary hover:border-accent hover:text-accent'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
