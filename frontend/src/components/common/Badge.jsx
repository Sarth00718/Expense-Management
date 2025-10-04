import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-text-secondary/20 text-text-secondary border-text-secondary',
    primary: 'bg-accent/20 text-accent border-accent',
    secondary: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary',
    success: 'bg-success/20 text-success border-success',
    warning: 'bg-warning/20 text-warning border-warning',
    error: 'bg-error/20 text-error border-error',
    draft: 'bg-text-secondary/20 text-text-secondary border-text-secondary',
    pending: 'bg-warning/20 text-warning border-warning',
    approved: 'bg-success/20 text-success border-success',
    rejected: 'bg-error/20 text-error border-error'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full border font-medium transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
