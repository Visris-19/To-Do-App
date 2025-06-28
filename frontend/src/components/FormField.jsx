import React from 'react';

const FormField = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false,
  className = "",
  ...props 
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md text-white bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <div className="mt-1 flex items-center text-red-400 text-xs">
          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;