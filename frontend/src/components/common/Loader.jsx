import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizes[size]} border-4 border-accent/30 border-t-accent rounded-full animate-spin`}></div>
        {/* Inner ring */}
        <div className={`absolute inset-2 border-4 border-accent-secondary/30 border-b-accent-secondary rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </div>
      </div>
      {text && (
        <p className="text-text-secondary text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loader;
