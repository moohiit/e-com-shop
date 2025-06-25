// pages/VerifyNotice.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResendVerificationMutation } from '../../features/auth/authApi';

export default function VerifyNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  const handleResend = async () => {
    try {
      await resendVerification({ email }).unwrap();
      toast.success('Verification email resent!');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || 'Failed to resend verification');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-4">A verification link has been sent to <strong>{email}</strong>.</p>
      <p className="mb-6">Please check your email to verify your account.</p>
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        {isLoading ? 'Resending...' : 'Resend Verification Email'}
      </button>
      <button
        onClick={() => navigate('/auth/login')}
        className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
      >
        Back to Login
      </button>
    </div>
  );
}
