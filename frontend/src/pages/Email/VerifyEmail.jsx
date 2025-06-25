import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useVerifyEmailMutation } from '../../features/auth/authApi';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token).unwrap();
        toast.success('Email verified successfully!');
        navigate('/email-verified-success');
      } catch (error) {
        toast.error(error?.data?.message || 'Verification failed');
        navigate('/email-verification-failed');
      }
    };

    if (token) verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center"
      >
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verifying Email...</h1>
        <p className="text-gray-600 dark:text-gray-300">Please wait while we verify your account.</p>
      </motion.div>
    </div>
  );
}
