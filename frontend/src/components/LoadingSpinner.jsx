import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 border-t-transparent rounded-full animate-spin
        `}
      />
    </div>
  );
};

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" color="blue" />
          <div className="text-white font-medium">Loading TaskFlow...</div>
          <div className="text-gray-400 text-sm">Please wait while we prepare your workspace</div>
        </div>
      </div>
    </div>
  );
};

export { LoadingSpinner, PageLoader };
export default LoadingSpinner;
