import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export default function EmailVerificationFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md"
      >
        <XCircle className="text-red-500 mx-auto mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Verification Failed</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Sorry, your email verification failed. The link may have expired or is invalid.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/auth/login')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
