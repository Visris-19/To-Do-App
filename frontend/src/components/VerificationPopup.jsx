import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const VerificationPopup = ({ email, onClose, onVerified }) => {
  const [isResending, setIsResending] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Check verification status periodically
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      await checkVerificationStatus();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkInterval);
  }, [email]);

  const checkVerificationStatus = async () => {
    if (checkingVerification) return;
    
    setCheckingVerification(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/check-verification?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          toast.success('Email verified successfully!');
          onVerified();
        }
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-blue-500 text-6xl mb-4">📧</div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Verify Your Email
          </h2>
          
          <p className="text-gray-400 mb-4">
            We've sent a verification email to:
          </p>
          
          <p className="text-blue-400 font-medium mb-6 break-all">
            {email}
          </p>
          
          <p className="text-gray-400 mb-6 text-sm">
            Click the verification link in your email to activate your account. 
            We're automatically checking for verification...
          </p>

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ${
                isResending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              Continue to Login
            </button>
          </div>

          {checkingVerification && (
            <div className="mt-4 flex items-center justify-center text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
              <span className="text-sm">Checking verification status...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPopup;
