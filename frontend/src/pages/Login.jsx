import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import SocialAuth from '../components/SocialAuth';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFormErrors({
        email: emailError,
        password: passwordError
      });
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      console.log('Error details:', {
    message: error?.message,
    response: error?.response,
    request: error?.request,
    errorType: typeof error
  });
      // Enhanced error handling
      if (error?.response) {
        
        switch (error.response.status) {
          case 401:
            // Check specifically for invalid password
            if (error.response.data?.message === 'invalid_password') {
              setError('Invalid password. Please try again.');
              setFormErrors(prev => ({
                ...prev,
                password: 'Wrong password'
              }));
              toast.error('Wrong password');
            }
            // Check for non-existent email
            else if (error.response.data?.message === 'email_not_found') {
              setError('Email not found. Please check your email or sign up.');
              setFormErrors(prev => ({
                ...prev,
                email: 'Email not found'
              }));
              toast.error('Email not found');
            }
            // Generic authentication error
            else {
              setError('Invalid email or password combination');
              toast.error('Invalid credentials');
            }
            break;
          case 404:
            setError('Account not found. Would you like to create one?');
            toast.error('Account not found', {
              action: {
                label: 'Sign Up',
                onClick: () => navigate('/register')
              }
            });
            break;
          case 429:
            setError('Too many failed attempts. Please try again in a few minutes.');
            toast.error('Too many attempts');
            break;
          case 403:
            setError('Account is locked. Please reset your password.');
            toast.error('Account locked', {
              action: {
                label: 'Reset Password',
                onClick: () => navigate('/reset-password')
              }
            });
            break;
          default:
            setError('Login failed. Please try again');
            toast.error('Login failed');
        }
      } else if (error.request) {
        setError('Unable to connect to server. Please check your internet connection.');
        toast.error('Connection error');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again later.');
        toast.error('Error occurred');
      }

      // Clear password field on error
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  // Clear field-specific error when user types
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
        {/* Logo and Title */}
        <div className="mb-6">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-3 border ${
                formErrors.email ? 'border-red-500' : 'border-gray-700'
              } placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm`}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-700'
                } placeholder-gray-500 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm pr-10`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <SocialAuth />
        <div className="mt-6 border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-400">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="font-medium text-blue-500 hover:text-blue-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-blue-500 hover:text-blue-400">
              Privacy Policy
            </Link>
          </p>
          </div>
      </div>
    </div>
  )
}

export default Login