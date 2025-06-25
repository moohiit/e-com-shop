import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function EmailVerifiedSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md"
      >
        <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Email Verified!</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Your email has been successfully verified. You can now log in to your account.
        </p>

        <button
          onClick={() => navigate('/auth/login')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
}
