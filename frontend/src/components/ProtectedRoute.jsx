import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the intended destination
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return <Outlet />; // Use Outlet to render nested routes
};

export default ProtectedRoute;