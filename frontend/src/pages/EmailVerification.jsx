import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const data = await response.text();
        setError(data || 'Verification failed');
        toast.error('Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          {verifying ? (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          ) : verified ? (
            <div className="text-green-500 text-6xl mb-4">✓</div>
          ) : (
            <div className="text-red-500 text-6xl mb-4">✗</div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {verifying ? 'Verifying Email...' : verified ? 'Email Verified!' : 'Verification Failed'}
        </h1>

        {verifying && (
          <p className="text-gray-400">Please wait while we verify your email address.</p>
        )}

        {verified && (
          <div>
            <p className="text-gray-400 mb-4">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login page in 3 seconds...</p>
          </div>
        )}

        {error && (
          <div>
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/resend-verification')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
