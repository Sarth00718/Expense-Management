import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, message = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-[#1E3A5F] border-t-[#00D9FF] rounded-full animate-spin`}
        ></div>
        <div
          className={`${sizeClasses[size]} border-4 border-transparent border-t-[#7B61FF] rounded-full animate-spin absolute top-0 left-0`}
          style={{ animationDirection: 'reverse', animationDuration: '1s' }}
        ></div>
      </div>
      {message && (
        <p className="text-[#B0BEC5] text-sm animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0A1929]/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
