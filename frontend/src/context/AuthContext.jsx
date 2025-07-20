import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add this line
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific email verification error
        if (data.message === 'email_not_verified') {
          throw new Error('Please verify your email before logging in. Check your inbox or resend verification email.');
        }
        throw new Error(data.details || data.message || 'Login failed');
      }

      // Set initial user data from login response
      setUser(data.user);
      
      // Fetch complete profile data including avatar
      const profileResponse = await fetch('http://localhost:5000/api/v2/profile', {
        credentials: 'include'
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(prev => ({
          ...prev,
          avatar: profileData.avatar
        }));
      }

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  // const logout = async () => {
  //   try {
  //     await fetch('http://localhost:5000/api/v1/logout', {
  //       method: 'POST',
  //       credentials: 'include',
  //       headers: {
  //       'Content-Type': 'application/json'
  //     }
  //     });
  //     setUser(null);
  //     navigate('/');
  //     toast.success('Logged out successfully');
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //     toast.error('Logout failed');
  //   }
  // };
  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const updateUserData = (data) => {
    setUser(prev => ({
      ...prev,
      ...data
    }));
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v2/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        // User not authenticated - this is normal for initial page load
        setUser(null);
      } else {
        console.error('Auth check failed:', response.status);
        setUser(null);
      }
    } catch (error) {
      // Handle network errors gracefully (server might be starting up)
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        console.log('Backend server not ready yet');
        // Don't retry automatically to avoid endless loops
      } else {
        console.error('Auth check failed:', error);
      }
      setUser(null);
    }
    finally {
      setLoading(false); // Set loading to false after auth check
    }
  };

  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user,
      loading, 
      login, 
      logout, 
      updateUserData,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};