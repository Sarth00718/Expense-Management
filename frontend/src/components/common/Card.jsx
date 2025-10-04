import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false 
}) => {
  const variants = {
    default: 'bg-gradient-to-br from-secondary to-secondary/80 border border-accent/30',
    glass: 'glass-effect',
    neon: 'bg-secondary/50 neon-border',
    gradient: 'bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/50'
  };

  const hoverClass = hover ? 'hover-glow cursor-pointer' : '';

  return (
    <div className={`${variants[variant]} rounded-xl p-6 shadow-lg transition-all duration-300 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
