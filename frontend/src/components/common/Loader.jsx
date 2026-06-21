import React from 'react';

const Loader = ({ size = 'md', text = '', message = '', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const displayText = message || text;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizes[size]} border-4 border-secondary border-t-accent rounded-full animate-spin`}></div>
        {/* Inner ring */}
        <div className={`${sizes[size]} border-4 border-transparent border-t-accent-secondary rounded-full animate-spin absolute top-0 left-0`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      {displayText && (
        <p className="text-text-secondary text-sm animate-pulse">{displayText}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
