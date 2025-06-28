import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import { useFormValidation } from '../hooks/useFormValidation';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validationRules = {
    username: [
      { test: (value) => value.trim().length > 0, message: 'Username is required' },
      { test: (value) => value.length >= 3, message: 'Username must be at least 3 characters' }
    ],
    email: [
      { test: (value) => value.trim().length > 0, message: 'Email is required' },
      { test: (value) => /\S+@\S+\.\S+/.test(value), message: 'Please enter a valid email address' }
    ],
    password: [
      { test: (value) => value.length > 0, message: 'Password is required' },
      { test: (value) => value.length >= 6, message: 'Password must be at least 6 characters' }
    ],
    confirmPassword: [
      { test: (value) => value.length > 0, message: 'Please confirm your password' },
      { test: (value, data) => value === data.password, message: 'Passwords do not match' }
    ]
  };

  const { formData, errors, validate, updateField, dismissError, setErrors } = useFormValidation(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate terms
    if (!termsAccepted) {
      setErrors(prev => ({ ...prev, terms: 'You must accept the Terms of Service' }));
      return;
    }

    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please login.');
        navigate('/login');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-2xl">
        <div className="mb-6">
          <div className="flex justify-center">
            <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Sign in here
            </Link>
          </p>
        </div>

        <ErrorAlert errors={errors} 
        className="mb-4" 
        onDismiss={dismissError}
        />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            id="username"
            label="Username"
            value={formData.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="Choose a username"
            error={errors.username}
            required
          />

          <FormField
            id="email"
            label="Email address"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Enter your email"
            error={errors.email}
            required
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Create a password"
            error={errors.password}
            required
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            required
          />

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              className={`h-4 w-4 mt-0.5 text-blue-500 focus:ring-blue-500 border-gray-700 rounded bg-gray-700 ${
                errors.terms ? 'border-red-500' : ''
              }`}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-500 hover:text-blue-400">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-500 hover:text-blue-400">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or sign up with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
              </svg>
              Google
            </button>

            <button
              onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/github'}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;