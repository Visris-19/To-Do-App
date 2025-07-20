import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 text-center slide-up">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            404
          </div>
          <div className="text-2xl text-gray-400 mt-4">
            Oops! Page not found
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            This page seems to have wandered off
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white btn-primary rounded-xl transition-all duration-300"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-all duration-300"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
        
        <div className="mt-12 text-gray-500 text-sm">
          Need help? <Link to="/contact" className="text-blue-400 hover:text-blue-300">Contact our support team</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
